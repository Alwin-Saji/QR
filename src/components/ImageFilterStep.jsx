// src/components/ImageFilterStep.jsx
import React, { useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';

const FILTER_OPTIONS = [
  { id: 'none', name: 'Original', class: '' },
  { id: 'grayscale', name: 'B&W', class: 'grayscale' },
  { id: 'vintage', name: 'Vintage', class: 'sepia brightness-95 contrast-110' },
  { id: 'warm', name: 'Warm', class: 'sepia-0 hue-rotate-15 saturate-125' },
  { id: 'cool', name: 'Cool', class: 'hue-rotate-180 brightness-105' },
];

export default function ImageFilterStep({ imageSrc, onCancel, onConfirm }) {
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApply = async () => {
    setIsProcessing(true);
    await onConfirm(selectedFilter);
    setIsProcessing(false);
  };

  return (
    <div className="flex flex-col items-center bg-zinc-950 text-white p-4 justify-between rounded-2xl border border-zinc-800 max-w-md mx-auto w-full">
      <div className="w-full flex justify-between items-center pb-2 border-b border-zinc-900">
        <button onClick={onCancel} className="p-2 hover:bg-zinc-900 rounded-full transition" disabled={isProcessing}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="font-medium text-sm tracking-wide">Edit Photo</span>
        <div className="w-9"></div>
      </div>

      <div className="relative w-full aspect-[3/4] my-4 bg-zinc-900 rounded-xl overflow-hidden flex items-center justify-center border border-zinc-800">
        <img 
          src={imageSrc} 
          alt="Preview" 
          className={`w-full h-full object-cover transition-all duration-200 ${
            FILTER_OPTIONS.find(f => f.id === selectedFilter)?.class
          }`}
        />
      </div>

      <div className="w-full space-y-4">
        <div className="flex gap-3 overflow-x-auto py-2 px-1">
          {FILTER_OPTIONS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className="flex flex-col items-center space-y-1 flex-shrink-0"
            >
              <div className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                selectedFilter === filter.id ? 'border-amber-500 scale-105' : 'border-transparent opacity-60'
              }`}>
                <img src={imageSrc} alt="" className={`w-full h-full object-cover ${filter.class}`} />
              </div>
              <span className={`text-[10px] ${selectedFilter === filter.id ? 'text-amber-400 font-medium' : 'text-zinc-400'}`}>
                {filter.name}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={handleApply}
          disabled={isProcessing}
          className="w-full py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-zinc-800 text-black font-semibold rounded-xl flex items-center justify-center gap-2 text-sm"
        >
          {isProcessing ? (
            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>Apply & Upload</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}