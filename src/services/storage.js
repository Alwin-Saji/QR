import imageCompression from 'browser-image-compression';
import { supabase } from './supabase';
import { savePhotoToQueue,saveDownloadToQueue } from './offlineQueue';

export const compressImage = async (file) => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: false,
  };
  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error('Error compressing image:', error);
    return file; // Fallback to original
  }
};

export const updateDisplayName = async (eventId, guestId, displayName, options = {}) => {
  const nextDisplayName = displayName?.trim();

  if (!nextDisplayName) {
    throw new Error('Enter a display name first.');
  }

  const { data, error } = await supabase.rpc('refresh_uploader_display_name', {
    p_event_id: eventId,
    p_uploader_id: guestId,
    p_display_name: nextDisplayName,
    p_is_creator: Boolean(options.isCreator),
  });

  if (error) {
    console.error('Display name refresh failed:', error);
    throw error;
  }

  return data?.trim() || nextDisplayName;
};

export const uploadPhoto = async (eventId, file, uploader, options = {}) => {
  let uploadedBy = uploader?.displayName?.trim() || uploader?.guestId || 'Guest';
  const uploaderId = uploader?.guestId || uploadedBy;

  if (!navigator.onLine) {
    if (!options.preventRequeue) {
      console.log("Offline mode detected. Saving photo to queue.");
      await savePhotoToQueue({ eventId, file, uploader });
    }
    return { offline: true };
  }

  try {
    const shouldRefreshDisplayName = Boolean(uploader?.displayName?.trim() && uploaderId);

    const { data: restriction, error: restrictionError } = await supabase
      .from('restricted_uploaders')
      .select('id')
      .eq('event_id', eventId)
      .eq('uploader_id', uploaderId)
      .maybeSingle();

    if (restrictionError) {
      console.error('Restriction check failed:', restrictionError);
      throw restrictionError;
    }

    if (restriction) {
      throw new Error('This guest has been restricted from uploading more photos.');
    }

    if (shouldRefreshDisplayName) {
      uploadedBy = await updateDisplayName(eventId, uploaderId, uploadedBy, {
        isCreator: uploader?.isCreator,
      });
    }

    const compressedFile = await compressImage(file);
    const fileName = `${Date.now()}_${compressedFile.name}`;
    const filePath = `${eventId}/${fileName}`;

    const authRes = await fetch('/api/imagekit-auth');
    if (!authRes.ok) {
      throw new Error('Failed to fetch ImageKit authentication parameters');
    }
    const authData = await authRes.json();

    const formData = new FormData();
    formData.append("file", compressedFile);
    formData.append("publicKey", import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY);
    formData.append("signature", authData.signature);
    formData.append("expire", authData.expire);
    formData.append("token", authData.token);
    formData.append("fileName", fileName);
    formData.append("folder", `/events/${eventId}`);
    
    const uploadRes = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
      method: "POST",
      body: formData
    });

    if (!uploadRes.ok) {
      const errorData = await uploadRes.json();
      console.error('ImageKit Upload failed:', errorData);
      throw new Error(errorData.message || 'ImageKit upload failed');
    }

    const uploadData = await uploadRes.json();
    const downloadURL = uploadData.url;

    // Check if event has auto_delete enabled
    const { data: eventData } = await supabase
      .from('events')
      .select('auto_delete')
      .eq('id', eventId)
      .single();

    let expiresAtStr = null;
    if (eventData && eventData.auto_delete) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 1);
      expiresAtStr = expiresAt.toISOString();
    }

    // Insert record into Supabase Database
    const { data: dbData, error: dbError } = await supabase
      .from('photos')
      .insert([
        {
          event_id: eventId,
          url: downloadURL,
          uploaded_by: uploadedBy,
          uploader_id: uploaderId,
          expires_at: expiresAtStr,
        }
      ])
      .select()
      .single();

    if (dbError) {
      console.error('Database record failed:', dbError);
      throw dbError;
    }

    return { id: dbData.id, url: dbData.url };
  } catch (error) {
    if (error.message === 'Failed to fetch' || !navigator.onLine) {
      if (!options.preventRequeue) {
        console.log("Network error. Saving photo to offline queue.");
        await savePhotoToQueue({ eventId, file, uploader });
      }
      return { offline: true };
    }
    throw error;
  }
};

export const downloadPhoto = async (url,filename) => {

  if(!navigator.onLine) {
    console.log("Offline mode detected. saving download to queue")
    await saveDownloadToQueue({url,filename})
    return {offline:true};
  }

  try {
    const res = await fetch(url)
    const blob = await res.blob()
    const blobUrl = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(blobUrl);
  }
  catch (error) {
    console.error("Download failed:", error);
    // If it fails due to a network drop mid-download, queue it just in case
    if (!navigator.onLine) {
      await saveDownloadToQueue({ url, filename });
      return { offline: true };
    }
    throw error;

}
};
