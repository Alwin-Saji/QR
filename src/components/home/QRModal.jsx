import React from 'react';
import { X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function QRModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl transition-opacity" onClick={onClose}></div>
      <div className="relative bg-black/40 backdrop-blur-2xl border border-theme-4/20 p-10 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col items-center gap-8 animate-in fade-in zoom-in duration-500 overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-theme-4/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        <button onClick={onClose} className="absolute top-6 right-6 text-theme-4/50 hover:text-theme-4 bg-black/20 hover:bg-black/40 rounded-full p-2 transition-all duration-300 backdrop-blur-md">
          <X className="w-5 h-5" />
        </button>
        <div className="relative bg-gradient-to-br from-theme-3 to-theme-4 p-[3px] rounded-3xl shadow-2xl overflow-hidden group-hover:scale-105 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]">
          <div className="bg-[#0a0a0a] p-4 rounded-[22px]">
            <div className="bg-white p-3 rounded-2xl shadow-inner">
              <QRCodeSVG value="https://github.com/Alwin-Saji/QR" size={220} bgColor="transparent" fgColor="#0a0a0a" />
            </div>
          </div>
        </div>
        <div className="text-center relative z-10">
          <h3 className="text-3xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-theme-3 to-theme-4 mb-2 tracking-wide drop-shadow-sm">Scan to Join</h3>
          <p className="text-[11px] font-sans font-bold tracking-[0.25em] text-theme-4/70 uppercase flex items-center justify-center gap-2">
            <span className="w-4 h-[1px] bg-theme-4/40"></span>
            No Apps Required
            <span className="w-4 h-[1px] bg-theme-4/40"></span>
          </p>
        </div>
      </div>
    </div>
  );
}
