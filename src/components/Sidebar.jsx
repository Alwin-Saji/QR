import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Camera, Home, Calendar, Menu, X, Info, LogOut, LogIn, ShieldOff, Unlock, Activity, Folder, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [eventDetails, setEventDetails] = useState(null);
  const [restrictedUploaders, setRestrictedUploaders] = useState([]);
  const [canManageRestrictions, setCanManageRestrictions] = useState(false);
  const [userEvents, setUserEvents] = useState([]);
  const [isEventsDropdownOpen, setIsEventsDropdownOpen] = useState(false);
  const [isMobileRestrictionsOpen, setIsMobileRestrictionsOpen] = useState(false);

  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const eventId = location.pathname.match(/^\/event\/([^/]+)/)?.[1];
  const isEventPage = location.pathname.startsWith('/event/');

  const toggleSidebar = () => setIsOpen(!isOpen);

  const navItems = [
    { name: 'Home', path: '/', icon: <Home className="w-5 h-5" /> },
    { name: 'Dashboard', path: '/dashboard', icon: <Calendar className="w-5 h-5" /> },
  ];

  const handleAuthAction = async () => {
    if (user) {
      await signOut();
      navigate('/');
    } else {
      navigate('/auth');
    }
  };

  useEffect(() => {
    if (!eventId) {
      setEventDetails(null);
      setRestrictedUploaders([]);
      setCanManageRestrictions(false);
      return;
    }

    const fetchEventData = async () => {
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (eventData) {
        setEventDetails(eventData);
      }

      if (!user) {
        setRestrictedUploaders([]);
        setCanManageRestrictions(false);
        return;
      }

      const isCreator = !eventError && eventData?.user_id === user.id;
      setCanManageRestrictions(isCreator);

      if (!isCreator) return;

      const { data } = await supabase
        .from('restricted_uploaders')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      setRestrictedUploaders(data || []);
    };

    fetchEventData();

    const handleRestrictionChange = (event) => {
      if (event.detail?.eventId === eventId) fetchEventData();
    };

    window.addEventListener('restricted-uploaders-changed', handleRestrictionChange);
    return () => window.removeEventListener('restricted-uploaders-changed', handleRestrictionChange);
  }, [eventId, user]);

  useEffect(() => {
    if (!user) {
      setUserEvents([]);
      return;
    }
    const fetchUserEvents = async () => {
      const { data } = await supabase
        .from('events')
        .select('id, name')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (data) {
        setUserEvents(data);
      }
    };
    fetchUserEvents();
  }, [user]);

  const handleUnrestrictUploader = async (uploaderId) => {
    const { error } = await supabase
      .from('restricted_uploaders')
      .delete()
      .eq('event_id', eventId)
      .eq('uploader_id', uploaderId);

    if (!error) {
      setRestrictedUploaders(current => current.filter(item => item.uploader_id !== uploaderId));
    }
  };

  const sidebarVariants = {
    collapsed: { width: '80px', transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
    expanded: { width: '280px', transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }
  };

  const textVariants = {
    collapsed: { opacity: 0, x: -10, display: 'none', transition: { duration: 0.1 } },
    expanded: { opacity: 1, x: 0, display: 'block', transition: { delay: 0.1, duration: 0.2 } }
  };

  return (
    <>
      {/* Mobile Bottom Navigation Bar (Docked - Cream Theme) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 w-full h-[72px] pb-safe bg-theme-4 rounded-t-[32px] border-t-[3px] border-x-[3px] border-b-0 border-[#0A0A0A] z-[60] flex items-center justify-around px-4 shadow-[0_-12px_40px_rgba(0,0,0,0.4)] overflow-hidden">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center w-[92px] h-[60px] rounded-[26px] transition-all duration-300 ${isActive ? 'bg-[#0a0a0a] text-theme-4 shadow-[0_0_15px_rgba(0,0,0,0.2)]' : 'text-[#0a0a0a]/60 hover:text-[#0a0a0a] hover:bg-black/5 active:scale-95'}`}
            >
              <div className="flex items-center justify-center w-5 h-5">
                {item.icon}
              </div>
              <span className="text-[9px] mt-1 font-bold tracking-wider uppercase">{item.name}</span>
            </NavLink>
          );
        })}

        {isEventPage && canManageRestrictions && (
          <button
            onClick={() => setIsMobileRestrictionsOpen(true)}
            className="flex flex-col items-center justify-center w-[92px] h-[60px] rounded-[26px] text-[#0a0a0a]/60 hover:text-[#0a0a0a] hover:bg-black/5 active:scale-95 transition-all duration-300 relative"
          >
            <div className="flex items-center justify-center w-5 h-5 relative">
              <ShieldOff className="w-5 h-5" />
              {restrictedUploaders.length > 0 && (
                <div className="absolute -top-1 -right-2 w-2.5 h-2.5 bg-[#ffd60a] border-2 border-[#0A0A0A] rounded-full shadow-sm" />
              )}
            </div>
            <span className="text-[9px] mt-1 font-bold tracking-wider uppercase">Restricted</span>
          </button>
        )}

        <button
          onClick={handleAuthAction}
          className="flex flex-col items-center justify-center w-[92px] h-[60px] rounded-[26px] text-[#0a0a0a]/60 hover:text-red-600 hover:bg-red-500/10 active:scale-95 transition-all duration-300"
        >
          <div className="flex items-center justify-center w-5 h-5">
            {user ? <LogOut className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
          </div>
          <span className="text-[9px] mt-1 font-bold tracking-wider uppercase">{user ? "Sign Out" : "Sign In"}</span>
        </button>
      </nav>

      {/* Mobile Restrictions Modal */}
      <AnimatePresence>
        {isMobileRestrictionsOpen && (
          <div className="md:hidden fixed inset-0 z-[70] flex flex-col justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsMobileRestrictionsOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative bg-[#111] rounded-t-3xl border-t border-white/10 w-full max-h-[85vh] flex flex-col overflow-hidden shadow-[0_-20px_50px_rgba(0,0,0,0.8)]"
            >
              <div className="flex items-center justify-between p-5 border-b border-white/5 bg-[#161616]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-theme-4/10 flex items-center justify-center">
                    <ShieldOff className="w-5 h-5 text-theme-4" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold tracking-wide">Restricted Users</h3>
                    <p className="text-xs text-theme-4 font-mono">{restrictedUploaders.length} blocked</p>
                  </div>
                </div>
                <button onClick={() => setIsMobileRestrictionsOpen(false)} className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-full active:scale-95 transition-transform">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-5 overflow-y-auto">
                {restrictedUploaders.length > 0 ? (
                  <div className="space-y-3">
                    {restrictedUploaders.map((u) => (
                      <div key={u.uploader_id} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 shadow-sm">
                        <span className="text-sm text-gray-200 font-medium truncate pr-4">
                          {u.display_name || 'Guest'}
                        </span>
                        <button onClick={() => handleUnrestrictUploader(u.uploader_id)} className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#111] bg-theme-4 rounded-xl hover:scale-105 active:scale-95 transition-transform shrink-0 shadow-[0_0_15px_rgba(245,238,220,0.2)]">
                          <Unlock className="w-3.5 h-3.5" />
                          Unrestrict
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 mb-4 rounded-full bg-white/5 flex items-center justify-center">
                      <ShieldOff className="w-8 h-8 text-gray-600" />
                    </div>
                    <p className="text-gray-400 font-medium">No restricted users</p>
                    <p className="text-gray-600 text-xs mt-1">Everyone is allowed to upload.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Spacer for desktop layout */}
      <div className="hidden md:block w-[80px] flex-shrink-0" />

      {/* Desktop Edge-to-Edge Sidebar */}
      <motion.aside
        initial="collapsed"
        animate={(isHovered || isOpen) ? "expanded" : "collapsed"}
        variants={sidebarVariants}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="hidden md:flex fixed top-0 bottom-0 left-0 z-50 flex-col bg-[#0A0A0A] border-r border-white/5"
      >
        {/* Logo Section */}
        <div className="h-24 flex items-center px-[22px]">
          <Camera className="w-9 h-9 text-theme-4 shrink-0" />
          <motion.span variants={textVariants} className="font-heading font-bold text-3xl text-white ml-5 whitespace-nowrap tracking-wide">
            Mementos
          </motion.span>
        </div>

        {/* Event Details Section */}
        <AnimatePresence>
          {isEventPage && eventDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-3 mb-4"
            >
              {(isHovered || isOpen) ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-theme-4 rounded-xl p-4 flex flex-col shadow-lg shadow-theme-4/20 border-b-[3px] border-[#0A0A0A]/30 translate-y-[-1px] relative overflow-hidden group"
                >
                  {/* Decorative background logo/pattern */}
                  <div className="absolute -right-4 -bottom-4 opacity-[0.07] group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500">
                    <Camera className="w-24 h-24 text-[#0A0A0A]" />
                  </div>

                  <div className="flex justify-between items-start mb-2 relative z-10">
                    <span className="bg-[#0A0A0A] text-theme-4 text-[9px] uppercase tracking-widest font-black px-2 py-1 rounded shadow-sm">
                      Live Event
                    </span>
                  </div>

                  <h3 className="text-[#0A0A0A] font-black text-lg leading-tight truncate relative z-10">
                    {eventDetails.name}
                  </h3>

                  <p className="text-[#0A0A0A]/70 text-[10px] font-bold mt-1 uppercase tracking-wider relative z-10">
                    {new Date(eventDetails.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                </motion.div>
              ) : (
                <div className="flex justify-center">
                  <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-theme-4 text-[#0A0A0A] shadow-md shadow-theme-4/20 border-b-[3px] border-[#0A0A0A]/30 translate-y-[-1px]">
                    <Activity className="w-5 h-5 animate-pulse" />
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <nav className={`flex-1 space-y-1 overflow-y-auto scrollbar-none ${!(isEventPage && eventDetails) ? 'mt-4' : ''}`}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`relative flex items-center h-12 mx-3 my-1 px-3.5 rounded-lg group transition-all duration-300 ${isActive ? 'bg-theme-4 shadow-md shadow-theme-4/20 border-b-[3px] border-[#0A0A0A]/30 translate-y-[-1px]' : 'hover:bg-white/10 hover:scale-[0.98]'}`}
              >
                <div className="relative z-10 flex items-center w-full">
                  <div className={`flex items-center justify-center shrink-0 w-8 transition-all duration-300 ${isActive ? 'text-[#0A0A0A] scale-110' : 'text-gray-500 group-hover:text-white group-hover:-rotate-6'}`}>
                    {item.icon}
                  </div>
                  <motion.span variants={textVariants} className={`ml-4 text-[15px] whitespace-nowrap transition-all duration-300 ${isActive ? 'text-[#0A0A0A] font-bold tracking-wide' : 'text-gray-400 group-hover:text-white group-hover:tracking-wider'}`}>
                    {item.name}
                  </motion.span>
                </div>
              </NavLink>
            );
          })}

          {/* User Events Section */}
          {user && userEvents.length > 0 && (
            <div className="mt-6 pt-4 border-t border-white/5">
              <button
                onClick={() => setIsEventsDropdownOpen(!isEventsDropdownOpen)}
                className="w-full relative flex items-center h-12 mx-3 px-3.5 rounded-lg group hover:bg-white/5 transition-all duration-300"
              >
                <div className="flex items-center w-full">
                  <div className="flex items-center justify-center shrink-0 w-8 text-gray-500 group-hover:text-white transition-colors">
                    <Folder className="w-5 h-5" />
                  </div>
                  <motion.div variants={textVariants} className="ml-4 flex-1 overflow-hidden pr-2">
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[15px] text-gray-400 group-hover:text-white font-medium whitespace-nowrap transition-colors">
                        Your Events
                      </span>
                      <ChevronDown className={`w-4 h-4 shrink-0 text-gray-500 transition-transform duration-300 ${isEventsDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </motion.div>
                </div>
              </button>

              <AnimatePresence>
                {isEventsDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-1 mt-1">
                      {userEvents.map((event) => {
                        const isActive = location.pathname === `/event/${event.id}`;
                        return (
                          <NavLink
                            key={event.id}
                            to={`/event/${event.id}`}
                            onClick={() => setIsOpen(false)}
                            className={`relative flex items-center h-10 mx-3 px-3.5 rounded-lg group transition-all duration-300 ${isActive ? 'bg-white/5' : 'hover:bg-white/5'}`}
                          >
                            <div className="flex items-center w-full">
                              <div className="flex items-center justify-center shrink-0 w-8">
                                <div className={`flex items-center justify-center w-5 h-5 rounded-md text-[9px] font-bold transition-all duration-300 ${isActive ? 'bg-theme-4 text-[#0A0A0A] shadow-[0_0_10px_rgba(var(--theme-4-rgb),0.4)]' : 'bg-white/10 text-gray-400 group-hover:bg-white/20 group-hover:text-white'}`}>
                                  {event.name.charAt(0).toUpperCase()}
                                </div>
                              </div>
                              <motion.span 
                                variants={textVariants} 
                                initial="collapsed"
                                animate={(isHovered || isOpen) ? 'expanded' : 'collapsed'}
                                className={`ml-4 text-[13px] whitespace-nowrap truncate transition-all duration-300 ${isActive ? 'text-white font-semibold' : 'text-gray-400 font-medium group-hover:text-gray-200'}`}
                              >
                                {event.name}
                              </motion.span>
                            </div>
                          </NavLink>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Restrictions Section */}
          <AnimatePresence>
            {isEventPage && canManageRestrictions && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8 pt-6 border-t border-white/5"
              >
                {(isHovered || isOpen) ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mx-4 bg-white/5 rounded-xl border border-white/5 overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/5">
                      <div className="flex items-center gap-2">
                        <ShieldOff className="w-4 h-4 text-theme-4" />
                        <span className="text-[11px] uppercase tracking-widest text-gray-400 font-bold">Restricted</span>
                      </div>
                      <span className="bg-theme-4/20 text-theme-4 text-xs font-bold px-2 py-0.5 rounded-full">
                        {restrictedUploaders.length}
                      </span>
                    </div>

                    {restrictedUploaders.length > 0 ? (
                      <div className="p-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                        {restrictedUploaders.map((u) => (
                          <div key={u.uploader_id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 group">
                            <span className="text-sm text-gray-400 group-hover:text-white truncate">
                              {u.display_name || 'Guest'}
                            </span>
                            <button onClick={() => handleUnrestrictUploader(u.uploader_id)} className="text-gray-500 hover:text-theme-4">
                              <Unlock className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-5 text-center text-sm text-gray-600">No restricted users</div>
                    )}
                  </motion.div>
                ) : (
                  <div className="flex justify-center">
                    <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 text-gray-400">
                      <ShieldOff className="w-5 h-5" />
                      {restrictedUploaders.length > 0 && (
                        <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-theme-4 border-2 border-[#0A0A0A] rounded-full" />
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* Footer Actions */}
        <div className="pb-6 pt-4 border-t border-white/5 flex flex-col gap-1">
          <button
            onClick={handleAuthAction}
            className={`relative flex items-center h-12 mx-3 px-3.5 rounded-lg group transition-all duration-300 hover:scale-[0.98] ${user ? 'hover:bg-red-500/20 text-gray-400 hover:text-red-400' : 'hover:bg-white/10 text-gray-400 hover:text-white'}`}
          >
            <div className={`flex items-center justify-center shrink-0 w-8 transition-all duration-300 ${user ? 'group-hover:rotate-6 text-gray-500 group-hover:text-red-400' : 'group-hover:-rotate-6 text-gray-500 group-hover:text-white'}`}>
              {user ? <LogOut className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
            </div>
            <motion.span variants={textVariants} className="ml-4 text-[15px] font-medium whitespace-nowrap transition-all duration-300 group-hover:tracking-wider">
              {user ? "Sign Out" : "Sign In"}
            </motion.span>
          </button>

          <a
            href="https://github.com/Alwin-Saji/QR"
            target="_blank"
            rel="noreferrer"
            className="relative flex items-center h-12 mx-3 px-3.5 rounded-lg group hover:bg-white/10 hover:scale-[0.98] text-gray-400 hover:text-white transition-all duration-300"
          >
            <div className="flex items-center justify-center shrink-0 w-8 transition-all duration-300 group-hover:scale-110 text-gray-500 group-hover:text-white">
              <Info className="w-5 h-5" />
            </div>
            <motion.span variants={textVariants} className="ml-4 text-[15px] font-medium whitespace-nowrap transition-all duration-300 group-hover:tracking-wider">
              About ARC
            </motion.span>
          </a>
        </div>
      </motion.aside>
    </>
  );
}
