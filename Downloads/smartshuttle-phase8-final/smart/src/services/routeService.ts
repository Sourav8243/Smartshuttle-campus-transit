import { routes as initialRoutes } from '@/data/routes';
import { getBookings, getShuttles, saveShuttles, saveBookings } from './bookingService';
import { getSchedules } from './driverService';
import type { Driver, ShuttleRoute } from '@/types';

const ROUTES_KEY = 'smartshuttle_routes';

function seedRoutes(): ShuttleRoute[] {
  return initialRoutes.map((route) => ({
    status: 'active',
    operatingStart: '08:00',
    operatingEnd: '18:00',
    ...route,
  }));
}

export function getRoutes(): ShuttleRoute[] {
  try {
    const stored = localStorage.getItem(ROUTES_KEY);
    if (stored) return JSON.parse(stored) as ShuttleRoute[];
  } catch {
    // fall through to seed data
  }
  const seeded = seedRoutes();
  localStorage.setItem(ROUTES_KEY, JSON.stringify(seeded));
  return seeded;
}

export function saveRoutes(routes: ShuttleRoute[]): void {
  localStorage.setItem(ROUTES_KEY, JSON.stringify(routes));
}

export function addRoute(route: ShuttleRoute): void {
  saveRoutes([...getRoutes(), route]);
}

export function updateRoute(route: ShuttleRoute): void {
  saveRoutes(getRoutes().map((item) => item.id === route.id ? route : item));
}

export function getRouteById(routeId: string): ShuttleRoute | undefined {
  return getRoutes().find((route) => route.id === routeId);
}

export function deleteRoute(routeId: string): { success: boolean; reason?: string } {
  const route = getRouteById(routeId);
  if (!route) return { success: false, reason: 'Route not found.' };

  const bookings = getBookings();
  const activeBooking = bookings.some(
    (booking) => booking.route === route.name && !['cancelled', 'rejected', 'completed', 'no-show'].includes(booking.status)
  );
  if (activeBooking) {
    return { success: false, reason: 'This route has active bookings. Cancel or complete them before deleting the route.' };
  }

  const routeShuttles = getShuttles().filter((shuttle) => shuttle.routeId === routeId);
  if (routeShuttles.length > 0) {
    return { success: false, reason: 'This route is linked to shuttle services. Reassign or remove those shuttles before deleting the route.' };
  }

  saveRoutes(getRoutes().filter((item) => item.id !== routeId));
  return { success: true };
}

function toMinutes(value: string): number {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

export function assignDriverToRoute(routeId: string, driver: Driver | null, date?: string): { success: boolean; reason?: string } {
  const route = getRouteById(routeId);
  if (!route) return { success: false, reason: 'Route not found.' };
  if (driver?.status === 'off-duty') return { success: false, reason: 'An off-duty driver cannot be assigned to a route.' };
  if (driver && route.status === 'inactive') return { success: false, reason: 'Activate the route before assigning a driver.' };

  if (driver && date) {
    const schedule = getSchedules().find((item) => item.driverId === driver.id && item.date === date);
    if (!schedule) return { success: false, reason: `${driver.name} has no duty schedule on ${date}.` };
    const routeStart = toMinutes(route.operatingStart ?? '08:00');
    const routeEnd = toMinutes(route.operatingEnd ?? '18:00');
    if (toMinutes(schedule.startTime) > routeStart || toMinutes(schedule.endTime) < routeEnd) {
      return { success: false, reason: `${driver.name}'s duty schedule does not cover the route operating hours.` };
    }
    const breakConflict = schedule.breaks.some((br) => toMinutes(br.startTime) < routeEnd && routeStart < toMinutes(br.endTime));
    if (breakConflict) return { success: false, reason: `${driver.name}'s break overlaps the route operating window.` };
  }

  const nextRoute: ShuttleRoute = {
    ...route,
    assignedDriverId: driver?.id,
    assignedDriverName: driver?.name,
  };
  updateRoute(nextRoute);

  // Keep existing shuttle and booking driver information consistent for this route.
  const shuttles = getShuttles().map((shuttle) => shuttle.routeId === routeId && driver
    ? { ...shuttle, driverId: driver.id, driverName: driver.name }
    : shuttle);
  saveShuttles(shuttles);

  const bookings = getBookings().map((booking) => booking.route === route.name && driver
    ? { ...booking, driverName: driver.name }
    : booking);
  saveBookings(bookings);

  return { success: true };
}
