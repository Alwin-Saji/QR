import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../services/supabase';
import { uploadPhoto } from '../services/storage';
import Gallery from '../components/Gallery';
import CameraCapture from '../components/CameraCapture';
import QRCodeDisplay from '../components/QRCodeDisplay';
import { Loader2, QrCode, Share2, Upload, Clock, HelpCircle, Camera, Image as ImageIcon, Download, LayoutGrid, Play, X } from 'lucide-react';
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
  const [showHelp, setShowHelp] = useState(false);
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
      className="w-full min-h-screen bg-theme-4 text-[#050505] relative pb-32"
    >
      <header className="sticky top-0 z-40 px-6 py-6 bg-theme-4/90 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
        <div className="flex flex-col gap-2 max-w-full overflow-hidden">
          <h1 className="font-heading font-black tracking-tighter text-4xl sm:text-5xl truncate">{eventData.name || 'Live Event'}</h1>
          <p className="text-[#050505]/60 font-light text-sm sm:text-base">Capturing the fleeting moments.</p>
          {eventData.auto_delete && (
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#050505]/40 mt-1">
              <Clock className="w-3 h-3" />
              <span>Auto-delete: 24H</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3 justify-end">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('start-slideshow'))}
            className="flex items-center gap-2 px-5 py-2 bg-[#050505] hover:bg-[#050505]/80 text-white rounded-full font-bold text-sm transition-colors"
            aria-label="Play Slideshow"
          >
            <Play className="w-4 h-4 fill-current" />
            <span className="hidden md:inline">Slideshow</span>
          </button>
          <button
            onClick={() => setShowHelp(true)}
            className="flex items-center gap-2 px-5 py-2 bg-transparent hover:bg-[#050505]/5 text-[#050505] border border-[#050505]/20 rounded-full font-bold text-sm transition-colors"
            aria-label="How to use"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Help</span>
          </button>
          <button
            onClick={() => setShowQR(true)}
            className="flex items-center gap-2 px-5 py-2 bg-transparent hover:bg-[#050505]/5 text-[#050505] border border-[#050505]/20 rounded-full font-bold text-sm transition-colors"
            aria-label="Show QR Code"
          >
            <QrCode className="w-4 h-4" />
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
            className="flex items-center gap-2 px-5 py-2 bg-transparent hover:bg-[#050505]/5 text-[#050505] border border-[#050505]/20 rounded-full font-bold text-sm transition-colors"
            aria-label="Share"
          >
            <Share2 className="w-4 h-4" />
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

      {showHelp && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowHelp(false)}>
          <div onClick={e => e.stopPropagation()} className="relative bg-white p-10 rounded-[32px] max-w-lg w-full shadow-2xl text-center overflow-hidden">

            <button
              onClick={() => setShowHelp(false)}
              className="absolute top-6 right-6 text-[#050505]/40 hover:text-[#050505] transition-colors p-2 rounded-full hover:bg-[#050505]/5 z-50 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="font-heading text-4xl font-black tracking-tighter text-[#050505] mb-8 relative z-10">Guide</h2>

            <div className="flex flex-col gap-8 text-left relative z-10 w-full max-w-sm mx-auto">

              <div className="flex items-start gap-5 group">
                <div className="w-12 h-12 rounded-full border border-[#050505]/10 flex items-center justify-center text-[#050505] shrink-0 group-hover:scale-110 group-hover:bg-[#050505]/5 transition-all">
                  <Camera className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-bold text-[#050505] text-lg">Snap & Share</h3>
                  <p className="text-[#050505]/60 text-sm mt-1 leading-relaxed">Use the bottom dock to take pictures instantly or upload from your device.</p>
                </div>
              </div>

              <div className="flex items-start gap-5 group">
                <div className="w-12 h-12 rounded-full border border-[#050505]/10 flex items-center justify-center text-[#050505] shrink-0 group-hover:scale-110 group-hover:bg-[#050505]/5 transition-all">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-bold text-[#050505] text-lg">Drag & Drop</h3>
                  <p className="text-[#050505]/60 text-sm mt-1 leading-relaxed">On a computer, simply drag your photos anywhere on this screen.</p>
                </div>
              </div>

              <div className="flex items-start gap-5 group">
                <div className="w-12 h-12 rounded-full border border-[#050505]/10 flex items-center justify-center text-[#050505] shrink-0 group-hover:scale-110 group-hover:bg-[#050505]/5 transition-all">
                  <Download className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-bold text-[#050505] text-lg">Save Memories</h3>
                  <p className="text-[#050505]/60 text-sm mt-1 leading-relaxed">Hover over any photo to download it directly, or scan its QR code to save to your phone.</p>
                </div>
              </div>

              <div className="flex items-start gap-5 group">
                <div className="w-12 h-12 rounded-full border border-[#050505]/10 flex items-center justify-center text-[#050505] shrink-0 group-hover:scale-110 group-hover:bg-[#050505]/5 transition-all">
                  <Share2 className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-bold text-[#050505] text-lg">Invite Others</h3>
                  <p className="text-[#050505]/60 text-sm mt-1 leading-relaxed">Use the QR Code or Share button at the top to let others join.</p>
                </div>
              </div>

            </div>

            <button
              onClick={() => setShowHelp(false)}
              className="mt-10 px-8 py-3 bg-[#050505] hover:bg-[#050505]/80 text-white font-bold rounded-full transition-colors relative z-10 w-full sm:w-auto"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {showQR && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowQR(false)}>
          <div onClick={e => e.stopPropagation()} className="relative bg-white p-10 rounded-[32px] max-w-sm w-full shadow-2xl text-center">
            <button
              onClick={() => setShowQR(false)}
              className="absolute top-6 right-6 text-[#050505]/40 hover:text-[#050505] transition-colors p-2 rounded-full hover:bg-[#050505]/5 z-50 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="font-heading text-3xl font-black tracking-tighter text-[#050505] mb-8">Scan to Join</h2>
            <QRCodeDisplay url={eventUrl} title={eventData.name} />
          </div>
        </div>
      )}

      {(isDragging || isUploadingDrag) && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-theme-4/80 backdrop-blur-sm border-4 border-dashed border-[#050505]/20 pointer-events-none">
          <div className="text-center p-10 bg-white rounded-[32px] shadow-2xl max-w-md mx-4">
            {isUploadingDrag ? (
              <>
                <Loader2 className="w-16 h-16 animate-spin text-[#050505] mx-auto mb-6" />
                <p className="text-3xl font-heading font-black tracking-tighter text-[#050505]">Uploading photos...</p>
                <p className="text-[#050505]/60 mt-2">They will appear in the gallery shortly</p>
              </>
            ) : (
              <>
                <Upload className="w-16 h-16 text-[#050505] mx-auto mb-6" />
                <p className="text-3xl font-heading font-black tracking-tighter text-[#050505]">Drop images to upload</p>
                <p className="text-[#050505]/60 mt-2">Release to add them to the gallery</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
