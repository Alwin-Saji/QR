import imageCompression from 'browser-image-compression';
import { supabase } from './supabase';
import { savePhotoToQueue } from './offlineQueue';

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

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase
      .storage
      .from('events')
      .upload(filePath, compressedFile);

    if (uploadError) {
      console.error('Upload failed:', uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: publicUrlData } = supabase
      .storage
      .from('events')
      .getPublicUrl(filePath);

    const downloadURL = publicUrlData.publicUrl;

    // 1-day TTL
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1);

    // Insert record into Supabase Database
    const { data: dbData, error: dbError } = await supabase
      .from('photos')
      .insert([
        {
          event_id: eventId,
          url: downloadURL,
          uploaded_by: uploadedBy,
          uploader_id: uploaderId,
          expires_at: expiresAt.toISOString(),
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
