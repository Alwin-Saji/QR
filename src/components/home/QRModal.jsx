import React from 'react';
import { X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function QRModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="relative bg-[#0a0a0a] backdrop-blur-md border border-theme-4/20 p-8 rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-300">
        <button onClick={onClose} className="absolute top-4 right-4 text-theme-4/50 hover:text-theme-4 transition-colors p-1">
          <X className="w-6 h-6" />
        </button>
        <div className="bg-theme-4 p-4 rounded-2xl shadow-xl mt-4">
          <QRCodeSVG value="https://github.com/Alwin-Saji/QR" size={200} bgColor="transparent" fgColor="#0a0a0a" />
        </div>
        <div className="text-center">
          <h3 className="text-2xl font-heading font-bold text-theme-4 mb-2 tracking-wide">Scan to Join</h3>
          <p className="text-[10px] font-sans font-bold tracking-[0.2em] text-theme-4/70 uppercase">No Apps Required</p>
        </div>
      </div>
    </div>
  );
}
