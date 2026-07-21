import { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../services/supabase';
import { downloadPhoto } from '../services/storage';
import { useSync } from '../contexts/SyncContext';
import { QRCodeSVG } from 'qrcode.react';
import { Download, QrCode, X, Trash2, CheckCircle2, Ban, Settings2 } from 'lucide-react';
import PhotoLightbox from './PhotoLightbox';
import LazyImage from './LazyImage';

export default function Gallery({ eventId, eventName, isCreator, currentUploaderId }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhotoForQR, setSelectedPhotoForQR] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [isSlideshowMode, setIsSlideshowMode] = useState(false);
  const [showTopCarousel, setShowTopCarousel] = useState(false);
  const [topCarouselIndex, setTopCarouselIndex] = useState(0);
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

  const { isOnline, notifyDownloadQueued } = useSync();

  const handleDownloadClick = async (e, url, filename) => {
    e.stopPropagation(); // Prevents the lightbox from opening
    try {
      const result = await downloadPhoto(url, filename);
      if (result?.offline) {
        notifyDownloadQueued();
        toast.success('Photo saved to download queue!');
      } else {
        toast.success('Downloading photo...');
      }
    } catch (error) {
      console.error("Download failed:", error);
      toast.error('Failed to download photo');
    }
  };

  useEffect(() => {
    const handleStartSlideshow = () => {
      if (photos.length > 0) {
        setLightboxIndex(0);
        setIsSlideshowMode(true);
      } else {
        toast.error('No photos to show yet!');
      }
    };

    window.addEventListener('start-slideshow', handleStartSlideshow);
    return () => window.removeEventListener('start-slideshow', handleStartSlideshow);
  }, [photos]);

  useEffect(() => {
    let interval;
    if (showTopCarousel && photos.length > 0) {
      interval = setInterval(() => {
        setTopCarouselIndex(prev => (prev + 1) % photos.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [showTopCarousel, photos.length]);

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
      const fileUrls = photosToDelete.map(p => p.url);

      const { error: dbError } = await supabase
        .from('photos')
        .delete()
        .in('id', selectedIds);

      if (dbError) throw dbError;

      setPhotos(current => current.filter(p => !selectedIds.includes(p.id)));

      if (fileUrls.length > 0) {
        await fetch('/api/imagekit-delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileUrls })
        }).catch(err => console.error("ImageKit delete failed:", err));
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

      const fileUrl = photoToDelete.url;
      const { error: dbError } = await supabase.from('photos').delete().eq('id', draggedPhotoId);

      if (dbError) throw dbError;

      setPhotos(current => current.filter(p => p.id !== draggedPhotoId));

      if (fileUrl) {
        await fetch('/api/imagekit-delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileUrls: [fileUrl] })
        }).catch(err => console.error("ImageKit delete failed:", err));
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

  const handleGuestDelete = async (photoId) => {
    if (!window.confirm("Are you sure you want to delete your photo?")) return;

    try {
      const photoToDelete = photos.find(p => p.id === photoId);
      if (!photoToDelete) return;

      const fileUrl = photoToDelete.url;

      // Try using the secure RPC function first
      const { error } = await supabase.rpc('delete_guest_photo', {
        p_photo_id: photoId,
        p_uploader_id: currentUploaderId
      });

      if (error) {
        // Fallback if RPC doesn't exist but RLS is relaxed
        const { error: fallbackError } = await supabase
          .from('photos')
          .delete()
          .eq('id', photoId)
          .eq('uploader_id', currentUploaderId);

        if (fallbackError) throw fallbackError;
      }

      setPhotos(current => current.filter(p => p.id !== photoId));
      if (fileUrl) {
        await fetch('/api/imagekit-delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileUrls: [fileUrl] })
        }).catch(err => console.error("ImageKit delete failed:", err));
      }

      toast.success('Photo deleted');
    } catch (err) {
      console.error("Error deleting photo:", err);
      toast.error("Failed to delete photo. Please check database permissions.");
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
        const fileUrls = photosToDelete.map((item) => item.url);

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
            if (fileUrls.length > 0) {
              await fetch('/api/imagekit-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileUrls })
              }).catch(err => console.error("ImageKit delete failed:", err));
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
      <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-[#050505]/10 rounded-[32px] mx-4">
        <QrCode className="w-12 h-12 opacity-20 mb-4" />
        <p className="text-xl font-light text-[#050505]/50">No photos yet. Be the first!</p>
      </div>
    );
  }

  return (
    <>
      {isCreator && (
        <div className="flex justify-between items-center px-4 mb-8">
          <p className="text-[#050505]/40 text-xs tracking-widest uppercase font-bold">
            {photos.length} Photo{photos.length !== 1 ? 's' : ''}
          </p>
          <div className="flex gap-4">
            <label className="flex items-center gap-3 cursor-pointer group">
              <span className="hidden sm:inline text-sm font-medium text-[#050505]/60 group-hover:text-[#050505] transition-colors">Top Carousel</span>
              <div className={`w-10 h-5 rounded-full flex items-center px-0.5 transition-colors duration-300 shadow-inner ${showTopCarousel ? 'bg-black' : 'bg-[#050505]/20'}`}>
                <div className={`w-4 h-4 rounded-full bg-theme-4 shadow-sm transform transition-transform duration-300 ${showTopCarousel ? 'translate-x-5' : 'translate-x-0'}`}></div>
              </div>
              <input
                type="checkbox"
                className="sr-only"
                checked={showTopCarousel}
                onChange={(e) => setShowTopCarousel(e.target.checked)}
              />
            </label>
            {selectionMode && (
              <button
                onClick={handleBulkDelete}
                disabled={selectedIds.length === 0 || isDeleting}
                className="flex items-center gap-2 text-red-500 hover:text-red-600 text-sm font-medium transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : <><Trash2 className="w-4 h-4" /> Delete ({selectedIds.length})</>}
              </button>
            )}
            <button
              onClick={() => {
                setSelectionMode(!selectionMode);
                setSelectedIds([]);
              }}
              className="flex items-center gap-2 text-[#050505]/60 hover:text-[#050505] text-sm font-medium transition-colors bg-white/50 hover:bg-white/80 px-3 py-1.5 rounded-full border border-[#050505]/10 backdrop-blur-sm"
            >
              {selectionMode ? (
                <>
                  <X className="w-4 h-4" /> Cancel
                </>
              ) : (
                <>
                  <Settings2 className="w-4 h-4" /> Manage Photos
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {showTopCarousel && photos.length > 0 && (
        <div className="w-full px-4 mb-16 fade-in animate-in slide-in-from-bottom-8 duration-700">
          <div className="relative w-full overflow-hidden rounded-[40px] bg-black/40 backdrop-blur-xl border border-theme-4/10 p-4 sm:p-6 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-theme-3/5 to-transparent opacity-50 pointer-events-none"></div>
            <div className="relative flex items-center justify-center w-full h-[300px] sm:h-[500px] perspective-1000">
              {photos.map((photo, i) => {
                let diff = i - topCarouselIndex;
                if (diff > photos.length / 2) diff -= photos.length;
                if (diff < -photos.length / 2) diff += photos.length;

                let zIndex = 10 - Math.abs(diff);
                let transformClass = "";
                let blurClass = "";
                let isActive = diff === 0;

                if (diff === 0) {
                  transformClass = "translate-x-0 scale-100 opacity-100";
                  blurClass = "blur-none";
                } else if (diff === -1) {
                  transformClass = "-translate-x-[55%] sm:-translate-x-[60%] scale-[0.80] sm:scale-75 opacity-40 hover:opacity-80";
                  blurClass = "blur-[2px] hover:blur-none";
                } else if (diff === 1) {
                  transformClass = "translate-x-[55%] sm:translate-x-[60%] scale-[0.80] sm:scale-75 opacity-40 hover:opacity-80";
                  blurClass = "blur-[2px] hover:blur-none";
                } else if (diff < -1) {
                  transformClass = "-translate-x-full scale-50 opacity-0 pointer-events-none";
                  blurClass = "blur-[4px]";
                } else {
                  transformClass = "translate-x-full scale-50 opacity-0 pointer-events-none";
                  blurClass = "blur-[4px]";
                }

                return (
                  <div
                    key={photo.id}
                    className={`absolute w-[65%] sm:w-1/2 h-full rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-theme-4/10 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer group ${transformClass} ${blurClass}`}
                    style={{ zIndex }}
                    onClick={() => {
                      if (isActive) setLightboxIndex(i);
                      else setTopCarouselIndex(i);
                    }}
                  >
                    <img src={photo.url} className="w-full h-full object-cover bg-black/20" alt="Carousel item" />

                    <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-center justify-center transition-opacity duration-500 ${isActive ? 'opacity-0 group-hover:opacity-100' : 'opacity-0'}`}>
                      <div className="bg-theme-4/20 backdrop-blur-md p-4 rounded-full text-theme-4 shadow-xl border border-theme-4/30 transform scale-90 group-hover:scale-100 transition-all duration-300">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"></path><path d="M9 21H3v-6"></path><path d="M21 3l-7 7"></path><path d="M3 21l7-7"></path></svg>
                      </div>
                    </div>

                    <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/50 to-transparent p-8 pointer-events-none transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                      <p className="text-theme-4 font-bold text-center text-sm md:text-base tracking-wide drop-shadow-md">
                        By {photo.uploaded_by?.trim() || photo.uploader_id?.trim() || 'Guest'}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5 p-4 pb-24">
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
            onDownload={(e, url, name) => handleDownloadClick(e, url, name)}
            onGuestDelete={() => handleGuestDelete(photo.id)}
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
        onClose={() => {
          closeLightbox();
          setIsSlideshowMode(false);
        }}
        onPrevious={showPreviousPhoto}
        onNext={showNextPhoto}
        onShowQR={(photo) => {
          setSelectedPhotoForQR(photo);
          closeLightbox();
          setIsSlideshowMode(false);
        }}
        startSlideshow={isSlideshowMode}
      />

      {selectedPhotoForQR && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[80] flex items-center justify-center p-4"
          onClick={() => setSelectedPhotoForQR(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="relative bg-black/40 backdrop-blur-2xl p-10 rounded-[2.5rem] max-w-sm w-full shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-theme-4/20 flex flex-col items-center text-center animate-in fade-in zoom-in duration-500 overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-theme-3/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <button
              onClick={() => setSelectedPhotoForQR(null)}
              className="absolute top-6 right-6 text-theme-4/50 hover:text-theme-4 bg-black/20 hover:bg-black/40 rounded-full p-2 transition-all duration-300 backdrop-blur-md"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="font-heading text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-theme-3 to-theme-4 mb-2 drop-shadow-sm">Scan to Save</h2>
            <p className="text-theme-4/60 text-sm mb-8 font-medium">Scan this code to download the photo directly to your phone.</p>

            <div className="relative bg-gradient-to-br from-theme-3 to-theme-4 p-[3px] rounded-3xl shadow-2xl overflow-hidden group-hover:scale-105 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] mb-8">
              <div className="bg-[#0a0a0a] p-4 rounded-[22px]">
                <div className="bg-white p-3 rounded-2xl shadow-inner">
                  <QRCodeSVG
                    value={`${selectedPhotoForQR.url}?download=${(eventName || 'Event').replace(/[^a-zA-Z0-9]/g, '_')}_${(selectedPhotoForQR.created_at ? new Date(selectedPhotoForQR.created_at) : new Date()).toTimeString().split(' ')[0].replace(/:/g, '-')}.jpg`}
                    size={200}
                    level="L"
                    bgColor="transparent"
                    fgColor="#0a0a0a"
                  />
                </div>
              </div>
            </div>

            <div className="w-28 h-28 rounded-2xl overflow-hidden border border-theme-4/20 shadow-xl mt-2 relative group-hover:-translate-y-2 transition-transform duration-500">
              <LazyImage src={selectedPhotoForQR.url} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] pointer-events-none"></div>
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
                className={`w-full rounded-xl border px-4 py-3 text-left transition-all ${removeRestrictedPhotos
                  ? 'border-red-200/40 bg-red-500/15 text-red-50'
                  : 'border-theme-3/25 bg-theme-1/35 text-theme-4 hover:bg-theme-1/50'
                  }`}
              >
                <span className="flex items-center gap-3">
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${removeRestrictedPhotos ? 'border-red-100 bg-red-100 text-theme-1' : 'border-theme-4/45'
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
          className="fixed bottom-32 md:bottom-28 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center pointer-events-auto"
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

function PhotoCard({ photo, eventName, onShowQR, onOpenLightbox, selectionMode, isSelected, onToggleSelect, isCreator, currentUploaderId, onRestrictUploader, onDragStart, onDragEnd, onDownload, onGuestDelete }) {
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
        className={`relative aspect-[4/5] rounded-2xl overflow-hidden shadow-md cursor-pointer transition-all duration-300 border-4 ${isSelected ? 'border-theme-3' : 'border-transparent'} [content-visibility:auto]`}
        onClick={onToggleSelect}
      >
        <LazyImage
          src={photo.url}
          alt="Event moment"
          className={`w-full h-full object-cover transition-transform duration-500 ${isSelected ? 'scale-110 opacity-80' : ''}`}
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
      className="relative aspect-[4/5] rounded-2xl overflow-hidden hover:-translate-y-1 transition-all duration-300 cursor-pointer group animate-fade-in-up [content-visibility:auto]"
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
      <LazyImage
        src={photo.url}
        alt="Event moment"
        className={`w-full h-full object-cover transition-transform duration-500 ${showOverlay ? 'scale-110' : ''}`}
      />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/75 to-transparent px-4 py-3 pointer-events-none">
        <p className="text-white text-sm font-bold truncate">Uploaded by {uploadedBy}</p>
      </div>

      <div
        className={`absolute inset-0 bg-black/10 backdrop-blur-sm transition-opacity duration-300 flex items-center justify-center gap-4 ${showOverlay ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <button
          onClick={(e) => onDownload(e, photo.url, downloadName)}
          className="flex flex-col items-center justify-center text-[#050505] hover:scale-110 transition-transform"
          title="Download Directly"
        >
          <div className="bg-white p-3 rounded-full shadow-lg mb-2 hover:bg-gray-100 transition-colors">
            <Download className="w-5 h-5" />
          </div>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onShowQR();
          }}
          className="flex flex-col items-center justify-center text-[#050505] hover:scale-110 transition-transform"
          title="Show QR Code"
        >
          <div className="bg-white p-3 rounded-full shadow-lg mb-2 hover:bg-gray-100 transition-colors">
            <QrCode className="w-5 h-5" />
          </div>
        </button>

        {(isCreator || isCurrentUploader) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onGuestDelete();
            }}
            className="absolute top-3 right-3 bg-white hover:bg-red-50 text-red-500 p-2 rounded-full shadow-lg transition-colors"
            title="Delete Photo"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

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

        {isCurrentUploader && !isCreator && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onGuestDelete();
            }}
            className="flex flex-col items-center justify-center text-white hover:text-red-200 transition-colors"
            title="Delete your photo"
          >
            <div className="bg-red-500/30 p-3 rounded-full backdrop-blur-md mb-2 hover:bg-red-500/40 transition-colors">
              <Trash2 className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold shadow-black drop-shadow-md">Delete</span>
          </button>
        )}
      </div>
    </div>
  );
}

