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
        <div className="bg-theme-2 rounded-2xl shadow-lg border border-theme-3/20 p-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="bg-theme-3/20 p-4 rounded-xl text-theme-3">
              <Plus className="w-8 h-8" />
            </div>
            <div className="flex-1 w-full">
              <h2 className="text-3xl font-heading font-bold text-theme-4 mb-2">Create New Event</h2>
              <p className="text-theme-4/80 mb-6">Start a new real-time photo gallery for your guests.</p>
              
              <form onSubmit={handleCreateEvent} className="flex flex-col gap-4 max-w-md w-full">
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="text"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder="E.g., Sarah's Birthday"
                    className="flex-1 bg-theme-1 border border-theme-3/30 text-theme-4 placeholder:text-theme-4/40 rounded-lg px-4 py-2 focus:ring-2 focus:ring-theme-3 focus:border-theme-3 outline-none transition-all w-full"
                    disabled={isCreating}
                  />
                  <button
                    type="submit"
                    disabled={!eventName.trim() || isCreating}
                    className="bg-theme-3 text-theme-1 px-6 py-2 rounded-lg font-bold hover:bg-theme-4 disabled:opacity-50 transition-colors whitespace-nowrap"
                  >
                    {isCreating ? 'Creating...' : 'Create'}
                  </button>
                </div>
                <label className="flex items-center gap-2 text-theme-4/80 text-sm cursor-pointer w-fit">
                  <input
                    type="checkbox"
                    checked={autoDelete}
                    onChange={(e) => setAutoDelete(e.target.checked)}
                    disabled={isCreating}
                    className="w-4 h-4 rounded border-theme-3/30 text-theme-3 focus:ring-theme-3 bg-theme-1 cursor-pointer"
                  />
                  Auto-delete event after 24 hours
                </label>
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
