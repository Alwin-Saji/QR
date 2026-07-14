import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Calendar, ArrowRight, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const [eventName, setEventName] = useState('');
  const [autoDelete, setAutoDelete] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
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
    
    if (!window.confirm("Are you sure you want to delete this event and all its photos?")) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);
        
      if (error) throw error;
      
      // Update local state to remove the deleted event
      setEvents(events.filter(event => event.id !== eventId));
      toast.success('Event deleted');
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error('Failed to delete event');
    }
  };

  return (
    <div className="w-full min-h-full bg-theme-1 text-theme-4 pt-20 md:pt-0">
      <div className="p-8 max-w-4xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-5xl font-heading font-bold text-theme-4">Dashboard</h1>
            <p className="text-theme-4/80 mt-2 text-lg">Manage your photo-sharing events</p>
          </div>
        </div>

        {/* Create Event Card */}
        <div className="bg-theme-1 border-2 border-theme-3 rounded-2xl p-6 sm:p-8 lg:p-12 mb-8 lg:mb-12 shadow-[4px_4px_0_0_rgba(var(--color-theme-3),1)] lg:shadow-[8px_8px_0_0_rgba(var(--color-theme-3),1)]">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center justify-between">
            <div className="w-full lg:w-1/2 flex flex-col items-start text-left">
              <div className="inline-block bg-theme-3 text-theme-1 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold tracking-wider uppercase mb-4 sm:mb-6">
                Host a Gallery
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black text-theme-4 mb-3 sm:mb-4 leading-tight">
                Create a New <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-theme-3 to-theme-4">Shared Event</span>
              </h2>
              <p className="text-base sm:text-lg text-theme-4/70 mb-4 sm:mb-8 max-w-sm">
                Set up a real-time collaborative photo album for your guests in just a few seconds.
              </p>
            </div>
            
            <div className="w-full lg:w-1/2 bg-theme-2 p-6 sm:p-8 rounded-2xl border border-theme-3/20 relative">
               <div className="absolute -top-4 -right-4 w-16 sm:w-20 h-16 sm:h-20 bg-theme-3/20 rounded-full blur-2xl pointer-events-none"></div>
               <div className="absolute -bottom-4 -left-4 w-16 sm:w-20 h-16 sm:h-20 bg-theme-4/20 rounded-full blur-2xl pointer-events-none"></div>
               
               <form onSubmit={handleCreateEvent} className="relative z-10 flex flex-col gap-5 sm:gap-6">
                 <div>
                   <label className="block text-xs sm:text-sm font-bold text-theme-4/80 mb-2 uppercase tracking-wide">Event Name</label>
                   <input
                     type="text"
                     value={eventName}
                     onChange={(e) => setEventName(e.target.value)}
                     placeholder="E.g., Sarah's Birthday"
                     className="w-full bg-theme-1 border-2 border-theme-3/30 text-theme-4 placeholder:text-theme-4/30 rounded-xl px-4 sm:px-5 py-3 sm:py-4 focus:ring-0 focus:border-theme-3 outline-none transition-colors text-base sm:text-lg font-medium"
                     disabled={isCreating}
                   />
                 </div>
                 
                 {/* Custom Toggle Switch for Checklist */}
                 <div className="flex items-center justify-between bg-theme-1 border-2 border-theme-3/10 p-3 sm:p-4 rounded-xl hover:border-theme-3/30 transition-colors cursor-pointer group" onClick={() => !isCreating && setAutoDelete(!autoDelete)}>
                    <div className="pr-2 sm:pr-4">
                      <h4 className="font-bold text-theme-4 text-sm sm:text-base group-hover:text-theme-3 transition-colors">Auto-Delete Event</h4>
                      <p className="text-[10px] sm:text-xs text-theme-4/60 mt-0.5 sm:mt-1">Automatically remove all photos after 24 hours.</p>
                    </div>
                    
                    <div className="relative flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={autoDelete}
                        onChange={(e) => setAutoDelete(e.target.checked)}
                        disabled={isCreating}
                        className="sr-only"
                      />
                      <div className={`w-12 sm:w-14 h-7 sm:h-8 rounded-full transition-colors duration-300 ease-in-out flex items-center px-1 ${autoDelete ? 'bg-theme-3' : 'bg-theme-4/20'}`}>
                         <div className={`w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-theme-1 shadow-md transform transition-transform duration-300 ease-in-out ${autoDelete ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0'}`}></div>
                      </div>
                    </div>
                 </div>

                 <button
                   type="submit"
                   disabled={!eventName.trim() || isCreating}
                   className="w-full bg-theme-4/80 text-theme-1 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-theme-4 hover:text-theme-1 disabled:opacity-50 transition-colors shadow-lg mt-1 sm:mt-2 flex items-center justify-center gap-2 group"
                 >
                   <span>{isCreating ? 'Creating...' : 'Launch Gallery'}</span>
                   {!isCreating && <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-1 transition-transform" />}
                 </button>
               </form>
            </div>
          </div>
        </div>

        {/* Event List */}
        <div className="mt-12">
            <h3 className="text-3xl font-heading font-bold text-theme-4 mb-6">Recent Events</h3>
            {loadingEvents ? (
              <div className="flex justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-theme-3"></div>
              </div>
            ) : events.length === 0 ? (
              <div className="bg-theme-2 rounded-xl border border-dashed border-theme-3/40 p-12 text-center text-theme-4/60">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-theme-3/60" />
                <p>No events found. Create one above!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {events.map((event) => (
                  <Link 
                    key={event.id} 
                    to={`/event/${event.id}`}
                    className="bg-theme-2 p-6 rounded-xl border border-theme-3/20 hover:border-theme-3/60 transition-all flex justify-between items-center group shadow-sm hover:shadow-md"
                  >
                    <div>
                      <h4 className="font-heading font-bold text-xl text-theme-4">{event.name}</h4>
                      <p className="text-sm text-theme-4/60 mt-1">
                        {new Date(event.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={(e) => handleDeleteEvent(e, event.id)}
                        className="p-2 text-theme-4/40 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors z-10"
                        title="Delete Event"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <ArrowRight className="w-5 h-5 text-theme-3 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
