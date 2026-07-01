import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../services/supabase';
import { uploadPhoto } from '../services/storage';
import Gallery from '../components/Gallery';
import CameraCapture from '../components/CameraCapture';
import QRCodeDisplay from '../components/QRCodeDisplay';
import { Loader2, QrCode, Share2, Upload, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const getOrCreateGuestId = (eventId) => {
  if (!eventId) return '';

  const storageKey = `arc-guest-id-${eventId}`;
  const existingGuestId = window.localStorage.getItem(storageKey);

  if (existingGuestId) return existingGuestId;

  const newGuestId = `guest-${Math.random().toString(36).substr(2, 9)}`;
  window.localStorage.setItem(storageKey, newGuestId);
  return newGuestId;
};

export default function EventLive() {
  const { eventId } = useParams();
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [guestId] = useState(() => getOrCreateGuestId(eventId));
  const [isDragging, setIsDragging] = useState(false);
  const [isUploadingDrag, setIsUploadingDrag] = useState(false);
  const dragCounter = useRef(0);
  const { user } = useAuth();

  const eventUrl = window.location.href;

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .single();

        if (data) {
          setEventData(data);
        } else {
          console.error("No such event!", error);
        }
      } catch (error) {
        console.error("Error fetching event:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-theme-1 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-3"></div>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="min-h-screen w-full bg-theme-1 flex flex-col justify-center items-center text-center p-4">
        <h1 className="text-5xl font-heading font-bold text-theme-4 mb-2">Event Not Found</h1>
        <p className="text-theme-4/80">The event you are looking for does not exist or has expired.</p>
      </div>
    );
  }

  const isCreator = user && user.id === eventData.user_id;

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;

    if (dragCounter.current === 1) {
      const hasFiles = Array.from(e.dataTransfer.items).some((item) => item.kind === 'file');
      if (hasFiles) {
        setIsDragging(true);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;

    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    if (isUploadingDrag) return;

    const imageFiles = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      toast.error('Drop image files only');
      return;
    }

    const displayName = window.localStorage.getItem(`arc-display-name-${eventId}-${guestId}`) || '';
    setIsUploadingDrag(true);

    try {
      let failedUploads = 0;
      for (const file of imageFiles) {
        try {
          await uploadPhoto(eventId, file, {
            displayName,
            guestId,
            isCreator,
          });
        } catch (err) {
          failedUploads += 1;
          console.error('Upload failed for', file.name, err);
        }
      }

      if (failedUploads === 0) {
        toast.success(imageFiles.length === 1 ? 'Photo uploaded!' : `${imageFiles.length} photos uploaded!`);
      } else {
        toast.error(`${failedUploads} upload${failedUploads === 1 ? '' : 's'} failed`);
      }
    } finally {
      setIsUploadingDrag(false);
    }
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="w-full min-h-full bg-theme-1 text-theme-4 relative pb-20 pt-20 md:pt-0"
    >
      <header className="px-6 py-8 border-b border-theme-3/10 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex flex-col gap-2 max-w-full overflow-hidden">
          <h1 className="font-heading font-bold text-5xl text-theme-4 truncate">{eventData.name || 'Live Event'}</h1>
          {eventData.auto_delete && (
            <div className="flex items-center gap-2 text-sm text-theme-4/60 mt-1">
              <Clock className="w-4 h-4 opacity-70" />
              <span>Photos disappear 24 hours after upload</span>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowQR(true)}
            className="flex items-center gap-2 px-4 py-2 bg-theme-2 text-theme-4 border border-theme-3/20 rounded-full hover:bg-theme-3 hover:text-theme-1 hover:border-theme-3 font-bold transition-all shadow-sm"
            aria-label="Show QR Code"
          >
            <QrCode className="w-5 h-5" />
            <span className="hidden sm:inline">QR Code</span>
          </button>
          <button
            onClick={async () => {
              try {
                if (navigator.share) {
                  await navigator.share({
                    title: eventData.name,
                    url: eventUrl,
                  });
                } else {
                  await navigator.clipboard.writeText(eventUrl);
                  toast.success('Event link copied!');
                }
              } catch (error) {
                if (error.name !== 'AbortError') {
                  console.error('Error sharing event:', error);
                  toast.error('Could not share the event');
                }
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-theme-2 text-theme-4 border border-theme-3/20 rounded-full hover:bg-theme-3 hover:text-theme-1 hover:border-theme-3 font-bold transition-all shadow-sm"
            aria-label="Share"
          >
            <Share2 className="w-5 h-5" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl pt-8 px-4">
        <Gallery
          eventId={eventId}
          eventName={eventData.name}
          isCreator={isCreator}
          currentUploaderId={guestId}
        />
      </main>

      <CameraCapture eventId={eventId} guestId={guestId} isCreator={isCreator} />

      {showQR && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowQR(false)}>
          <div onClick={e => e.stopPropagation()} className="relative bg-theme-2 p-8 rounded-3xl max-w-sm w-full shadow-2xl border border-theme-3/20 text-center">
             <button
                onClick={() => setShowQR(false)}
                className="absolute top-4 right-4 text-theme-4/50 hover:text-theme-4 font-bold transition-colors"
             >
                Close
             </button>
             <h2 className="font-heading text-3xl font-bold text-theme-4 mb-6">Scan to Join</h2>
             <QRCodeDisplay url={eventUrl} title={eventData.name} />
          </div>
        </div>
      )}

      {(isDragging || isUploadingDrag) && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-theme-1/80 backdrop-blur-sm border-4 border-dashed border-theme-3 pointer-events-none">
          <div className="text-center p-8 bg-theme-2 rounded-3xl shadow-2xl border border-theme-3/20 max-w-md mx-4">
            {isUploadingDrag ? (
              <>
                <Loader2 className="w-16 h-16 animate-spin text-theme-3 mx-auto mb-4" />
                <p className="text-2xl font-heading font-bold text-theme-4">Uploading photos...</p>
                <p className="text-theme-4/60 mt-2">They will appear in the gallery shortly</p>
              </>
            ) : (
              <>
                <Upload className="w-16 h-16 text-theme-3 mx-auto mb-4" />
                <p className="text-2xl font-heading font-bold text-theme-4">Drop images to upload</p>
                <p className="text-theme-4/60 mt-2">Release to add them to the gallery</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
