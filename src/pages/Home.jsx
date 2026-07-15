import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Hero from '../components/home/Hero';
import About from '../components/home/About';
import Features from '../components/home/Features';
import Footer from '../components/home/Footer';
import QRModal from '../components/home/QRModal';

export default function Home() {
  const { user } = useAuth();
  const [isQRModalOpen, setIsQRModalOpen] = React.useState(false);

  React.useEffect(() => {
    if (isQRModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isQRModalOpen]);

  return (
    <div className="w-full min-h-screen bg-theme-4 text-theme-1 font-sans selection:bg-theme-2/20 overflow-x-hidden relative">
      <Hero
        user={user}
        setIsQRModalOpen={setIsQRModalOpen}
      />
      <About />
      <Features />
      <Footer />
      <QRModal isOpen={isQRModalOpen} onClose={() => setIsQRModalOpen(false)} />
    </div>
  );
}
