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
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
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
          className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 sm:left-6"
          title="Previous photo"
        >
          <ChevronLeft className="h-7 w-7" />
        </button>
      )}

      <div
        className="flex h-full w-full max-w-6xl flex-col items-center justify-center gap-4"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="min-h-0 w-full flex-1 overflow-hidden rounded-2xl bg-black/40 shadow-2xl ring-1 ring-white/10">
          <LazyImage
            src={photo.url}
            alt="Event moment"
            className="h-full w-full object-contain"
          />
        </div>

        <div className="flex w-full max-w-4xl flex-col gap-3 rounded-2xl bg-theme-2/95 p-4 shadow-xl ring-1 ring-theme-3/20 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 text-center sm:text-left">
            <p className="truncate text-sm font-bold text-theme-4">Uploaded by {uploadedBy}</p>
            {hasMultiple && (
              <p className="mt-1 text-xs font-semibold text-theme-4/55">
                {currentIndex + 1} of {photos.length}
              </p>
            )}
          </div>

          <div className="flex items-center justify-center gap-2">
            {hasMultiple && (
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-2 rounded-full border border-theme-3/25 bg-theme-1/50 px-4 py-2 text-sm font-bold text-theme-4 transition-colors hover:bg-theme-1"
                title={isPlaying ? "Pause Slideshow" : "Play Slideshow"}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isPlaying ? 'Pause' : 'Play'}
              </button>
            )}
            <a
              href={`${photo.url}?download=${downloadName}`}
              download={downloadName}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-full bg-theme-3 px-4 py-2 text-sm font-bold text-theme-1 transition-colors hover:bg-theme-4"
              title="Download photo"
            >
              <Download className="h-4 w-4" />
              Save
            </a>
            <button
              type="button"
              onClick={() => onShowQR(photo)}
              className="flex items-center gap-2 rounded-full border border-theme-3/25 bg-theme-1/50 px-4 py-2 text-sm font-bold text-theme-4 transition-colors hover:bg-theme-1"
              title="Show QR code"
            >
              <QrCode className="h-4 w-4" />
              Scan QR
            </button>
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
          className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 sm:right-6"
          title="Next photo"
        >
          <ChevronRight className="h-7 w-7" />
        </button>
      )}
    </div>
  );
}
