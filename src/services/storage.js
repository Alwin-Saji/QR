import imageCompression from 'browser-image-compression';
import { supabase } from './supabase';

export const compressImage = async (file) => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };
  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error('Error compressing image:', error);
    return file; // Fallback to original
  }
};

export const uploadPhoto = async (eventId, file, uploaderId) => {
  const compressedFile = await compressImage(file);
  const fileName = `${Date.now()}_${compressedFile.name}`;
  const filePath = `${eventId}/${fileName}`;

  // Upload to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase
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
        uploaded_by: uploaderId,
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
};
