import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Trash2, Clock, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
  const [eventName, setEventName] = useState('');
  const [autoDelete, setAutoDelete] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchEvents = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error fetching events:", error);
      } else {
        setEvents(data || []);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [user]);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!eventName.trim() || !user) return;

    try {
      setIsCreating(true);
      const payload = { name: eventName, user_id: user.id, auto_delete: autoDelete };

      const { data, error } = await supabase
        .from('events')
        .insert([payload])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        toast.success('Event created successfully!');
        navigate(`/event/${data[0].id}`);
      }
    } catch (error) {
      console.error("Error creating event: ", error);
      toast.error('Failed to create event. Please check your Supabase configuration.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteEvent = async (e, eventId) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) return;

    try {
      // First, delete the folder and all its contents in ImageKit
      await fetch('/api/imagekit-delete-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderPath: `/events/${eventId}` })
      }).catch(err => console.error("ImageKit folder delete failed:", err));

      // Then delete the event from the database (which cascades to photos table)
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      setEvents(events.filter(event => event.id !== eventId));
      toast.success('Event deleted');
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error('Failed to delete event');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <div className="w-full min-h-screen bg-theme-4 text-[#050505] flex flex-col items-center pt-32 pb-24 px-6 relative">
      
      {/* Background Decor */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/30 rounded-full blur-[120px] pointer-events-none"></div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-2xl flex flex-col items-center relative z-10"
      >
        <motion.div variants={itemVariants} className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-heading font-black tracking-tighter mb-4">
            New Space
          </h1>
          <p className="text-[#050505]/50 font-light">Enter a name to generate a real-time photo gallery.</p>
        </motion.div>

        {/* Minimal Form WITH Buttons */}
        <motion.div variants={itemVariants} className="w-full mb-24">
          <form onSubmit={handleCreateEvent} className="flex flex-col gap-6">
            <div className="relative">
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Name your event..."
                className="w-full bg-transparent border-b-2 border-[#050505]/20 text-[#050505] placeholder:text-[#050505]/30 px-0 py-4 focus:ring-0 focus:border-[#050505] outline-none transition-colors text-3xl font-light text-center"
                disabled={isCreating}
                autoFocus
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-4">
              <button 
                type="button"
                onClick={() => !isCreating && setAutoDelete(!autoDelete)}
                className="flex items-center gap-3 px-4 py-2 rounded-full transition-colors text-sm font-medium hover:bg-[#050505]/5 group"
              >
                <div className={`w-8 h-4 rounded-full flex items-center px-0.5 transition-colors ${autoDelete ? 'bg-[#050505]' : 'bg-[#050505]/20'}`}>
                  <div className={`w-3 h-3 rounded-full bg-white shadow-sm transform transition-transform ${autoDelete ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
                <span className={autoDelete ? 'text-[#050505]' : 'text-[#050505]/60 group-hover:text-[#050505]'}>
                  Auto-delete in 24h
                </span>
              </button>

              <button
                type="submit"
                disabled={!eventName.trim() || isCreating}
                className="bg-[#050505]/80 text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-[#050505] hover:opacity-100 opacity-80 transition-colors flex items-center gap-2"
              >
                {isCreating ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                <span>{isCreating ? 'Creating...' : 'Create Event'}</span>
              </button>
            </div>
          </form>
        </motion.div>

        {/* Minimal Event List */}
        <motion.div variants={itemVariants} className="w-full">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold tracking-widest text-[#050505]/40">Your Spaces</h3>
            <span className="text-xs font-bold text-[#050505]">{events.length}</span>
          </div>
          
          {loadingEvents ? (
            <div className="flex justify-center p-12">
              <div className="w-6 h-6 border-2 border-[#050505]/20 border-t-[#050505] rounded-full animate-spin"></div>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center text-[#050505]/40 font-light text-sm p-8 border border-dashed border-[#050505]/10 rounded-2xl">
              No spaces found. Create one above.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/50 transition-colors group">
                    <Link to={`/event/${event.id}`} className="flex-1 flex items-center gap-4">
                      <span className="font-mono text-xs text-[#050505]/30 group-hover:text-[#050505]/50 transition-colors">
                        {(index + 1).toString().padStart(2, '0')}
                      </span>
                      <h4 className="font-bold text-[#050505] text-lg group-hover:underline decoration-[#050505]/20 underline-offset-4">{event.name}</h4>
                    </Link>
                    
                    <div className="flex items-center gap-6">
                      <span className="text-xs font-medium text-[#050505]/40 hidden sm:block">
                        {new Date(event.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <button
                        onClick={(e) => handleDeleteEvent(e, event.id)}
                        className="text-[#050505]/20 hover:text-red-500 transition-colors"
                        title="Delete Space"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
