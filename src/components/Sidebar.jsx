import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Camera, Home, Calendar, Menu, X, Info, LogOut, LogIn, ShieldOff, Unlock, UserX } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false); // Mobile toggle state
  const [isHovered, setIsHovered] = useState(false); // Desktop hover state
  const [restrictedUploaders, setRestrictedUploaders] = useState([]);
  const [canManageRestrictions, setCanManageRestrictions] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const eventId = location.pathname.match(/^\/event\/([^/]+)/)?.[1];

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
    if (!eventId || !user) {
      Promise.resolve().then(() => setRestrictedUploaders([]));
      Promise.resolve().then(() => setCanManageRestrictions(false));
      return;
    }

    const fetchRestrictedUploaders = async () => {
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('user_id')
        .eq('id', eventId)
        .single();

      const isCreator = !eventError && eventData?.user_id === user.id;
      setCanManageRestrictions(isCreator);

      if (!isCreator) {
        setRestrictedUploaders([]);
        return;
      }

      const { data, error } = await supabase
        .from('restricted_uploaders')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching restricted uploaders:", error);
      } else {
        setRestrictedUploaders(data || []);
      }
    };

    fetchRestrictedUploaders();

    const handleRestrictionChange = (event) => {
      if (event.detail?.eventId === eventId) fetchRestrictedUploaders();
    };

    window.addEventListener('restricted-uploaders-changed', handleRestrictionChange);
    return () => window.removeEventListener('restricted-uploaders-changed', handleRestrictionChange);
  }, [eventId, user]);

  const handleUnrestrictUploader = async (uploaderId) => {
    const { error } = await supabase
      .from('restricted_uploaders')
      .delete()
      .eq('event_id', eventId)
      .eq('uploader_id', uploaderId);

    if (error) {
      console.error("Error unrestricting uploader:", error);
      alert("Failed to unrestrict uploader.");
    } else {
      setRestrictedUploaders(current => current.filter(item => item.uploader_id !== uploaderId));
    }
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-[60] p-2 bg-theme-3 text-theme-1 rounded-md shadow-md hover:bg-theme-4 transition-colors"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 md:hidden transition-opacity"
          onClick={toggleSidebar}
        />
      )}

      {/* Desktop Placeholder to keep content pushed over by w-20 */}
      <div className="hidden md:block w-20 flex-shrink-0 transition-all duration-300" />

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-theme-2 border-r border-theme-3/20 flex flex-col z-50 transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'} 
          ${isHovered ? 'md:w-64 shadow-2xl' : 'md:w-20'}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Logo Section */}
        <div className={`border-b border-theme-3/20 flex items-center h-20 transition-all duration-300 ${isHovered || isOpen ? 'px-6' : 'px-0 justify-center'}`}>
          <Camera className="w-8 h-8 text-theme-3 flex-shrink-0" />
          <span className={`font-heading font-bold text-3xl text-theme-4 whitespace-nowrap overflow-hidden transition-all duration-300 ${isHovered || isOpen ? 'ml-3 opacity-100 max-w-xs' : 'opacity-0 max-w-0 ml-0'}`}>
            Mementos
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 flex-1 space-y-2 overflow-x-hidden overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center rounded-lg font-bold transition-all duration-300 ${isHovered || isOpen ? 'px-4 py-3' : 'justify-center p-3 w-12 mx-auto'
                } ${isActive
                  ? 'bg-theme-4 text-theme-1'
                  : 'text-theme-4/80 hover:bg-theme-1/50 hover:text-theme-4'
                }`
              }
              title={(!isHovered && !isOpen) ? item.name : ""}
            >
              <div className="flex items-center justify-center w-6 h-6 flex-shrink-0">
                {item.icon}
              </div>
              <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isHovered || isOpen ? 'ml-3 opacity-100 max-w-xs' : 'opacity-0 max-w-0 ml-0'}`}>
                {item.name}
              </span>
            </NavLink>
          ))}

          {canManageRestrictions && (
            <div className="pt-4 border-t border-theme-3/20 mt-2">
              {isHovered || isOpen ? (
                <div className="rounded-xl border border-theme-1 bg-theme-3/5 overflow-hidden transition-all duration-300">
                  <div className="flex items-center justify-between px-3 py-2.5 bg-theme-3 border-b border-theme-3/20">
                    <div className="flex items-center gap-2">
                      <ShieldOff className="w-4 h-4 text-theme-4" />
                      <span className="text-xs font-bold uppercase tracking-wider text-theme-4">
                        Restricted
                      </span>
                    </div>
                    <span className="flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-md bg-theme-4 text-theme-1 text-[10px] font-bold">
                      {restrictedUploaders.length}
                    </span>
                  </div>

                  {restrictedUploaders.length > 0 ? (
                    <div className="p-2 space-y-1 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-theme-3/30 scrollbar-track-transparent">
                      {restrictedUploaders.map((uploader) => (
                        <div
                          key={uploader.uploader_id}
                          className="group flex items-center justify-between px-2 py-2 rounded-lg hover:bg-theme-3/10 transition-colors"
                        >
                          <span className="truncate text-sm font-medium text-theme-4/80 group-hover:text-theme-4 transition-colors">
                            {uploader.display_name || uploader.uploader_id}
                          </span>
                          <button
                            onClick={() => handleUnrestrictUploader(uploader.uploader_id)}
                            className="text-theme-4 group-hover:text-theme-1 opacity-80 group-hover:opacity-100 transition-all p-1"
                            title="Restore Access"
                          >
                            <Unlock className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-3 py-4 text-center">
                      <span className="text-xs font-medium text-theme-4/50">No restricted users</span>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className="flex items-center justify-center w-12 h-12 mx-auto rounded-xl border border-theme-4/40 bg-theme-3/5 text-theme-4 hover:bg-theme-3/20 transition-all duration-300 cursor-pointer relative"
                  title={`Restricted Guests: ${restrictedUploaders.length}`}
                  onClick={() => setIsOpen(true)}
                >
                  <ShieldOff className="w-5 h-5" />
                  {restrictedUploaders.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-5 h-5 bg-theme-3 text-theme-1 text-[10px] font-bold rounded-full border-2 border-theme-2 shadow-sm">
                      {restrictedUploaders.length}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-theme-3/20 flex flex-col gap-2">
          <button
            onClick={handleAuthAction}
            className={`flex items-center rounded-lg font-bold transition-all duration-300 ${isHovered || isOpen ? 'px-4 py-3' : 'justify-center p-3 w-12 mx-auto'
              } ${user ? 'text-red-400 hover:bg-red-400/10' : 'text-theme-3 hover:bg-theme-3/10'}`}
            title={(!isHovered && !isOpen) ? (user ? "Sign Out" : "Sign In") : ""}
          >
            <div className="flex items-center justify-center w-6 h-6 flex-shrink-0">
              {user ? <LogOut className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
            </div>
            <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isHovered || isOpen ? 'ml-3 opacity-100 max-w-xs' : 'opacity-0 max-w-0 ml-0'}`}>
              {user ? "Sign Out" : "Sign In"}
            </span>
          </button>

          <a
            href="https://github.com/Alwin-Saji/QR"
            target="_blank"
            rel="noreferrer"
            className={`flex items-center rounded-lg font-bold text-theme-4/80 hover:bg-theme-1/50 hover:text-theme-4 transition-all duration-300 ${isHovered || isOpen ? 'px-4 py-3' : 'justify-center p-3 w-12 mx-auto'
              }`}
            title={(!isHovered && !isOpen) ? "About ARC" : ""}
          >
            <div className="flex items-center justify-center w-6 h-6 flex-shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isHovered || isOpen ? 'ml-3 opacity-100 max-w-xs' : 'opacity-0 max-w-0 ml-0'}`}>
              About ARC
            </span>
          </a>
        </div>
      </aside>
    </>
  );
}
