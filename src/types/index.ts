export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export type BookingStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'rejected' | 'no-show';

export interface Driver {
  id: string;
  name: string;
  phone: string;
  rating: number;
  status: 'available' | 'on-trip' | 'off-duty';
}

export interface ShuttleRoute {
  id: string;
  name: string;
  stops: string[];
  estimatedDuration: number;
}

export interface Shuttle {
  id: string;
  shuttleId: string;
  routeId: string;
  routeName: string;
  pickup: string;
  destination: string;
  departureTime: string;
  estimatedArrival: string;
  availableSeats: number;
  totalSeats: number;
  driverId: string;
  driverName: string;
  vehicleNumber: string;
  status: 'available' | 'full' | 'departed';
}

export interface Booking {
  id: string;
  bookingId: string;
  studentId: string;
  studentName: string;
  shuttleId: string;
  shuttleDisplayId: string;
  pickup: string;
  destination: string;
  date: string;
  time: string;
  departureTime: string;
  estimatedArrival: string;
  route: string;
  driverName: string;
  vehicleNumber: string;
  availableSeats: number;
  status: BookingStatus;
  createdAt: string;
}
