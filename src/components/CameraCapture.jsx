import { useState, useRef } from 'react';
import { Camera, Loader2, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadPhoto } from '../services/storage';

export default function CameraCapture({ eventId, guestId }) {
  const [isUploading, setIsUploading] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');
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
      setUploadMessage('');
      await toast.promise(
        uploadPhoto(eventId, file, {
          displayName,
          guestId,
        }),
        {
          loading: 'Uploading photo...',
          success: 'Photo uploaded!',
          error: (error) => error.message || 'Photo upload failed',
        }
      );
    } catch (error) {
      console.error("Upload failed", error);
      setUploadMessage(error.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-theme-2/90 backdrop-blur-md p-3 rounded-2xl border border-theme-3/20 shadow-2xl w-[min(92vw,460px)]">
      
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
        <div className="flex items-center justify-center gap-3 px-6 py-2">
          <Loader2 className="w-8 h-8 animate-spin text-theme-3" />
          <span className="text-theme-4 font-bold">Uploading...</span>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder={`Display name (${guestId || 'Guest'})`}
            className="w-full bg-theme-1 border border-theme-3/30 text-theme-4 placeholder:text-theme-4/50 rounded-lg px-4 py-2 focus:ring-2 focus:ring-theme-3 focus:border-theme-3 outline-none transition-all"
            disabled={isUploading}
            maxLength={60}
          />
          {uploadMessage && (
            <p className="text-sm text-red-100 bg-red-500/20 border border-red-300/20 rounded-lg px-3 py-2">
              {uploadMessage}
            </p>
          )}
          <div className="flex items-center justify-center gap-4">
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
          </div>
        </div>
      )}
    </div>
  );
}
