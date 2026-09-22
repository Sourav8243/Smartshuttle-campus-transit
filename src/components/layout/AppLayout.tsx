import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="lg:pl-64">
        <TopNavbar onMenuClick={() => setMobileOpen(true)} />
<<<<<<< HEAD
        <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-5 lg:p-6">
=======
        <main className="p-4 lg:p-6">
>>>>>>> 5659604fc572f48fdc5ffb0a48e7a78db09dad67
          <Outlet />
        </main>
      </div>
    </div>
  );
}
