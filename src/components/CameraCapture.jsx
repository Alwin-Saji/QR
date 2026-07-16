import { useEffect, useState, useRef } from 'react';
import { Camera, Check, Image as ImageIcon, Loader2, Pencil, UserRound, X, WifiOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { updateDisplayName, uploadPhoto } from '../services/storage';
import ImageFilterStep from './ImageFilterStep';
import { useSync } from '../contexts/SyncContext';

export default function CameraCapture({ eventId, guestId, isCreator }) {
  const [uploadState, setUploadState] = useState({ uploading: false, done: 0, total: 0 });
  const { isOnline, queueCount, downloadQueueCount, syncing, notifyItemQueued } = useSync();
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
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-white backdrop-blur-md px-4 py-3 rounded-full border border-[#050505]/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] w-fit transition-all">
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
        <div className="flex flex-col items-center gap-1 mb-3 text-xs relative z-10">
          {syncing ? (
            <div className="flex items-center justify-center gap-2 bg-[#050505]/5 text-[#050505] px-3 py-1.5 rounded-full border border-[#050505]/10">
              <Loader2 className="w-3 h-3 animate-spin" />
              Syncing...
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center gap-3 bg-[#050505]/5 text-[#050505] px-3 py-1.5 rounded-full border border-[#050505]/10">
                <WifiOff className="w-3 h-3 shrink-0" />
                {!isOnline && <span>Offline</span>}
                {queueCount > 0 && <span>{queueCount} upload{queueCount !== 1 ? 's' : ''} queued</span>}
                {queueCount > 0 && downloadQueueCount > 0 && <span className="text-[#050505]/30">•</span>}
                {downloadQueueCount > 0 && <span>{downloadQueueCount} download{downloadQueueCount !== 1 ? 's' : ''} queued</span>}
              </div>
              {isOnline && queueCount === 0 && downloadQueueCount === 0 && null}
            </>
          )}
        </div>
      )}

      {uploading ? (
        <div className="flex items-center justify-center gap-3 px-6 py-2 relative z-10">
          <Loader2 className="w-6 h-6 animate-spin text-[#050505]" />
          <span className="text-[#050505] font-bold text-sm tracking-wide">
            {total > 1 ? `Uploading ${done}/${total}...` : 'Uploading...'}
          </span>
        </div>
      ) : (
        <div className="flex items-center justify-between relative z-10 w-[240px] sm:w-[260px] h-12">
          {isEditingName ? (
            <div className="flex items-center gap-2 w-full h-full animate-in slide-in-from-left-4 duration-300">
              <input
                type="text"
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveDisplayName();
                  if (e.key === 'Escape') handleCancelNameEdit();
                }}
                placeholder={`Name (${guestId || 'Guest'})`}
                className="min-w-0 flex-1 bg-transparent border-b-2 border-[#050505]/20 text-[#050505] placeholder:text-[#050505]/40 px-2 py-2 focus:ring-0 focus:border-[#050505] outline-none transition-all text-sm font-medium"
                disabled={isSavingName}
                maxLength={60}
                autoFocus
              />
              <button
                onClick={handleSaveDisplayName}
                disabled={isSavingName}
                title="Save display name"
                className="bg-[#050505] hover:bg-[#050505]/80 text-white rounded-full w-10 h-10 shrink-0 shadow-sm flex items-center justify-center transition-all disabled:opacity-50"
              >
                {isSavingName ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              </button>
              <button
                onClick={handleCancelNameEdit}
                disabled={isSavingName}
                title="Cancel"
                className="bg-transparent hover:bg-[#050505]/5 text-[#050505] border border-[#050505]/20 rounded-full w-10 h-10 shrink-0 flex items-center justify-center transition-all disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full h-full">
              <button
                onClick={handleStartNameEdit}
                disabled={uploading}
                title={displayName ? `Display name: ${displayName}` : 'Set display name'}
                className="h-12 flex-1 min-w-0 bg-transparent hover:bg-[#050505]/5 text-[#050505] rounded-full px-4 flex items-center gap-2 justify-start transition-all disabled:opacity-50 border border-transparent hover:border-[#050505]/10"
              >
                {displayName ? <UserRound className="w-4 h-4 shrink-0 opacity-50" /> : <Pencil className="w-4 h-4 shrink-0 opacity-50" />}
                <span className="text-sm font-medium truncate">{displayName || 'Name'}</span>
              </button>

              <div className="flex items-center gap-2 shrink-0">
                <div className="w-[1px] h-6 bg-[#050505]/10 mx-1"></div>

                <button
                  onClick={handleGalleryClick}
                  disabled={uploading}
                  title="Upload from Gallery"
                  className="w-12 h-12 bg-transparent hover:bg-[#050505]/5 text-[#050505] rounded-full flex items-center justify-center transition-all disabled:opacity-50 transform hover:scale-105 active:scale-95"
                >
                  <ImageIcon className="w-5 h-5 opacity-80" />
                </button>

                <button
                  onClick={handleCameraClick}
                  disabled={uploading}
                  title="Take Photo"
                  className="w-12 h-12 bg-[#050505] hover:bg-[#050505]/90 text-white rounded-full shadow-md flex items-center justify-center transition-all disabled:opacity-50 transform hover:scale-105 active:scale-95 ml-1"
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}