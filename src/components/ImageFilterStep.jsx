import React, { useState, useEffect, useRef } from 'react';
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

    // Handle direct file paths or strings smoothly
    if (typeof originalFile === 'string') {
      setImageSrc(originalFile);
      return;
    }

    // Use FileReader instead of unstable createObjectURL to prevent StrictMode cleanup drops
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

      // Downscale for buttery smooth live preview
      const MAX_PREVIEW_SIZE = 800;
      if (width > MAX_PREVIEW_SIZE || height > MAX_PREVIEW_SIZE) {
        const ratio = Math.min(MAX_PREVIEW_SIZE / width, MAX_PREVIEW_SIZE / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;
      
      // 💡 CACHE THE IMAGE ELEMENT ON THE CANVAS:
      canvas.__sourceImage = img;
      
      ctx.clearRect(0, 0, width, height);

      // Execute customization parameters
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
    
    // Create an offscreen canvas at full resolution for the final output
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
    <div className="bg-theme-1 text-theme-4 p-6 rounded-2xl w-full max-w-lg mx-auto shadow-sm border border-theme-3/10 flex flex-col max-h-[85vh]">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <h3 className="text-xl font-heading font-medium text-theme-4">Edit Photo</h3>
      </div>
      
      {/* Structural Reference Mirror Element */}
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
      <div className="flex justify-center mb-4 shrink-0">
        <canvas 
          ref={canvasRef} 
          className="bg-theme-2 rounded-xl border border-theme-3/10 max-w-full max-h-[50vh] object-contain shadow-sm" 
        />
      </div>

      {/* Scrollable Customization Container */}
      <div className="flex flex-col gap-6 overflow-y-auto scrollbar-hide flex-1 min-h-0">

      {/* --- Filter Presets Block --- */}
      <div>
        <span className="text-[10px] font-medium uppercase tracking-widest text-theme-4/50 block mb-3">Filters</span>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {['none', 'bw', 'vintage', 'warm', 'cool'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-4 py-2 text-xs rounded-full transition-all whitespace-nowrap ${
                filterType === t 
                  ? 'bg-theme-4 text-theme-1 font-medium' 
                  : 'bg-theme-2 text-theme-4/70 hover:bg-theme-3/10 hover:text-theme-4 border border-theme-3/20'
              }`}
            >
              {t === 'none' ? 'Original' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* --- Frames Control Block --- */}
      <div>
        <span className="text-[10px] font-medium uppercase tracking-widest text-theme-4/50 block mb-3">Frames</span>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'none', label: 'None' },
            { id: 'polaroid', label: 'Polaroid' },
            { id: 'film', label: 'Film' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFrame(f.id)}
              className={`px-4 py-2 text-xs rounded-full transition-all whitespace-nowrap ${
                frame === f.id 
                  ? 'bg-theme-4 text-theme-1 font-medium' 
                  : 'bg-theme-2 text-theme-4/70 hover:bg-theme-3/10 hover:text-theme-4 border border-theme-3/20'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* --- Adjustment Sliders Panel --- */}
      <div className="space-y-4">
        <span className="text-[10px] font-medium uppercase tracking-widest text-theme-4/50 block mb-1">Adjustments</span>
        
        <div className="flex flex-col gap-3">
          {/* Brightness */}
          <div className="flex items-center gap-4">
            <span className="text-xs text-theme-4/70 w-16">Brightness</span>
            <input
              type="range" min="50" max="150" value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="flex-1 h-1 bg-theme-3/20 rounded-lg appearance-none cursor-pointer accent-theme-4"
            />
          </div>

          {/* Contrast */}
          <div className="flex items-center gap-4">
            <span className="text-xs text-theme-4/70 w-16">Contrast</span>
            <input
              type="range" min="50" max="150" value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
              className="flex-1 h-1 bg-theme-3/20 rounded-lg appearance-none cursor-pointer accent-theme-4"
            />
          </div>

          {/* Saturation */}
          <div className="flex items-center gap-4">
            <span className="text-xs text-theme-4/70 w-16">Saturation</span>
            <input
              type="range" min="0" max="200" value={saturation}
              onChange={(e) => setSaturation(Number(e.target.value))}
              className="flex-1 h-1 bg-theme-3/20 rounded-lg appearance-none cursor-pointer accent-theme-4"
            />
          </div>
        </div>
      </div>
      </div>

      {/* Action Footers */}
      <div className="flex justify-end gap-3 pt-4 mt-2 shrink-0 border-t border-theme-3/10">
        <button 
          onClick={onCancel} 
          disabled={isProcessing}
          className="px-5 py-2 text-sm font-medium text-theme-4/60 hover:text-theme-4 transition-colors rounded-lg disabled:opacity-50"
        >
          Cancel
        </button>
        <button 
          onClick={handleSave} 
          disabled={isProcessing}
          className="px-6 py-2 text-sm font-medium bg-theme-4 text-theme-1 hover:bg-theme-4/90 rounded-lg transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {isProcessing ? 'Processing...' : 'Done'}
        </button>
      </div>
    </div>
  );
};

export default ImageFilterStep;
