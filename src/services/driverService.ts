import { drivers as initialDrivers } from '@/data/drivers';
import { shuttles as initialShuttles } from '@/data/shuttles';
import { getBookings, saveBookings, getShuttles, saveShuttles } from './bookingService';
import type { Driver } from '@/types';
import type { DriverBreak, DriverSchedule } from '@/types/driverSchedule';

const DRIVERS_KEY = 'smartshuttle_drivers';
const SCHEDULES_KEY = 'smartshuttle_driver_schedules';

export function getDrivers(): Driver[] {
  try {
    const stored = localStorage.getItem(DRIVERS_KEY);
    if (stored) return JSON.parse(stored) as Driver[];
  } catch {
    // fall through to seed data
  }
  const seeded = [...initialDrivers];
  localStorage.setItem(DRIVERS_KEY, JSON.stringify(seeded));
  return seeded;
}

export function saveDrivers(drivers: Driver[]): void {
  localStorage.setItem(DRIVERS_KEY, JSON.stringify(drivers));
}

export function getSchedules(): DriverSchedule[] {
  try {
    const stored = localStorage.getItem(SCHEDULES_KEY);
    if (stored) return JSON.parse(stored) as DriverSchedule[];
  } catch {
    // fall through to seed data
  }

  const date = new Date().toISOString().slice(0, 10);
  const seeded: DriverSchedule[] = [
    schedule('sch-001', 'drv-001', date, '08:00', '17:00', [{ id: 'br-001', startTime: '12:00', endTime: '13:00' }]),
    schedule('sch-002', 'drv-002', date, '09:00', '18:00', [{ id: 'br-002', startTime: '13:00', endTime: '14:00' }]),
    schedule('sch-003', 'drv-003', date, '08:30', '16:30', [{ id: 'br-003', startTime: '12:30', endTime: '13:00' }]),
    schedule('sch-004', 'drv-004', date, '09:00', '17:00', [{ id: 'br-004', startTime: '12:00', endTime: '12:45' }]),
    schedule('sch-005', 'drv-005', date, '10:00', '18:00', []),
    schedule('sch-006', 'drv-006', date, '08:00', '16:00', [{ id: 'br-006', startTime: '12:00', endTime: '12:45' }]),
  ];
  localStorage.setItem(SCHEDULES_KEY, JSON.stringify(seeded));
  return seeded;
}

function schedule(id: string, driverId: string, date: string, startTime: string, endTime: string, breaks: DriverBreak[]): DriverSchedule {
  return { id, driverId, date, startTime, endTime, breaks };
}

export function saveSchedules(schedules: DriverSchedule[]): void {
  localStorage.setItem(SCHEDULES_KEY, JSON.stringify(schedules));
}

export function upsertSchedule(scheduleValue: DriverSchedule): void {
  const schedules = getSchedules();
  const index = schedules.findIndex((item) => item.id === scheduleValue.id);
  if (index === -1) schedules.push(scheduleValue);
  else schedules[index] = scheduleValue;
  saveSchedules(schedules);
}

export function deleteSchedule(scheduleId: string): void {
  saveSchedules(getSchedules().filter((scheduleValue) => scheduleValue.id !== scheduleId));
}

export function addDriver(driver: Driver): void {
  saveDrivers([...getDrivers(), driver]);
}

export function updateDriver(driver: Driver): void {
  saveDrivers(getDrivers().map((item) => item.id === driver.id ? driver : item));
}

export function removeDriver(driverId: string): void {
  saveDrivers(getDrivers().filter((driver) => driver.id !== driverId));
  saveSchedules(getSchedules().filter((scheduleValue) => scheduleValue.driverId !== driverId));
}

export function assignDriverToShuttle(shuttleId: string, driver: Driver): boolean {
  const shuttles = getShuttles();
  const shuttleIndex = shuttles.findIndex((shuttle) => shuttle.id === shuttleId);
  if (shuttleIndex === -1) return false;

  shuttles[shuttleIndex] = {
    ...shuttles[shuttleIndex],
    driverId: driver.id,
    driverName: driver.name,
  };
  saveShuttles(shuttles);

  const bookings = getBookings().map((booking) => {
    if (booking.shuttleId !== shuttleId) return booking;
    return { ...booking, driverName: driver.name };
  });
  saveBookings(bookings);
  return true;
}

export function getAssignedShuttleIds(driverId: string): string[] {
  return getShuttles().filter((shuttle) => shuttle.driverId === driverId).map((shuttle) => shuttle.id);
}

export function getShuttlesForAssignment() {
  return getShuttles().length ? getShuttles() : initialShuttles;
}
