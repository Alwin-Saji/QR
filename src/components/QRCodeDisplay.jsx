import React, { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, Copy, Settings2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function QRCodeDisplay({ url, title = "Join Event" }) {
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [showSettings, setShowSettings] = useState(false);
  const qrRef = useRef(null);

  const downloadQR = () => {
    const canvas = qrRef.current.querySelector('canvas');
    if (!canvas) return;
    
    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");
      
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `${title.replace(/\s+/g, '_')}_QR.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    toast.success('QR code downloaded!');
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Event link copied!');
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast.error('Could not copy the link');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6" ref={qrRef}>
        <QRCodeCanvas 
          value={url} 
          size={220}
          bgColor={bgColor}
          fgColor={fgColor}
          level={"Q"}
          includeMargin={true}
          imageSettings={{
            src: "/vite.svg", // Fallback logo if they have one, or remove. Let's just do colors for now to keep it clean.
            x: undefined,
            y: undefined,
            height: 24,
            width: 24,
            excavate: true,
          }}
        />
      </div>

      <div className="flex gap-2 w-full mb-6">
        <button 
          onClick={copyLink}
          className="flex-1 flex items-center justify-center gap-2 bg-theme-1 text-theme-4 font-bold px-4 py-3 rounded-xl border border-theme-3/20 hover:bg-theme-3/10 transition-colors"
        >
          <Copy className="w-5 h-5" /> Copy Link
        </button>
        <button 
          onClick={downloadQR}
          className="flex-1 flex items-center justify-center gap-2 bg-theme-3 text-theme-1 font-bold px-4 py-3 rounded-xl hover:bg-theme-4 transition-colors"
        >
          <Download className="w-5 h-5" /> Save QR
        </button>
      </div>

      <div className="w-full">
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="w-full flex items-center justify-center gap-2 text-theme-4/60 hover:text-theme-4 font-semibold py-2 transition-colors"
        >
          <Settings2 className="w-4 h-4" /> {showSettings ? "Hide Customization" : "Customize Colors"}
        </button>

        {showSettings && (
          <div className="mt-4 p-4 bg-theme-1 rounded-xl border border-theme-3/10 flex justify-between gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold text-theme-4/60 mb-1 uppercase tracking-wider">Pattern Color</label>
              <div className="flex items-center gap-2">
                <input 
                  type="color" 
                  value={fgColor} 
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                />
                <span className="text-sm font-mono">{fgColor}</span>
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-theme-4/60 mb-1 uppercase tracking-wider">Background</label>
              <div className="flex items-center gap-2">
                <input 
                  type="color" 
                  value={bgColor} 
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                />
                <span className="text-sm font-mono">{bgColor}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
