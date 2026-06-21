import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Zap, Shield, Users, ArrowRight, Image as ImageIcon } from 'lucide-react';

export default function Home() {
  return (
    <div className="w-full min-h-full bg-theme-1 text-theme-4 font-sans selection:bg-theme-3/30">
      
      {/* Navigation Bar */}
      <nav className="fixed w-full z-50 top-0 pt-4 px-4 md:px-8 pointer-events-none">
        <div className="max-w-6xl mx-auto flex justify-between items-center bg-theme-2/80 backdrop-blur-md border border-theme-3/20 rounded-2xl px-6 py-4 shadow-lg pointer-events-auto">
          <div className="flex items-center gap-2">
            <Camera className="w-6 h-6 text-theme-3" />
            <span className="font-heading font-bold text-xl tracking-tight">ARC</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://github.com/Alwin-Saji/QR" target="_blank" rel="noreferrer" className="hidden md:flex items-center gap-2 text-sm font-medium hover:text-theme-3 transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg> Star on GitHub
            </a>
            <Link to="/auth" className="bg-theme-3 text-theme-1 px-5 py-2 rounded-xl font-bold text-sm hover:bg-theme-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative container mx-auto px-4 pt-48 pb-32 text-center overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-theme-3/20 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="relative z-10">
          <div className="inline-flex items-center justify-center bg-theme-3/10 text-theme-3 px-4 py-1.5 rounded-full font-bold mb-8 text-sm border border-theme-3/20 shadow-sm backdrop-blur-sm animate-fade-in-up">
            <SparklesIcon className="w-4 h-4 mr-2" /> Open Source & Free Forever
          </div>
          <h1 className="text-6xl md:text-8xl font-heading font-extrabold text-theme-4 tracking-tight mb-8 leading-tight">
            Capture The <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-theme-3 to-theme-4">
              Perfect Moments
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-theme-4/70 max-w-2xl mx-auto mb-12 font-medium">
            Create an event, generate a custom QR code, and let your guests instantly upload and view photos in a real-time gallery. No apps required.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 items-center">
            <Link to="/dashboard" className="group bg-theme-3 text-theme-1 px-8 py-4 rounded-xl font-bold text-lg hover:bg-theme-4 shadow-lg hover:shadow-theme-3/20 transition-all hover:-translate-y-1 flex items-center gap-2">
              Start Your Event <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="https://github.com/Alwin-Saji/QR" target="_blank" rel="noreferrer" className="bg-theme-2/50 backdrop-blur-sm text-theme-4 border border-theme-3/20 px-8 py-4 rounded-xl font-bold text-lg hover:bg-theme-2 shadow-sm transition-all flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg> View Source
            </a>
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section id="features" className="relative bg-theme-2/30 py-32 border-t border-theme-3/10">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-theme-4 mb-4">Why use ARC?</h2>
            <p className="text-theme-4/60 text-lg max-w-2xl mx-auto">Everything you need to collect memories from your guests seamlessly.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard 
              icon={<Zap className="w-8 h-8 text-theme-1" />}
              title="Real-time Sync"
              desc="Powered by Supabase Realtime. Photos appear instantly on everyone's screen the second they are uploaded."
            />
            <FeatureCard 
              icon={<Users className="w-8 h-8 text-theme-1" />}
              title="Zero Friction"
              desc="Guests just point their camera at your QR code. No app downloads, no account creation, no hassle."
            />
            <FeatureCard 
              icon={<Shield className="w-8 h-8 text-theme-1" />}
              title="Secure & Private"
              desc="Backed by Row Level Security. Only you can manage your events, and photos auto-delete after 24 hours."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-theme-1 py-12 border-t border-theme-3/10">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Camera className="w-6 h-6 text-theme-3" />
            <span className="font-heading font-bold text-2xl text-theme-4">ARC</span>
          </div>
          <p className="text-theme-4/50 mb-6 font-medium">An open-source real-time photo sharing platform.</p>
          <div className="flex justify-center gap-6">
            <a href="https://github.com/Alwin-Saji/QR" className="text-theme-4/40 hover:text-theme-3 transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="group p-8 bg-theme-2/50 backdrop-blur-sm rounded-3xl border border-theme-3/10 hover:border-theme-3/30 shadow-lg hover:shadow-xl hover:shadow-theme-3/5 transition-all duration-300 hover:-translate-y-2">
      <div className="bg-gradient-to-br from-theme-3 to-theme-4 w-14 h-14 rounded-2xl shadow-sm flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-2xl font-heading font-bold text-theme-4 mb-3">{title}</h3>
      <p className="text-theme-4/70 leading-relaxed font-medium">
        {desc}
      </p>
    </div>
  );
}

function SparklesIcon(props) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9.937 15.5A2 2 0 008.5 14.063l-6.135-1.582a.5.5 0 010-.962L8.5 9.936A2 2 0 009.937 8.5l1.582-6.135a.5.5 0 01.963 0L14.063 8.5A2 2 0 0015.5 9.937l6.135 1.581a.5.5 0 010 .964L15.5 14.063a2 2 0 00-1.437 1.437l-1.582 6.135a.5.5 0 01-.963 0z" />
    </svg>
  );
}
