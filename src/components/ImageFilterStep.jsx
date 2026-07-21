import React, { useState, useEffect, useRef } from 'react';
import { X, SlidersHorizontal, Sparkles, Frame as FrameIcon, Check } from 'lucide-react';
import { processCanvasImage } from '../utils/imageFilters';

export const ImageFilterStep = ({ originalFile, onApply, onCancel }) => {
  const [filterType, setFilterType] = useState('none');
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [frame, setFrame] = useState('none');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [imageSrc, setImageSrc] = useState('');

  // Lock scroll while editing
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // 1. High-reliability asynchronous file stream parsing
  useEffect(() => {
    if (!originalFile) return;

    if (typeof originalFile === 'string') {
      setImageSrc(originalFile);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageSrc(reader.result);
    };
    reader.readAsDataURL(originalFile);

    return () => {
      reader.abort();
    };
  }, [originalFile]);

  // 2. Continuous Canvas synchronization engine
  useEffect(() => {
    if (!canvasRef.current || !imageRef.current || !imageSrc) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const img = imageRef.current;

    const renderCanvas = () => {
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      if (width === 0 || height === 0) return;

      const MAX_PREVIEW_SIZE = 800;
      if (width > MAX_PREVIEW_SIZE || height > MAX_PREVIEW_SIZE) {
        const ratio = Math.min(MAX_PREVIEW_SIZE / width, MAX_PREVIEW_SIZE / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;
      
      canvas.__sourceImage = img;
      
      ctx.clearRect(0, 0, width, height);

      processCanvasImage(ctx, width, height, {
        filterType,
        brightness,
        contrast,
        saturation,
        frame
      });
    };

    if (img.complete && img.naturalWidth > 0) {
      renderCanvas();
    } else {
      img.onload = renderCanvas;
    }
  }, [filterType, brightness, contrast, saturation, frame, imageSrc]);

  const handleSave = () => {
    if (!imageRef.current || !imageSrc) return;
    setIsProcessing(true);
    
    const img = imageRef.current;
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = img.naturalWidth || img.width;
    exportCanvas.height = img.naturalHeight || img.height;
    
    exportCanvas.__sourceImage = img;
    const ctx = exportCanvas.getContext('2d');
    
    processCanvasImage(ctx, exportCanvas.width, exportCanvas.height, {
      filterType,
      brightness,
      contrast,
      saturation,
      frame
    });
    
    exportCanvas.toBlob((blob) => {
      setIsProcessing(false);
      onApply(blob);
    }, 'image/jpeg', 0.95);
  };

  return (
    <div className="bg-[#E4D6A9] text-[#050505] p-6 sm:p-8 rounded-[2.5rem] w-full max-w-lg mx-auto shadow-[0_20px_60px_rgba(0,0,0,0.4)] border border-[#050505]/15 flex flex-col max-h-[90vh] relative animate-in fade-in zoom-in duration-300">
      {/* Header */}
      <div className="flex justify-between items-center mb-5 shrink-0">
        <h3 className="text-3xl font-heading font-bold text-[#050505] tracking-wide">Edit Photo</h3>
        <button 
          onClick={onCancel}
          disabled={isProcessing}
          className="text-[#050505]/50 hover:text-[#050505] bg-[#050505]/5 hover:bg-[#050505]/10 rounded-full p-2 transition-all duration-300 disabled:opacity-50"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {/* Hidden Source Image */}
      {imageSrc && (
        <img 
          ref={imageRef} 
          src={imageSrc} 
          alt="source" 
          className="hidden" 
          crossOrigin="anonymous"
        />
      )}
      
      {/* Live Canvas Window */}
      <div className="flex justify-center mb-5 shrink-0 bg-[#050505]/5 p-2 rounded-2xl border border-[#050505]/10 shadow-inner">
        <canvas 
          ref={canvasRef} 
          className="rounded-xl border border-[#050505]/10 max-w-full max-h-[42vh] object-contain shadow-md" 
        />
      </div>

      {/* Scrollable Customization Container */}
      <div className="flex flex-col gap-5 overflow-y-auto scrollbar-hide flex-1 min-h-0 pr-1">

        {/* --- Filter Presets Block --- */}
        <div>
          <span className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-[#050505]/60 flex items-center gap-1.5 mb-2.5">
            <Sparkles className="w-3.5 h-3.5 opacity-70" />
            Filters
          </span>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {[
              { id: 'none', label: 'Original' },
              { id: 'bw', label: 'B&W' },
              { id: 'vintage', label: 'Vintage' },
              { id: 'warm', label: 'Warm' },
              { id: 'cool', label: 'Cool' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setFilterType(t.id)}
                className={`px-4 py-2 text-xs font-bold rounded-full transition-all whitespace-nowrap ${
                  filterType === t.id 
                    ? 'bg-[#050505] text-[#E4D6A9] shadow-md scale-105' 
                    : 'bg-[#050505]/10 text-[#050505]/80 hover:bg-[#050505]/20 border border-[#050505]/5'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* --- Frames Control Block --- */}
        <div>
          <span className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-[#050505]/60 flex items-center gap-1.5 mb-2.5">
            <FrameIcon className="w-3.5 h-3.5 opacity-70" />
            Frames
          </span>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {[
              { id: 'none', label: 'None' },
              { id: 'polaroid', label: 'Polaroid' },
              { id: 'film', label: 'Film' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFrame(f.id)}
                className={`px-4 py-2 text-xs font-bold rounded-full transition-all whitespace-nowrap ${
                  frame === f.id 
                    ? 'bg-[#050505] text-[#E4D6A9] shadow-md scale-105' 
                    : 'bg-[#050505]/10 text-[#050505]/80 hover:bg-[#050505]/20 border border-[#050505]/5'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* --- Adjustment Sliders Panel --- */}
        <div className="space-y-3">
          <span className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-[#050505]/60 flex items-center gap-1.5 mb-1">
            <SlidersHorizontal className="w-3.5 h-3.5 opacity-70" />
            Adjustments
          </span>
          
          <div className="flex flex-col gap-2.5 bg-[#050505]/5 p-4 rounded-2xl border border-[#050505]/10">
            {/* Brightness */}
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-[#050505]/80 w-20">Brightness</span>
              <input
                type="range" min="50" max="150" value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="flex-1 h-1.5 bg-[#050505]/20 rounded-lg appearance-none cursor-pointer accent-[#050505]"
              />
              <span className="text-[11px] font-mono text-[#050505]/60 w-8 text-right">{brightness}%</span>
            </div>

            {/* Contrast */}
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-[#050505]/80 w-20">Contrast</span>
              <input
                type="range" min="50" max="150" value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="flex-1 h-1.5 bg-[#050505]/20 rounded-lg appearance-none cursor-pointer accent-[#050505]"
              />
              <span className="text-[11px] font-mono text-[#050505]/60 w-8 text-right">{contrast}%</span>
            </div>

            {/* Saturation */}
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-[#050505]/80 w-20">Saturation</span>
              <input
                type="range" min="0" max="200" value={saturation}
                onChange={(e) => setSaturation(Number(e.target.value))}
                className="flex-1 h-1.5 bg-[#050505]/20 rounded-lg appearance-none cursor-pointer accent-[#050505]"
              />
              <span className="text-[11px] font-mono text-[#050505]/60 w-8 text-right">{saturation}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-end gap-3 pt-4 mt-2 shrink-0 border-t border-[#050505]/10">
        <button 
          onClick={onCancel} 
          disabled={isProcessing}
          className="px-5 py-2.5 text-sm font-bold text-[#050505]/70 hover:text-[#050505] hover:bg-[#050505]/5 transition-colors rounded-full disabled:opacity-50"
        >
          Cancel
        </button>
        <button 
          onClick={handleSave} 
          disabled={isProcessing}
          className="px-7 py-2.5 text-sm font-bold bg-[#050505] text-[#E4D6A9] hover:bg-[#050505]/90 rounded-full transition-all shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-2"
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-[#E4D6A9]/30 border-t-[#E4D6A9] rounded-full animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>Done</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ImageFilterStep;
