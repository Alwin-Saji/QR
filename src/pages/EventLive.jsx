import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../services/supabase';
import Gallery from '../components/Gallery';
import CameraCapture from '../components/CameraCapture';
import QRCodeDisplay from '../components/QRCodeDisplay';
import { QrCode, Share2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function EventLive() {
  const { eventId } = useParams();
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const { user } = useAuth();

  const eventUrl = window.location.href;

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .single();
          
        if (data) {
          setEventData(data);
        } else {
          console.error("No such event!", error);
        }
      } catch (error) {
        console.error("Error fetching event:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-theme-1 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-3"></div>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="min-h-screen w-full bg-theme-1 flex flex-col justify-center items-center text-center p-4">
        <h1 className="text-5xl font-heading font-bold text-theme-4 mb-2">Event Not Found</h1>
        <p className="text-theme-4/80">The event you are looking for does not exist or has expired.</p>
      </div>
    );
  }

  const isCreator = user && user.id === eventData.user_id;

  return (
    <div className="w-full min-h-full bg-theme-1 text-theme-4 relative pb-20 pt-20 md:pt-0">
      
      {/* Event Header */}
      <header className="px-6 py-8 border-b border-theme-3/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="font-heading font-bold text-5xl text-theme-4 truncate">{eventData.name || 'Live Event'}</h1>
        
        <div className="flex gap-3">
          <button 
            onClick={() => setShowQR(true)}
            className="flex items-center gap-2 px-4 py-2 bg-theme-2 text-theme-4 border border-theme-3/20 rounded-full hover:bg-theme-3 hover:text-theme-1 hover:border-theme-3 font-bold transition-all shadow-sm"
            aria-label="Show QR Code"
          >
            <QrCode className="w-5 h-5" />
            <span className="hidden sm:inline">QR Code</span>
          </button>
          <button 
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: eventData.name,
                  url: eventUrl
                });
              } else {
                navigator.clipboard.writeText(eventUrl);
                alert("Link copied to clipboard!");
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-theme-2 text-theme-4 border border-theme-3/20 rounded-full hover:bg-theme-3 hover:text-theme-1 hover:border-theme-3 font-bold transition-all shadow-sm"
            aria-label="Share"
          >
            <Share2 className="w-5 h-5" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </header>

      {/* Main Gallery Area */}
      <main className="container mx-auto max-w-7xl pt-8 px-4">
        <Gallery eventId={eventId} eventName={eventData.name} isCreator={isCreator} />
      </main>

      {/* Floating Action Button for Camera Capture */}
      <CameraCapture eventId={eventId} userId={`guest-${Math.random().toString(36).substr(2, 9)}`} />

      {/* QR Code Modal Overlay */}
      {showQR && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowQR(false)}>
          <div onClick={e => e.stopPropagation()} className="relative bg-theme-2 p-8 rounded-3xl max-w-sm w-full shadow-2xl border border-theme-3/20 text-center">
             <button 
                onClick={() => setShowQR(false)}
                className="absolute top-4 right-4 text-theme-4/50 hover:text-theme-4 font-bold transition-colors"
             >
                Close
             </button>
             <h2 className="font-heading text-3xl font-bold text-theme-4 mb-6">Scan to Join</h2>
             <QRCodeDisplay url={eventUrl} title={eventData.name} />
          </div>
        </div>
      )}
    </div>
  );
}
