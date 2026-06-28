import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw } from 'lucide-react';
import { processCanvasImage } from '../utils/imageFilters';

export const ImageFilterStep = ({ originalFile, onApply, onCancel }) => {
  // 1. Declare 0-centered default states (-100 to 100)
  const [filterType, setFilterType] = useState('none');
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [frame, setFrame] = useState('none');
  
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [imageSrc, setImageSrc] = useState('');

  // 2. Clear state back to default settings
  const handleReset = () => {
    setFilterType('none');
    setBrightness(0);
    setContrast(0);
    setSaturation(0);
    setFrame('none');
  };

  useEffect(() => {
    if (!originalFile) return;

    let url = '';
    if (originalFile instanceof File || originalFile instanceof Blob) {
      url = URL.createObjectURL(originalFile);
    } else if (typeof originalFile === 'string') {
      url = originalFile;
    }

    setImageSrc(url);

    return () => {
      if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    };
  }, [originalFile]);

  // 3. Continuous Canvas synchronization engine
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
      
      canvas.__sourceImage = img;
      
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
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-bold tracking-wide">Customize Your Capture</h3>
        <button 
          onClick={handleReset}
          className="flex items-center gap-1.5 text-xs font-semibold bg-stone-900 hover:bg-stone-800 border border-stone-800 px-3 py-1.5 rounded-lg text-amber-500 transition-all active:scale-95"
          title="Reset all updates"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>
      
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

      {/* --- Slider Configuration Panel --- */}
      <div className="space-y-3 bg-stone-900/40 p-4 rounded-lg border border-stone-900 mb-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 block mb-1">Fine-Tune Adjustments</span>
        
        {/* Brightness Input Slider */}
        <div>
          <div className="flex justify-between text-xs text-stone-300 mb-1">
            <span>Brightness</span>
            <span className={brightness > 0 ? "text-emerald-400" : brightness < 0 ? "text-amber-400" : "text-stone-400"}>
              {brightness > 0 ? `+${brightness}` : brightness}
            </span>
          </div>
          <input
            type="range" min="-100" max="100" value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            className="w-full h-1 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>

        {/* Contrast Input Slider */}
        <div>
          <div className="flex justify-between text-xs text-stone-300 mb-1">
            <span>Contrast</span>
            <span className={contrast > 0 ? "text-emerald-400" : contrast < 0 ? "text-amber-400" : "text-stone-400"}>
              {contrast > 0 ? `+${contrast}` : contrast}
            </span>
          </div>
          <input
            type="range" min="-100" max="100" value={contrast}
            onChange={(e) => setContrast(Number(e.target.value))}
            className="w-full h-1 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>

        {/* Saturation Input Slider */}
        <div>
          <div className="flex justify-between text-xs text-stone-300 mb-1">
            <span>Saturation</span>
            <span className={saturation > 0 ? "text-emerald-400" : saturation < 0 ? "text-amber-400" : "text-stone-400"}>
              {saturation > 0 ? `+${saturation}` : saturation}
            </span>
          </div>
          <input
            type="range" min="-100" max="100" value={saturation}
            onChange={(e) => setSaturation(Number(e.target.value))}
            className="w-full h-1 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>
      </div>

      {/* Control Buttons */}
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