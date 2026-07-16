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
      <div className="relative bg-gradient-to-br from-theme-3 to-theme-4 p-[3px] rounded-3xl shadow-2xl mb-8 group hover:scale-105 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]">
        <div className="bg-[#0a0a0a] p-4 rounded-[22px]">
          <div className="bg-white p-3 rounded-2xl shadow-inner" ref={qrRef}>
            <QRCodeCanvas
              value={url}
              size={220}
              bgColor={bgColor}
              fgColor={fgColor}
              level={"Q"}
              includeMargin={true}
              imageSettings={{
                src: "/vite.svg",
                x: undefined,
                y: undefined,
                height: 24,
                width: 24,
                excavate: true,
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4 w-full mb-8">
        <button
          onClick={copyLink}
          className="flex-1 flex items-center justify-center gap-2 bg-black/40 text-theme-4 font-bold px-4 py-3.5 rounded-2xl border border-theme-4/20 hover:bg-black/60 hover:border-theme-4/40 hover:-translate-y-1 transition-all duration-300 shadow-lg backdrop-blur-md group"
        >
          <Copy className="w-5 h-5 group-hover:scale-110 transition-transform" /> Copy Link
        </button>
        <button
          onClick={downloadQR}
          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-theme-3 to-theme-4 text-[#0a0a0a] font-bold px-4 py-3.5 rounded-2xl hover:shadow-[0_0_30px_rgba(var(--theme-4-rgb),0.5)] hover:-translate-y-1 transition-all duration-300 shadow-[0_0_20px_rgba(var(--theme-3-rgb),0.3)] group"
        >
          <Download className="w-5 h-5 group-hover:scale-110 transition-transform" /> Save QR
        </button>
      </div>

      <div className="w-full">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-full flex items-center justify-center gap-2 text-theme-4/60 hover:text-theme-4 font-semibold py-2 transition-colors mb-4"
        >
          <Settings2 className="w-4 h-4" /> {showSettings ? "Hide Customization" : "Customize Colors"}
        </button>

        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showSettings ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="p-5 bg-black/40 backdrop-blur-md rounded-2xl border border-theme-4/20 flex justify-between gap-6 shadow-xl">
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-theme-4/60 mb-2 uppercase tracking-widest">Pattern Color</label>
              <div className="flex items-center gap-3">
                <div className="relative group">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer border-0 p-0 shadow-inner group-hover:scale-110 transition-transform"
                  />
                  <div className="absolute inset-0 rounded-xl ring-2 ring-theme-4/20 pointer-events-none group-hover:ring-theme-4/50 transition-colors"></div>
                </div>
                <span className="text-sm font-mono text-theme-4/80 tracking-wider">{fgColor}</span>
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-theme-4/60 mb-2 uppercase tracking-widest">Background</label>
              <div className="flex items-center gap-3">
                <div className="relative group">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer border-0 p-0 shadow-inner group-hover:scale-110 transition-transform"
                  />
                  <div className="absolute inset-0 rounded-xl ring-2 ring-theme-4/20 pointer-events-none group-hover:ring-theme-4/50 transition-colors"></div>
                </div>
                <span className="text-sm font-mono text-theme-4/80 tracking-wider">{bgColor}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
