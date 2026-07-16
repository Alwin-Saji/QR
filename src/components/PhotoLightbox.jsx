import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Download, QrCode, X, Play, Pause } from 'lucide-react';
import LazyImage from './LazyImage';

export default function PhotoLightbox({
  photos,
  currentIndex,
  eventName,
  onClose,
  onPrevious,
  onNext,
  onShowQR,
  startSlideshow = false
}) {
  const photo = currentIndex === null ? null : photos[currentIndex];
  const hasMultiple = photos.length > 1;
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (currentIndex !== null && startSlideshow) {
      setIsPlaying(true);
    } else if (currentIndex === null) {
      setIsPlaying(false);
    }
  }, [currentIndex, startSlideshow]);

  useEffect(() => {
    let interval;
    if (isPlaying && photo && hasMultiple) {
      interval = setInterval(() => {
        onNext();
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, photo, hasMultiple, onNext]);

  useEffect(() => {
    if (!photo) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft') onPrevious();
      if (event.key === 'ArrowRight') onNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [photo, onClose, onPrevious, onNext]);

  if (!photo) return null;

  const safeName = (eventName || 'Event').replace(/[^a-zA-Z0-9]/g, '_');
  const timeStr = (photo.created_at ? new Date(photo.created_at) : new Date())
    .toTimeString()
    .split(' ')[0]
    .replace(/:/g, '-');
  const downloadName = `${safeName}_${timeStr}.jpg`;
  const uploadedBy = photo.uploaded_by?.trim() || photo.uploader_id?.trim() || 'Guest';

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 sm:p-8 animate-in fade-in duration-500"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-6 top-6 z-10 rounded-full bg-black/40 border border-theme-4/20 p-4 text-theme-4/70 transition-all duration-300 hover:bg-black/60 hover:text-theme-4 hover:scale-110 backdrop-blur-md shadow-xl"
        title="Close"
      >
        <X className="h-6 w-6" />
      </button>

      {hasMultiple && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onPrevious();
          }}
          className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 border border-theme-4/20 p-4 text-theme-4/70 transition-all duration-300 hover:bg-black/60 hover:text-theme-4 hover:scale-110 backdrop-blur-md shadow-xl sm:left-8 group"
          title="Previous photo"
        >
          <ChevronLeft className="h-8 w-8 group-hover:-translate-x-1 transition-transform" />
        </button>
      )}

      <div
        className="flex h-full w-full max-w-7xl flex-col items-center justify-center gap-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="min-h-0 w-full flex-1 overflow-hidden rounded-[2.5rem] bg-black/40 backdrop-blur-md shadow-[0_30px_100px_rgba(0,0,0,0.8)] border border-theme-4/10 relative group animate-in zoom-in-95 duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-theme-3/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-10"></div>
          <LazyImage
            src={photo.url}
            alt="Event moment"
            className="h-full w-full object-contain transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02]"
            containerClassName="!bg-transparent"
          />
        </div>

        <div className="flex w-full max-w-5xl flex-col gap-4 rounded-3xl bg-black/40 backdrop-blur-2xl p-6 shadow-2xl border border-theme-4/20 sm:flex-row sm:items-center sm:justify-between animate-in slide-in-from-bottom-8 duration-500">
          <div className="min-w-0 text-center sm:text-left flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-theme-3 to-theme-4 p-[2px] shadow-lg">
              <div className="h-full w-full rounded-full bg-[#0a0a0a] flex items-center justify-center">
                <span className="text-theme-4 font-bold text-lg">{uploadedBy.charAt(0).toUpperCase()}</span>
              </div>
            </div>
            <div>
              <p className="truncate text-base font-bold text-theme-4 tracking-wide">Uploaded by {uploadedBy}</p>
              {hasMultiple && (
                <p className="text-xs font-semibold text-theme-4/50 tracking-wider uppercase mt-1">
                  Photo {currentIndex + 1} of {photos.length}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {hasMultiple && (
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-bold transition-all duration-300 shadow-lg hover:scale-105 ${isPlaying ? 'border-theme-3 bg-theme-3/20 text-theme-3' : 'border-theme-4/30 bg-black/40 text-theme-4 hover:bg-black/60 hover:border-theme-4/60'}`}
                title={isPlaying ? "Pause Slideshow" : "Play Slideshow"}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isPlaying ? 'Pause' : 'Play'}
              </button>
            )}
            <button
              type="button"
              onClick={() => onShowQR(photo)}
              className="flex items-center gap-2 rounded-full border border-theme-4/30 bg-black/40 px-5 py-2.5 text-sm font-bold text-theme-4 transition-all duration-300 shadow-lg hover:bg-black/60 hover:border-theme-4/60 hover:scale-105"
              title="Show QR code"
            >
              <QrCode className="h-4 w-4" />
              Scan QR
            </button>
            <a
              href={`${photo.url}?download=${downloadName}`}
              download={downloadName}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-theme-3 to-theme-4 px-6 py-2.5 text-sm font-bold text-[#0a0a0a] transition-all duration-300 shadow-[0_0_20px_rgba(var(--theme-3-rgb),0.3)] hover:shadow-[0_0_30px_rgba(var(--theme-4-rgb),0.5)] hover:scale-105"
              title="Download photo"
            >
              <Download className="h-4 w-4" />
              Save
            </a>
          </div>
        </div>
      </div>

      {hasMultiple && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onNext();
          }}
          className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 border border-theme-4/20 p-4 text-theme-4/70 transition-all duration-300 hover:bg-black/60 hover:text-theme-4 hover:scale-110 backdrop-blur-md shadow-xl sm:right-8 group"
          title="Next photo"
        >
          <ChevronRight className="h-8 w-8 group-hover:translate-x-1 transition-transform" />
        </button>
      )}
    </div>
  );
}
