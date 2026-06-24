import { useEffect, useState, useRef } from 'react';
import { Camera, Check, Image as ImageIcon, Loader2, Pencil, UserRound, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { updateDisplayName, uploadPhoto } from '../services/storage';

export default function CameraCapture({ eventId, guestId, isCreator }) {
  const [uploadState, setUploadState] = useState({ uploading: false, done: 0, total: 0 });
  const displayNameStorageKey = eventId && guestId ? `arc-display-name-${eventId}-${guestId}` : '';
  const [displayName, setDisplayName] = useState(() => {
    if (!displayNameStorageKey) return '';
    return window.localStorage.getItem(displayNameStorageKey) || '';
  });
  const [nameDraft, setNameDraft] = useState(displayName);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameMessage, setNameMessage] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const { uploading, done, total } = uploadState;

  useEffect(() => {
    if (!displayNameStorageKey) return;

    const savedDisplayName = displayName.trim();
    if (savedDisplayName) {
      window.localStorage.setItem(displayNameStorageKey, savedDisplayName);
    } else {
      window.localStorage.removeItem(displayNameStorageKey);
    }
  }, [displayName, displayNameStorageKey]);

  const getNameErrorMessage = (error) => {
    const message = error?.message || '';
    if (message.toLowerCase().includes('24 hours')) {
      return 'Name locked: wait 24 hours before changing it again.';
    }
    return message || 'Could not update your display name.';
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  const handleGalleryClick = () => {
    galleryInputRef.current?.click();
  };

  const handleStartNameEdit = () => {
    setNameDraft(displayName);
    setNameMessage('');
    setUploadMessage('');
    setIsEditingName(true);
  };

  const handleCancelNameEdit = () => {
    setNameDraft(displayName);
    setIsEditingName(false);
  };

  const handleSaveDisplayName = async () => {
    const nextDisplayName = nameDraft.trim();

    if (!nextDisplayName) {
      setNameMessage('Enter a display name first.');
      return;
    }

    if (nextDisplayName === displayName.trim()) {
      setIsEditingName(false);
      return;
    }

    try {
      setIsSavingName(true);
      setNameMessage('');
      const savedDisplayName = await updateDisplayName(eventId, guestId, nextDisplayName, { isCreator });
      setDisplayName(savedDisplayName);
      setNameDraft(savedDisplayName);
      setIsEditingName(false);
      toast.success('Display name updated');
    } catch (error) {
      console.error('Display name update failed', error);
      setNameMessage(getNameErrorMessage(error));
    } finally {
      setIsSavingName(false);
    }
  };

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    event.target.value = '';
    setUploadState({ uploading: true, done: 0, total: files.length });
    setUploadMessage('');

    let failedUploads = 0;

    for (let i = 0; i < files.length; i += 1) {
      try {
        await uploadPhoto(eventId, files[i], {
          displayName,
          guestId,
          isCreator,
        });
      } catch (error) {
        failedUploads += 1;
        console.error('Upload failed for', files[i].name, error);
        setUploadMessage(error.message || 'Some photos failed to upload.');
      }

      setUploadState({ uploading: true, done: i + 1, total: files.length });
    }

    setUploadState({ uploading: false, done: 0, total: 0 });

    if (failedUploads === 0) {
      toast.success(files.length === 1 ? 'Photo uploaded!' : `${files.length} photos uploaded!`);
    } else {
      toast.error(`${failedUploads} upload${failedUploads === 1 ? '' : 's'} failed`);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-theme-2/90 backdrop-blur-md px-4 py-3 rounded-2xl border border-theme-3/20 shadow-2xl w-[min(92vw,430px)]">
      <input
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        ref={cameraInputRef}
        onChange={handleFileChange}
        disabled={uploading}
      />

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
        <div className="flex items-center justify-center gap-3 px-6 py-2">
          <Loader2 className="w-8 h-8 animate-spin text-theme-3" />
          <span className="text-theme-4 font-bold">
            {total > 1 ? `Uploading ${done}/${total}...` : 'Uploading...'}
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {isEditingName && (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveDisplayName();
                  if (e.key === 'Escape') handleCancelNameEdit();
                }}
                placeholder={`Display name (${guestId || 'Guest'})`}
                className="min-w-0 flex-1 bg-theme-1 border border-theme-3/30 text-theme-4 placeholder:text-theme-4/50 rounded-lg px-4 py-2 focus:ring-2 focus:ring-theme-3 focus:border-theme-3 outline-none transition-all"
                disabled={isSavingName}
                maxLength={60}
                autoFocus
              />
              <button
                onClick={handleSaveDisplayName}
                disabled={isSavingName}
                title="Save display name"
                className="bg-theme-3 hover:bg-theme-4 text-theme-1 rounded-full p-3 shadow-sm flex items-center justify-center transition-all disabled:opacity-50"
              >
                {isSavingName ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
              </button>
              <button
                onClick={handleCancelNameEdit}
                disabled={isSavingName}
                title="Cancel"
                className="bg-theme-1 hover:bg-theme-1/80 text-theme-4 border border-theme-3/20 rounded-full p-3 shadow-sm flex items-center justify-center transition-all disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
          {nameMessage && (
            <p className="text-sm text-red-100 bg-red-500/20 border border-red-300/20 rounded-lg px-3 py-2">
              {nameMessage}
            </p>
          )}
          {uploadMessage && (
            <p className="text-sm text-red-100 bg-red-500/20 border border-red-300/20 rounded-lg px-3 py-2">
              {uploadMessage}
            </p>
          )}
          <div className="flex items-center justify-center gap-3">
            {!isEditingName && (
              <button
                onClick={handleStartNameEdit}
                disabled={uploading}
                title={displayName ? `Display name: ${displayName}` : 'Set display name'}
                className="h-14 min-w-0 max-w-[170px] bg-theme-1 hover:bg-theme-1/80 text-theme-4 border border-theme-3/20 rounded-full px-4 shadow-sm flex items-center gap-2 justify-center transition-all disabled:opacity-50 transform hover:scale-105 active:scale-95"
              >
                {displayName ? <UserRound className="w-5 h-5 shrink-0" /> : <Pencil className="w-5 h-5 shrink-0" />}
                <span className="text-sm font-bold truncate">{displayName || 'Name'}</span>
              </button>
            )}
            <button
              onClick={handleGalleryClick}
              disabled={uploading}
              title="Upload from Gallery"
              className="w-14 h-14 bg-theme-1 hover:bg-theme-1/80 text-theme-4 border border-theme-3/20 rounded-full shadow-sm flex items-center justify-center transition-all disabled:opacity-50 transform hover:scale-105 active:scale-95"
            >
              <ImageIcon className="w-5 h-5" />
            </button>

            <button
              onClick={handleCameraClick}
              disabled={uploading}
              title="Take Photo"
              className="w-14 h-14 bg-theme-3 hover:bg-theme-4 text-theme-1 rounded-full shadow-lg flex items-center justify-center transition-all disabled:opacity-50 transform hover:scale-105 active:scale-95"
            >
              <Camera className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
