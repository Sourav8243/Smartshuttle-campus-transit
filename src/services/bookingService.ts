import type { Booking, BookingStatus } from '@/types';
import { initialBookings } from '@/data/bookings';
import { shuttles as initialShuttles } from '@/data/shuttles';
import type { Shuttle } from '@/types';

const BOOKINGS_KEY = 'smartshuttle_bookings';
const SHUTTLES_KEY = 'smartshuttle_shuttles';

export function getBookings(): Booking[] {
  try {
    const stored = localStorage.getItem(BOOKINGS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // fall through
  }
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(initialBookings));
  return [...initialBookings];
}

export function saveBookings(bookings: Booking[]): void {
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
}

export function getStudentBookings(studentId: string): Booking[] {
  return getBookings().filter((b) => b.studentId === studentId);
}

export function getShuttles(): Shuttle[] {
  try {
    const stored = localStorage.getItem(SHUTTLES_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // fall through
  }
  localStorage.setItem(SHUTTLES_KEY, JSON.stringify(initialShuttles));
  return [...initialShuttles];
}

export function saveShuttles(shuttles: Shuttle[]): void {
  localStorage.setItem(SHUTTLES_KEY, JSON.stringify(shuttles));
}

export function generateBookingId(): string {
  const bookings = getBookings();
  const maxNum = bookings.reduce((max, b) => {
    const num = parseInt(b.bookingId.replace('BK-', ''), 10);
    return num > max ? num : max;
  }, 24000);
  return `BK-${maxNum + 1}`;
}

export function createBooking(
  studentId: string,
  studentName: string,
  shuttle: Shuttle,
  date: string,
  time: string
): Booking {
  const bookingId = generateBookingId();
  const booking: Booking = {
    id: `bk-${Date.now()}`,
    bookingId,
    studentId,
    studentName,
    shuttleId: shuttle.id,
    shuttleDisplayId: shuttle.shuttleId,
    pickup: shuttle.pickup,
    destination: shuttle.destination,
    date,
    time,
    departureTime: shuttle.departureTime,
    estimatedArrival: shuttle.estimatedArrival,
    route: shuttle.routeName,
    driverName: shuttle.driverName,
    vehicleNumber: shuttle.vehicleNumber,
    availableSeats: shuttle.availableSeats,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };

  const bookings = getBookings();
  bookings.push(booking);
  saveBookings(bookings);

  // Reduce available seats
  const shuttles = getShuttles();
  const idx = shuttles.findIndex((s) => s.id === shuttle.id);
  if (idx !== -1) {
    shuttles[idx].availableSeats = Math.max(0, shuttles[idx].availableSeats - 1);
    if (shuttles[idx].availableSeats === 0) {
      shuttles[idx].status = 'full';
    }
    saveShuttles(shuttles);
  }

  return booking;
}

export function cancelBooking(bookingId: string): void {
  const bookings = getBookings();
  const idx = bookings.findIndex((b) => b.id === bookingId);
  if (idx === -1) return;

  bookings[idx].status = 'cancelled' as BookingStatus;
  saveBookings(bookings);

  // Restore one available seat
  const shuttles = getShuttles();
  const sIdx = shuttles.findIndex((s) => s.id === bookings[idx].shuttleId);
  if (sIdx !== -1) {
    shuttles[sIdx].availableSeats = Math.min(shuttles[sIdx].totalSeats, shuttles[sIdx].availableSeats + 1);
    if (shuttles[sIdx].availableSeats > 0) {
      shuttles[sIdx].status = 'available';
    }
    saveShuttles(shuttles);
  }
}
