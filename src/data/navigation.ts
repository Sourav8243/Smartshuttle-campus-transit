import { LayoutDashboard, CalendarPlus, Ticket, History, User, BarChart3, Users, Route, Settings, ClipboardList } from 'lucide-react';
import type { UserRole } from '@/types';

export interface NavItem {
  label: string;
  path: string;
  icon: typeof LayoutDashboard;
}

export const studentNav: NavItem[] = [
  { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
  { label: 'Book Shuttle', path: '/student/book-shuttle', icon: CalendarPlus },
  { label: 'My Bookings', path: '/student/bookings', icon: Ticket },
  { label: 'Trip History', path: '/student/trip-history', icon: History },
  { label: 'Profile', path: '/student/profile', icon: User },
];

export const adminNav: NavItem[] = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Bookings', path: '/admin/bookings', icon: ClipboardList },
  { label: 'Drivers', path: '/admin/drivers', icon: Users },
  { label: 'Routes', path: '/admin/routes', icon: Route },
  { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
  { label: 'Settings', path: '/admin/settings', icon: Settings },
];

export function getNavItems(role: UserRole): NavItem[] {
  return role === 'admin' ? adminNav : studentNav;
}
