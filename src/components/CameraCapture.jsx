import React, { useState, useRef } from 'react';
import { Camera, Loader2, Image as ImageIcon } from 'lucide-react';
import { uploadPhoto } from '../services/storage';

export default function CameraCapture({ eventId, userId }) {
  const [uploadState, setUploadState] = useState({ uploading: false, done: 0, total: 0 });
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const handleCameraClick = () => cameraInputRef.current?.click();
  const handleGalleryClick = () => galleryInputRef.current?.click();

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    event.target.value = '';

    const currentUserId = userId || 'anonymous';
    setUploadState({ uploading: true, done: 0, total: files.length });

    for (let i = 0; i < files.length; i++) {
      try {
        await uploadPhoto(eventId, files[i], currentUserId);
      } catch (error) {
        console.error("Upload failed for", files[i].name, error);
      }
      setUploadState({ uploading: true, done: i + 1, total: files.length });
    }

    setUploadState({ uploading: false, done: 0, total: 0 });
  };

  const { uploading, done, total } = uploadState;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center justify-center gap-4 z-50 bg-theme-2/80 backdrop-blur-md p-3 rounded-full border border-theme-3/20 shadow-2xl">

      {/* Camera input — single file */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        ref={cameraInputRef}
        onChange={handleFileChange}
        disabled={uploading}
      />

      {/* Gallery input — multiple enabled */}
      <input
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        ref={galleryInputRef}
        onChange={handleFileChange}
        disabled={uploading}
      />

      {uploading ? (
        <div className="flex items-center gap-3 px-6 py-2">
          <Loader2 className="w-8 h-8 animate-spin text-theme-3" />
          <span className="text-theme-4 font-bold">
            {total > 1 ? `Uploading ${done}/${total}...` : 'Uploading...'}
          </span>
        </div>
      ) : (
        <>
          <button
            onClick={handleGalleryClick}
            disabled={uploading}
            title="Upload from Gallery"
            className="bg-theme-1 hover:bg-theme-1/80 text-theme-4 border border-theme-3/20 rounded-full p-4 shadow-sm flex items-center justify-center transition-all disabled:opacity-50 transform hover:scale-105 active:scale-95"
          >
            <ImageIcon className="w-6 h-6" />
          </button>

          <button
            onClick={handleCameraClick}
            disabled={uploading}
            title="Take Photo"
            className="bg-theme-3 hover:bg-theme-4 text-theme-1 rounded-full p-4 shadow-lg flex items-center justify-center transition-all disabled:opacity-50 transform hover:scale-105 active:scale-95"
          >
            <Camera className="w-8 h-8" />
          </button>
        </>
      )}
    </div>
  );
}