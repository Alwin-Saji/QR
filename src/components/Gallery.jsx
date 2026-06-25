import { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../services/supabase';
import { QRCodeSVG } from 'qrcode.react';
import { Download, QrCode, X, Trash2, CheckCircle2, Ban } from 'lucide-react';
import PhotoLightbox from './PhotoLightbox';

export default function Gallery({ eventId, eventName, isCreator, currentUploaderId }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhotoForQR, setSelectedPhotoForQR] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [restrictionTarget, setRestrictionTarget] = useState(null);
  const [removeRestrictedPhotos, setRemoveRestrictedPhotos] = useState(false);
  const [isRestricting, setIsRestricting] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [draggedPhotoId, setDraggedPhotoId] = useState(null);
  const [isDragDeleting, setIsDragDeleting] = useState(false);
  const loaderRef = useRef(null);
  const LIMIT = 50;

  useEffect(() => {
    if (!eventId) return;

    const fetchPhotos = async (pageNum = 0) => {
      if (pageNum === 0) setLoading(true);
      else setLoadingMore(true);

      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })
        .range(pageNum * LIMIT, (pageNum + 1) * LIMIT - 1);

      if (error) {
        console.error("Error fetching photos: ", error);
      } else {
        setPhotos(prev => pageNum === 0 ? (data || []) : [...prev, ...(data || [])]);
        if (!data || data.length < LIMIT) setHasMore(false);
      }

      if (pageNum === 0) setLoading(false);
      else setLoadingMore(false);
    };

    Promise.resolve().then(() => {
      setPage(0);
      setHasMore(true);
    });
    fetchPhotos(0);

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'photos',
          filter: `event_id=eq.${eventId}`
        },
        (payload) => {
          setPhotos((current) => [payload.new, ...current]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'photos',
          filter: `event_id=eq.${eventId}`
        },
        (payload) => {
          setPhotos((current) => current.map((photo) => (
            photo.id === payload.new.id ? payload.new : photo
          )));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'photos'
        },
        (payload) => {
          setPhotos((current) => current.filter(p => p.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  useEffect(() => {
    if (!hasMore || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    const current = loaderRef.current;
    if (current) observer.observe(current);
    return () => { if (current) observer.unobserve(current); };
  }, [hasMore, loadingMore]);

  useEffect(() => {
    if (page === 0) return;
    const fetchMore = async () => {
      setLoadingMore(true);
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })
        .range(page * LIMIT, (page + 1) * LIMIT - 1);

      if (error) {
        console.error("Error fetching more photos: ", error);
      } else {
        setPhotos(prev => [...prev, ...(data || [])]);
        if (!data || data.length < LIMIT) setHasMore(false);
      }
      setLoadingMore(false);
    };
    fetchMore();
  }, [page, eventId]);

  const toggleSelection = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const getFilePathFromUrl = (url) => decodeURIComponent(url.substring(url.indexOf('/events/') + 8));

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0 || !window.confirm(`Are you sure you want to delete ${selectedIds.length} photos?`)) return;

    setIsDeleting(true);
    try {
      const photosToDelete = photos.filter(p => selectedIds.includes(p.id));
      const filePaths = photosToDelete.map(p => getFilePathFromUrl(p.url));

      const { error: dbError } = await supabase
        .from('photos')
        .delete()
        .in('id', selectedIds);

      if (dbError) throw dbError;

      setPhotos(current => current.filter(p => !selectedIds.includes(p.id)));

      if (filePaths.length > 0) {
        await supabase.storage.from('events').remove(filePaths);
      }

      setSelectionMode(false);
      setSelectedIds([]);
      toast.success(
        `${photosToDelete.length} photo${photosToDelete.length === 1 ? '' : 's'} deleted`
      );
    } catch (error) {
      console.error("Error bulk deleting:", error);
      toast.error('Failed to delete photos');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDragStart = (e, photoId) => {
    if (!isCreator) return;
    e.dataTransfer.setData('text/plain', photoId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedPhotoId(photoId);
  };

  const handleDragEnd = () => {
    setDraggedPhotoId(null);
  };

  const handleDragOverTrash = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropOnTrash = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedPhotoId) return;

    setIsDragDeleting(true);

    try {
      const photoToDelete = photos.find(p => p.id === draggedPhotoId);
      if (!photoToDelete) return;

      const filePath = getFilePathFromUrl(photoToDelete.url);
      const { error: dbError } = await supabase.from('photos').delete().eq('id', draggedPhotoId);

      if (dbError) throw dbError;

      setPhotos(current => current.filter(p => p.id !== draggedPhotoId));

      if (filePath) {
        await supabase.storage.from('events').remove([filePath]);
      }

      toast.success('Photo deleted');
    } catch (error) {
      console.error('Drag delete failed:', error);
      toast.error('Failed to delete photo');
    } finally {
      setIsDragDeleting(false);
      setDraggedPhotoId(null);
    }
  };

  const handleRestrictUploader = async (photo) => {
    const uploaderId = photo.uploader_id?.trim() || photo.uploaded_by?.trim();
    const uploaderName = photo.uploaded_by?.trim() || uploaderId || 'Guest';
    if (!uploaderId) return;
    if (uploaderId === currentUploaderId) {
      toast.error("You can't restrict yourself.");
      return;
    }
    setRestrictionTarget({ uploaderId, uploaderName });
    setRemoveRestrictedPhotos(false);
  };

  const closeLightbox = () => setLightboxIndex(null);

  const showPreviousPhoto = () => {
    setLightboxIndex((current) => {
      if (current === null || photos.length === 0) return current;
      return current === 0 ? photos.length - 1 : current - 1;
    });
  };

  const showNextPhoto = () => {
    setLightboxIndex((current) => {
      if (current === null || photos.length === 0) return current;
      return current === photos.length - 1 ? 0 : current + 1;
    });
  };

  const closeRestrictionModal = () => {
    if (isRestricting) return;
    setRestrictionTarget(null);
    setRemoveRestrictedPhotos(false);
  };

  const confirmRestrictUploader = async () => {
    if (!restrictionTarget) return;

    const { uploaderId, uploaderName } = restrictionTarget;
    setIsRestricting(true);

    const { error } = await supabase
      .from('restricted_uploaders')
      .insert([{ event_id: eventId, uploader_id: uploaderId, display_name: uploaderName }]);

    if (error && error.code !== '23505') {
      console.error("Error restricting uploader:", error);
      toast.error("Failed to restrict guest.");
    } else {
      if (removeRestrictedPhotos) {
        const photosToDelete = photos.filter((item) => {
          const itemUploaderId = item.uploader_id?.trim() || item.uploaded_by?.trim();
          return itemUploaderId === uploaderId;
        });
        const photoIds = photosToDelete.map((item) => item.id);
        const filePaths = photosToDelete.map((item) => getFilePathFromUrl(item.url));

        if (photoIds.length > 0) {
          const { error: deleteError } = await supabase
            .from('photos')
            .delete()
            .in('id', photoIds);

          if (deleteError) {
            console.error("Error deleting restricted uploader photos:", deleteError);
            toast.error('Restricted, but failed to remove existing photos');
          } else {
            setPhotos((current) => current.filter((item) => !photoIds.includes(item.id)));
            if (filePaths.length > 0) {
              await supabase.storage.from('events').remove(filePaths);
            }
            toast.success(`Restricted ${uploaderName} and removed their photos`);
          }
        } else {
          toast.success(`${uploaderName} restricted`);
        }
      } else {
        toast.success(`${uploaderName} restricted`);
      }
      window.dispatchEvent(new CustomEvent('restricted-uploaders-changed', { detail: { eventId } }));
    }

    setIsRestricting(false);
    setRestrictionTarget(null);
    setRemoveRestrictedPhotos(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-3"></div>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-12 text-theme-4/60">
        <p className="text-xl font-heading font-bold">No photos yet!</p>
        <p className="mt-2">Be the first to capture a moment.</p>
      </div>
    );
  }

  return (
    <>
      {isCreator && (
        <div className="flex justify-between items-center px-4 mb-4">
          <p className="text-theme-4/60 text-sm font-bold">
            {photos.length} Photo{photos.length !== 1 ? 's' : ''}
          </p>
          <div className="flex gap-2">
            {selectionMode && (
              <button
                onClick={handleBulkDelete}
                disabled={selectedIds.length === 0 || isDeleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-full font-bold transition-all disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : <><Trash2 className="w-4 h-4" /> Delete ({selectedIds.length})</>}
              </button>
            )}
            <button
              onClick={() => {
                setSelectionMode(!selectionMode);
                setSelectedIds([]);
              }}
              className="px-4 py-2 bg-theme-2 text-theme-4 border border-theme-3/20 hover:bg-theme-3/10 rounded-full font-bold transition-all shadow-sm"
            >
              {selectionMode ? 'Cancel' : 'Manage Photos'}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4 pb-24">
        {photos.map((photo, index) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            eventName={eventName}
            onShowQR={() => setSelectedPhotoForQR(photo)}
            onOpenLightbox={() => setLightboxIndex(index)}
            selectionMode={selectionMode}
            isSelected={selectedIds.includes(photo.id)}
            onToggleSelect={() => toggleSelection(photo.id)}
            isCreator={isCreator}
            currentUploaderId={currentUploaderId}
            onRestrictUploader={() => handleRestrictUploader(photo)}
            onDragStart={(e) => handleDragStart(e, photo.id)}
            onDragEnd={handleDragEnd}
          />
        ))}
      </div>

      <div ref={loaderRef} className="flex justify-center py-6">
        {loadingMore && (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-theme-3"></div>
        )}
        {!hasMore && photos.length > 0 && (
          <p className="text-theme-4/40 text-sm">All photos loaded</p>
        )}
      </div>

      <PhotoLightbox
        photos={photos}
        currentIndex={lightboxIndex}
        eventName={eventName}
        onClose={closeLightbox}
        onPrevious={showPreviousPhoto}
        onNext={showNextPhoto}
        onShowQR={(photo) => {
          setSelectedPhotoForQR(photo);
          closeLightbox();
        }}
      />

      {selectedPhotoForQR && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[80] flex items-center justify-center p-4"
          onClick={() => setSelectedPhotoForQR(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="relative bg-theme-2 p-8 rounded-3xl max-w-sm w-full shadow-2xl border border-theme-3/20 flex flex-col items-center text-center"
          >
            <button
              onClick={() => setSelectedPhotoForQR(null)}
              className="absolute top-4 right-4 text-theme-4/50 hover:text-theme-4 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="font-heading text-2xl font-bold text-theme-4 mb-2">Scan to Save</h2>
            <p className="text-theme-4/60 text-sm mb-6">Scan this code to download the photo directly to your phone.</p>

            <div className="bg-white p-4 rounded-2xl shadow-inner mb-6">
              <QRCodeSVG
                value={`${selectedPhotoForQR.url}?download=${(eventName || 'Event').replace(/[^a-zA-Z0-9]/g, '_')}_${(selectedPhotoForQR.created_at ? new Date(selectedPhotoForQR.created_at) : new Date()).toTimeString().split(' ')[0].replace(/:/g, '-')}.jpg`}
                size={220}
                level="L"
              />
            </div>

            <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-theme-3/20 shadow-sm mt-2">
              <img src={selectedPhotoForQR.url} alt="Preview" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      )}

      {restrictionTarget && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
          onClick={closeRestrictionModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-theme-3/25 bg-theme-2 shadow-2xl"
          >
            <button
              onClick={closeRestrictionModal}
              disabled={isRestricting}
              className="absolute right-4 top-4 text-theme-4/60 hover:text-theme-4 transition-colors disabled:opacity-50"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="px-6 pt-6 pb-5 border-b border-theme-3/20">
              <div className="flex items-center gap-3 pr-8">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-theme-1/70 text-red-100 ring-1 ring-red-200/20">
                  <Ban className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl font-bold text-theme-4">Restrict guest</h2>
                  <p className="truncate text-sm font-bold text-theme-4/65">
                    {restrictionTarget.uploaderName}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-5 space-y-4">
              <p className="text-sm leading-6 text-theme-4/80">
                This guest will no longer be able to upload photos to this event.
              </p>

              <button
                type="button"
                onClick={() => setRemoveRestrictedPhotos((value) => !value)}
                className={`w-full rounded-xl border px-4 py-3 text-left transition-all ${
                  removeRestrictedPhotos
                    ? 'border-red-200/40 bg-red-500/15 text-red-50'
                    : 'border-theme-3/25 bg-theme-1/35 text-theme-4 hover:bg-theme-1/50'
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                    removeRestrictedPhotos ? 'border-red-100 bg-red-100 text-theme-1' : 'border-theme-4/45'
                  }`}>
                    {removeRestrictedPhotos && <CheckCircle2 className="h-3.5 w-3.5" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold">Remove existing photos</span>
                    <span className="block text-xs text-theme-4/60">
                      Delete photos already uploaded by this guest.
                    </span>
                  </span>
                </span>
              </button>
            </div>

            <div className="flex items-center justify-end gap-3 bg-theme-1/25 px-6 py-4">
              <button
                onClick={closeRestrictionModal}
                disabled={isRestricting}
                className="rounded-full border border-theme-3/25 px-4 py-2 text-sm font-bold text-theme-4 hover:bg-theme-1/40 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmRestrictUploader}
                disabled={isRestricting}
                className="rounded-full bg-theme-3 px-5 py-2 text-sm font-bold text-theme-1 shadow-sm hover:bg-theme-4 transition-colors disabled:opacity-50"
              >
                {isRestricting ? 'Restricting...' : 'Restrict'}
              </button>
            </div>
          </div>
        </div>
      )}

      {draggedPhotoId && isCreator && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm pointer-events-none transition-opacity duration-300" />
      )}
      {draggedPhotoId && isCreator && (
        <div
          className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center pointer-events-auto"
          onDragOver={handleDragOverTrash}
          onDrop={handleDropOnTrash}
        >
          <div className={`flex flex-col items-center justify-center w-20 h-20 rounded-full border-4 border-dashed transition-all duration-300 ${isDragDeleting ? 'bg-red-500 border-red-500 scale-110' : 'bg-red-500/20 border-red-500 hover:bg-red-500/40'}`}>
            {isDragDeleting ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            ) : (
              <Trash2 className="w-8 h-8 text-red-500" />
            )}
          </div>
          <p className="mt-2 text-red-500 font-bold bg-theme-1/80 px-3 py-1 rounded-full backdrop-blur-sm text-sm">
            {isDragDeleting ? 'Deleting...' : 'Drop to delete'}
          </p>
        </div>
      )}
    </>
  );
}

function PhotoCard({ photo, eventName, onShowQR, onOpenLightbox, selectionMode, isSelected, onToggleSelect, isCreator, currentUploaderId, onRestrictUploader, onDragStart, onDragEnd }) {
  const [showOverlay, setShowOverlay] = useState(false);
  const [isDraggingCard, setIsDraggingCard] = useState(false);
  const safeName = (eventName || 'Event').replace(/[^a-zA-Z0-9]/g, '_');
  const timeStr = (photo.created_at ? new Date(photo.created_at) : new Date()).toTimeString().split(' ')[0].replace(/:/g, '-');
  const downloadName = `${safeName}_${timeStr}.jpg`;
  const uploadedBy = photo.uploaded_by?.trim() || photo.uploader_id?.trim() || 'Guest';
  const isCurrentUploader = Boolean(currentUploaderId && photo.uploader_id?.trim() === currentUploaderId);

  if (selectionMode) {
    return (
      <div
        className={`relative aspect-square rounded-2xl overflow-hidden shadow-md cursor-pointer transition-all duration-300 border-4 ${isSelected ? 'border-theme-3' : 'border-transparent'}`}
        onClick={onToggleSelect}
      >
        <img
          src={photo.url}
          alt="Event moment"
          className={`w-full h-full object-cover transition-transform duration-500 ${isSelected ? 'scale-110 opacity-80' : ''}`}
          loading="lazy"
        />
        <div className="absolute top-4 right-4 bg-white/50 backdrop-blur-sm rounded-full p-1">
          {isSelected ? (
            <CheckCircle2 className="w-8 h-8 text-theme-3 fill-white" />
          ) : (
            <div className="w-8 h-8 border-2 border-white rounded-full bg-black/20" />
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative aspect-square rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:shadow-theme-3/20 transition-all duration-300 cursor-pointer"
      onMouseEnter={() => setShowOverlay(true)}
      onMouseLeave={() => setShowOverlay(false)}
      onClick={() => {
        if (isDraggingCard) return;
        onOpenLightbox();
      }}
      draggable={isCreator}
      onDragStart={(event) => {
        setIsDraggingCard(true);
        onDragStart(event);
      }}
      onDragEnd={(event) => {
        onDragEnd(event);
        setTimeout(() => setIsDraggingCard(false), 0);
      }}
    >
      <img
        src={photo.url}
        alt="Event moment"
        className={`w-full h-full object-cover transition-transform duration-500 ${showOverlay ? 'scale-110' : ''}`}
        loading="lazy"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/75 to-transparent px-4 py-3 pointer-events-none">
        <p className="text-white text-sm font-bold truncate">Uploaded by {uploadedBy}</p>
      </div>

      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 flex items-center justify-center gap-4 ${showOverlay ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
         <a
          href={`${photo.url}?download=${downloadName}`}
          download={downloadName}
          target="_blank"
          rel="noreferrer"
          className="flex flex-col items-center justify-center text-white hover:text-theme-3 transition-colors"
          title="Download Directly"
          onClick={(e) => e.stopPropagation()}
         >
            <div className="bg-white/20 p-3 rounded-full backdrop-blur-md mb-2 hover:bg-white/30 transition-colors">
              <Download className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold shadow-black drop-shadow-md">Save</span>
         </a>

         <button
          onClick={(e) => {
            e.stopPropagation();
            onShowQR();
          }}
          className="flex flex-col items-center justify-center text-white hover:text-theme-3 transition-colors"
          title="Show QR Code"
         >
            <div className="bg-white/20 p-3 rounded-full backdrop-blur-md mb-2 hover:bg-white/30 transition-colors">
              <QrCode className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold shadow-black drop-shadow-md">Scan QR</span>
         </button>

         {isCreator && !isCurrentUploader && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRestrictUploader();
            }}
            className="flex flex-col items-center justify-center text-white hover:text-red-200 transition-colors"
            title={`Restrict ${uploadedBy}`}
          >
            <div className="bg-red-500/30 p-3 rounded-full backdrop-blur-md mb-2 hover:bg-red-500/40 transition-colors">
              <Ban className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold shadow-black drop-shadow-md">Restrict</span>
          </button>
         )}
      </div>
    </div>
  );
}

