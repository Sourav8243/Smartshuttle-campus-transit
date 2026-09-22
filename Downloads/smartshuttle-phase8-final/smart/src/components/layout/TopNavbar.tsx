import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, LogOut, User as UserIcon, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/useToast';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { cn } from '@/utils/cn';

interface TopNavbarProps {
  onMenuClick: () => void;
}

export function TopNavbar({ onMenuClick }: TopNavbarProps) {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    toast('Signed out successfully', 'info');
    navigate('/login');
  };

  const notifications = [
    { id: '1', title: 'Shuttle arriving', message: 'Your shuttle to North Campus arrives in 5 min', time: '2m ago' },
    { id: '2', title: 'Booking confirmed', message: 'Trip #SH-1284 has been confirmed', time: '1h ago' },
  ];

  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white/80 backdrop-blur-md px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 hidden sm:block">
            Welcome back, {user.name.split(' ')[0]}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              aria-label="Open notifications"
              aria-expanded={notifOpen}
              onClick={() => setNotifOpen((v) => !v)}
              className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-error-500 ring-2 ring-white" />
            </button>
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl border border-gray-100 bg-white shadow-card-hover overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900">Notifications</span>
                  <span className="text-xs text-primary-600 font-medium cursor-pointer">Mark all read</span>
                </div>
                <div className="max-h-72 overflow-y-auto scrollbar-thin">
                  {notifications.map((n) => (
                    <div key={n.id} className="px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-start gap-2">
                        <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-primary-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{n.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2.5 text-center">
                  <span className="text-xs text-primary-600 font-medium cursor-pointer">View all notifications</span>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen((v) => !v)}
              className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-gray-100"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-sm font-semibold">
                {user.name.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900 leading-none">{user.name}</p>
                <p className="text-xs text-gray-400 mt-0.5 capitalize">{user.role}</p>
              </div>
              <ChevronDown className={cn('h-4 w-4 text-gray-400 transition-transform', profileOpen && 'rotate-180')} />
            </button>
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-100 bg-white shadow-card-hover overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      navigate(user.role === 'admin' ? '/admin/settings' : '/student/profile');
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <UserIcon className="h-4 w-4" /> Profile
                  </button>
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      if (user.role === 'admin') navigate('/admin/settings');
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Settings className="h-4 w-4" /> Settings
                  </button>
                </div>
                <div className="border-t border-gray-100 py-1">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      setConfirmLogout(true);
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-error-600 hover:bg-error-50"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <ConfirmDialog
        open={confirmLogout}
        onClose={() => setConfirmLogout(false)}
        onConfirm={handleLogout}
        title="Sign out"
        message="Are you sure you want to sign out of SmartShuttle?"
        confirmLabel="Sign out"
        danger
      />
    </>
  );
}
