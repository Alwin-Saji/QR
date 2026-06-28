import { useEffect, useState, useRef } from 'react';
import { Camera, Check, Image as ImageIcon, Loader2, Pencil, UserRound, X, WifiOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { updateDisplayName, uploadPhoto } from '../services/storage';
import ImageFilterStep from './ImageFilterStep';
import { useSync } from '../contexts/SyncContext';

export default function CameraCapture({ eventId, guestId, isCreator }) {
  const [uploadState, setUploadState] = useState({ uploading: false, done: 0, total: 0 });
  const { isOnline, queueCount,downloadQueueCount, syncing, notifyItemQueued } = useSync();
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
  
  // 💡 Structural fix: We track state only for the modal visibility and the raw binary file asset
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);

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

    if (files.length > 1) {
      processAndUploadFiles(files);
    } else {
      // Single photo configuration: pass the baseline file and toggle the view modal
      const targetFile = files[0];
      setPendingFile(targetFile);
      setShowFilterModal(true);
    }
  };

  const processAndUploadFiles = async (filesToUpload) => {
    setUploadState({ uploading: true, done: 0, total: filesToUpload.length });
    setUploadMessage('');

    let failedUploads = 0;

    for (let i = 0; i < filesToUpload.length; i += 1) {
      try {
        const result = await uploadPhoto(eventId, filesToUpload[i], {
          displayName,
          guestId,
          isCreator,
        });
        if (result?.offline) {
          notifyItemQueued();
        }
      } catch (error) {
        failedUploads += 1;
        console.error('Upload failed for', filesToUpload[i].name, error);
        setUploadMessage(error.message || 'Some photos failed to upload.');
      }

      setUploadState({ uploading: true, done: i + 1, total: filesToUpload.length });
    }

    setUploadState({ uploading: false, done: 0, total: 0 });

    if (failedUploads === 0) {
      if (!isOnline) {
        toast.success(filesToUpload.length === 1 ? 'Photo saved to queue!' : `${filesToUpload.length} photos saved to queue!`);
      } else {
        toast.success(filesToUpload.length === 1 ? 'Photo uploaded!' : `${filesToUpload.length} photos uploaded!`);
      }
    } else {
      toast.error(`${failedUploads} upload${failedUploads === 1 ? '' : 's'} failed`);
    }
  };

  const handleFilterCancel = () => {
    setShowFilterModal(false);
    setPendingFile(null);
  };

  // 💡 FIX: ImageFilterStep applies options locally and returns the fully processed binary blob object directly to this callback
  const handleFilterConfirm = async (processedBlob) => {
    try {
      // Cast the final binary stream safely back into standard file descriptor formatting structure
      const fileToSubmit = new File([processedBlob], pendingFile.name, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });

      setShowFilterModal(false);
      setPendingFile(null);

      // Instantly hand it over to the cloud storage uploader queue
      await processAndUploadFiles([fileToSubmit]);
    } catch (error) {
      console.error("Failed to process customized picture selection:", error);
      toast.error("Could not upload customized photo.");
    }
  };

  // Render the Modal view when active
  if (showFilterModal && pendingFile) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
        <ImageFilterStep 
          originalFile={pendingFile} 
          onApply={handleFilterConfirm} 
          onCancel={handleFilterCancel} 
        />
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-theme-2/90 backdrop-blur-md px-4 py-3 rounded-4xl border border-theme-3/20 shadow-2xl w-fit">
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

            {(!isOnline || queueCount > 0 || downloadQueueCount > 0) && (
        <div className="flex flex-col items-center gap-1 mb-3 text-xs">
          {syncing ? (
            <div className="flex items-center justify-center gap-2 bg-yellow-500/20 text-yellow-200 px-3 py-1.5 rounded-full border border-yellow-500/30">
              <Loader2 className="w-3 h-3 animate-spin" />
              Syncing...
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center gap-3 bg-yellow-500/20 text-yellow-200 px-3 py-1.5 rounded-full border border-yellow-500/30">
                <WifiOff className="w-3 h-3 shrink-0" />
                {!isOnline && <span>Offline</span>}
                {queueCount > 0 && <span>{queueCount} upload{queueCount !== 1 ? 's' : ''} queued</span>}
                {queueCount > 0 && downloadQueueCount > 0 && <span className="text-yellow-300/50">•</span>}
                {downloadQueueCount > 0 && <span>{downloadQueueCount} download{downloadQueueCount !== 1 ? 's' : ''} queued</span>}
              </div>
              {isOnline && queueCount === 0 && downloadQueueCount === 0 && null}
            </>
          )}
        </div>
      )}

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