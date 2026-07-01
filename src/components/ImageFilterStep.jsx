import React, { useState, useEffect, useRef } from 'react';
import { processCanvasImage } from '../utils/imageFilters';

export const ImageFilterStep = ({ originalFile, onApply, onCancel }) => {
  const [filterType, setFilterType] = useState('none');
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [frame, setFrame] = useState('none');
  
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [imageSrc, setImageSrc] = useState('');

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
      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;

      if (width === 0 || height === 0) return;

      canvas.width = width;
      canvas.height = height;
      
      // 💡 CACHE THE IMAGE ELEMENT ON THE CANVAS:
      canvas.__sourceImage = img;
      
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0);

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
    if (!canvasRef.current) return;
    canvasRef.current.toBlob((blob) => {
      onApply(blob);
    }, 'image/jpeg', 0.95);
  };

  return (
    <div className="filter-modal bg-stone-950 text-white p-6 rounded-xl max-w-lg mx-auto shadow-2xl border border-stone-800">
      <h3 className="text-lg font-bold mb-4 tracking-wide text-center">Customize Your Capture</h3>
      
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
      <div className="flex justify-center mb-4 bg-black/40 rounded-lg overflow-hidden border border-stone-900 min-h-[220px] items-center">
        <canvas ref={canvasRef} className="max-w-full max-h-[350px] object-contain" />
      </div>

      {/* --- Filter Presets Block --- */}
      <div className="mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 block mb-2">Filters</span>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {['none', 'bw', 'vintage', 'warm', 'cool'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all uppercase ${
                filterType === t ? 'bg-amber-600 text-white shadow-md' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              {t === 'none' ? 'Normal' : t}
            </button>
          ))}
        </div>
      </div>

      {/* --- Frames Control Block --- */}
      <div className="mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 block mb-2">Creative Frames</span>
        <div className="flex gap-2">
          {[
            { id: 'none', label: 'No Frame' },
            { id: 'polaroid', label: '📸 Polaroid' },
            { id: 'film', label: '🎞️ Retro Film' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFrame(f.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                frame === f.id ? 'bg-amber-600 text-white shadow-md' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* --- Adjustment Sliders Panel --- */}
      <div className="space-y-3 bg-stone-900/60 p-4 rounded-lg border border-stone-800 mb-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 block mb-1">Fine-Tune Adjustments</span>
        
        <div>
          <div className="flex justify-between text-xs text-stone-300 mb-1">
            <span>Brightness</span>
            <span>{brightness}%</span>
          </div>
          <input
            type="range" min="50" max="150" value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            className="w-full h-1 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs text-stone-300 mb-1">
            <span>Contrast</span>
            <span>{contrast}%</span>
          </div>
          <input
            type="range" min="50" max="150" value={contrast}
            onChange={(e) => setContrast(Number(e.target.value))}
            className="w-full h-1 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs text-stone-300 mb-1">
            <span>Saturation</span>
            <span>{saturation}%</span>
          </div>
          <input
            type="range" min="0" max="200" value={saturation}
            onChange={(e) => setSaturation(Number(e.target.value))}
            className="w-full h-1 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>
      </div>

      {/* Action Footers */}
      <div className="flex justify-end gap-3 border-t border-stone-900 pt-4">
        <button onClick={onCancel} className="px-4 py-2 text-sm text-stone-400 hover:text-white transition-colors">
          Cancel
        </button>
        <button onClick={handleSave} className="px-5 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-all shadow-md">
          Apply & Upload
        </button>
      </div>
    </div>
  );
};

export default ImageFilterStep;
