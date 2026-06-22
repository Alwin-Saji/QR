import React, { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '../services/supabase';import { QRCodeSVG } from 'qrcode.react';
import { Download, QrCode, X, Trash2, CheckCircle2 } from 'lucide-react';

export default function Gallery({ eventId, isCreator }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhotoForQR, setSelectedPhotoForQR] = useState(null);
  
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
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

    fetchPhotos(0);

    // Subscribe to real-time changes
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'photos',
          filter: `event_id=eq.${eventId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setPhotos((current) => [payload.new, ...current]);
          } else if (payload.eventType === 'DELETE') {
            setPhotos((current) => current.filter(p => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);
  // Infinite scroll observer
  useEffect(() => {
    if (!hasMore || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          setPage(prev => {
            const nextPage = prev + 1;
            // fetchPhotos inside the first useEffect can't be accessed here
            // so we trigger via page state change handled below
            return nextPage;
          });
        }
      },
      { threshold: 0.1 }
    );

    const current = loaderRef.current;
    if (current) observer.observe(current);
    return () => { if (current) observer.unobserve(current); };
  }, [hasMore, loadingMore]);

  // Fetch when page increments
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

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0 || !window.confirm(`Are you sure you want to delete ${selectedIds.length} photos?`)) return;
    
    setIsDeleting(true);
    try {
      // Find the URLs to extract file paths for storage deletion
      const photosToDelete = photos.filter(p => selectedIds.includes(p.id));
      const filePaths = photosToDelete.map(p => {
        // e.g., https://<host>/storage/v1/object/public/events/123/456.jpg -> 123/456.jpg
        return p.url.substring(p.url.indexOf('/events/') + 8);
      });

      // 1. Delete from DB
      const { error: dbError } = await supabase
        .from('photos')
        .delete()
        .in('id', selectedIds);

      if (dbError) throw dbError;

      // Optimistically update the UI immediately
      setPhotos(current => current.filter(p => !selectedIds.includes(p.id)));

      // 2. Delete from Storage
      if (filePaths.length > 0) {
        await supabase.storage.from('events').remove(filePaths);
      }

      setSelectionMode(false);
      setSelectedIds([]);
    } catch (error) {
      console.error("Error bulk deleting:", error);
      alert("Failed to delete photos.");
    } finally {
      setIsDeleting(false);
    }
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
        {photos.map((photo) => (
          <PhotoCard 
            key={photo.id} 
            photo={photo} 
            onShowQR={() => setSelectedPhotoForQR(photo)}
            selectionMode={selectionMode}
            isSelected={selectedIds.includes(photo.id)}
            onToggleSelect={() => toggleSelection(photo.id)}
          />
        ))}
      </div>
      {/* Infinite scroll trigger */}
      <div ref={loaderRef} className="flex justify-center py-6">
        {loadingMore && (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-theme-3"></div>
        )}
        {!hasMore && photos.length > 0 && (
          <p className="text-theme-4/40 text-sm">All photos loaded</p>
        )}
      </div>

      {/* QR Code Modal for specific photo */}
      {selectedPhotoForQR && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" 
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
                value={selectedPhotoForQR.url} 
                size={220}
                level="L"
              />
            </div>
            
            {/* Small preview of the photo being shared */}
            <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-theme-3/20 shadow-sm mt-2">
              <img src={selectedPhotoForQR.url} alt="Preview" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function PhotoCard({ photo, onShowQR, selectionMode, isSelected, onToggleSelect }) {
  const [showOverlay, setShowOverlay] = useState(false);

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
      onClick={() => setShowOverlay(!showOverlay)}
    >
      <img 
        src={photo.url} 
        alt="Event moment" 
        className={`w-full h-full object-cover transition-transform duration-500 ${showOverlay ? 'scale-110' : ''}`}
        loading="lazy"
      />

      {/* Hover Controls */}
      <div 
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 flex items-center justify-center gap-4 ${showOverlay ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={(e) => e.stopPropagation()} // Prevent toggling when clicking buttons
      >
         <a 
          href={photo.url} 
          download
          target="_blank" 
          rel="noreferrer" 
          className="flex flex-col items-center justify-center text-white hover:text-theme-3 transition-colors"
          title="Download Directly"
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
      </div>
    </div>
  );
}
