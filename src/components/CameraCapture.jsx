import React, { useState, useRef } from 'react';
import { Camera, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { uploadPhoto } from '../services/storage';

export default function CameraCapture({ eventId, userId }) {
  const [isUploading, setIsUploading] = useState(false);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  const handleGalleryClick = () => {
    galleryInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      await uploadPhoto(eventId, file, userId || 'anonymous');
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center justify-center gap-4 z-50 bg-theme-2/80 backdrop-blur-md p-3 rounded-full border border-theme-3/20 shadow-2xl">
      
      {/* Hidden input for Camera */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        ref={cameraInputRef}
        onChange={handleFileChange}
        disabled={isUploading}
      />

      {/* Hidden input for File Storage / Gallery */}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={galleryInputRef}
        onChange={handleFileChange}
        disabled={isUploading}
      />

      {isUploading ? (
        <div className="flex items-center gap-3 px-6 py-2">
          <Loader2 className="w-8 h-8 animate-spin text-theme-3" />
          <span className="text-theme-4 font-bold">Uploading...</span>
        </div>
      ) : (
        <>
          <button
            onClick={handleGalleryClick}
            disabled={isUploading}
            title="Upload from Storage"
            className="bg-theme-1 hover:bg-theme-1/80 text-theme-4 border border-theme-3/20 rounded-full p-4 shadow-sm flex items-center justify-center transition-all disabled:opacity-50 transform hover:scale-105 active:scale-95"
          >
            <ImageIcon className="w-6 h-6" />
          </button>
          
          <button
            onClick={handleCameraClick}
            disabled={isUploading}
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
