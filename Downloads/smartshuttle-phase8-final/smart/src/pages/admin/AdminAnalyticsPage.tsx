import { useMemo, useState } from 'react';
import { Bus, CalendarDays, Clock3, Route as RouteIcon, TrendingUp, Users, XCircle } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { getBookings } from '@/services/bookingService';
import { getDrivers } from '@/services/driverService';
import { getRoutes } from '@/services/routeService';
import { getShuttles } from '@/services/bookingService';
import type { BookingStatus } from '@/types';

type Range = 'today' | '7days' | '30days' | 'all';

const statusLabels: Record<BookingStatus, string> = {
  confirmed: 'Confirmed', pending: 'Pending', completed: 'Completed',
  cancelled: 'Cancelled', rejected: 'Rejected', 'no-show': 'No-show',
};

const statusClasses: Record<BookingStatus, string> = {
  confirmed: 'bg-primary-500', pending: 'bg-warning-500', completed: 'bg-success-500',
  cancelled: 'bg-danger-500', rejected: 'bg-gray-400', 'no-show': 'bg-orange-500',
};

function parseTime(value: string): number {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return 0;
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const period = match[3].toUpperCase();
  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;
  return hour + minute / 60;
}

function formatDay(date: string): string {
  const value = new Date(`${date}T00:00:00`);
  return value.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function startDateFor(range: Range, dates: string[]): string | null {
  if (range === 'all' || dates.length === 0) return null;
  const sorted = dates.slice().sort();
  const max = sorted[sorted.length - 1];
  const d = new Date(`${max}T00:00:00`);
  d.setDate(d.getDate() - (range === 'today' ? 0 : range === '7days' ? 6 : 29));
  return d.toISOString().slice(0, 10);
}

export function AdminAnalyticsPage() {
  const [range, setRange] = useState<Range>('30days');
  const [routeFilter, setRouteFilter] = useState('all');

  const allBookings = useMemo(() => getBookings(), []);
  const drivers = useMemo(() => getDrivers(), []);
  const routes = useMemo(() => getRoutes(), []);
  const shuttles = useMemo(() => getShuttles(), []);

  const dates = useMemo(() => allBookings.map((b) => b.date), [allBookings]);
  const startDate = startDateFor(range, dates);

  const filtered = useMemo(() => allBookings.filter((booking) => {
    const dateMatch = !startDate || booking.date >= startDate;
    const routeMatch = routeFilter === 'all' || booking.route === routeFilter;
    return dateMatch && routeMatch;
  }), [allBookings, startDate, routeFilter]);

  const activeBookings = filtered.filter((b) => !['cancelled', 'rejected'].includes(b.status)).length;
  const cancelled = filtered.filter((b) => b.status === 'cancelled').length;
  const cancellationRate = filtered.length ? Math.round((cancelled / filtered.length) * 100) : 0;
  const utilization = shuttles.length
    ? Math.round(shuttles.reduce((sum, shuttle) => sum + (1 - shuttle.availableSeats / shuttle.totalSeats), 0) / shuttles.length * 100)
    : 0;
  const activeDrivers = drivers.filter((driver) => driver.status !== 'off-duty').length;
  const driverUtilization = drivers.length ? Math.round((drivers.filter((driver) => driver.status === 'on-trip').length / drivers.length) * 100) : 0;

  const dailyTrend = useMemo(() => {
    const grouped = new Map<string, number>();
    filtered.forEach((b) => grouped.set(b.date, (grouped.get(b.date) ?? 0) + 1));
    return Array.from(grouped.entries()).sort(([a], [b]) => a.localeCompare(b)).slice(-14);
  }, [filtered]);

  const hourlyDemand = useMemo(() => {
    const buckets = [
      { label: '8 AM', min: 8, max: 9, value: 0 }, { label: '9 AM', min: 9, max: 10, value: 0 },
      { label: '10 AM', min: 10, max: 11, value: 0 }, { label: '11 AM', min: 11, max: 12, value: 0 },
      { label: '12 PM', min: 12, max: 13, value: 0 }, { label: '1 PM', min: 13, max: 14, value: 0 },
      { label: '2 PM', min: 14, max: 15, value: 0 }, { label: '3 PM', min: 15, max: 16, value: 0 },
      { label: '4 PM', min: 16, max: 17, value: 0 }, { label: '5 PM', min: 17, max: 18, value: 0 },
      { label: '6 PM', min: 18, max: 19, value: 0 },
    ];
    filtered.forEach((booking) => {
      const hour = parseTime(booking.time || booking.departureTime);
      const bucket = buckets.find((item) => hour >= item.min && hour < item.max);
      if (bucket) bucket.value += 1;
    });
    return buckets;
  }, [filtered]);

  const routeDemand = useMemo(() => {
    const grouped = new Map<string, number>();
    filtered.forEach((b) => grouped.set(b.route, (grouped.get(b.route) ?? 0) + 1));
    return Array.from(grouped.entries()).sort((a, b) => b[1] - a[1]);
  }, [filtered]);

  const statusBreakdown = useMemo(() => {
    const statuses: BookingStatus[] = ['confirmed', 'pending', 'completed', 'cancelled', 'rejected', 'no-show'];
    return statuses.map((status) => ({ status, value: filtered.filter((b) => b.status === status).length }));
  }, [filtered]);

  const peak = hourlyDemand.reduce((best, item) => item.value > best.value ? item : best, hourlyDemand[0]);
  const maxDaily = Math.max(...dailyTrend.map(([, value]) => value), 1);
  const maxHourly = Math.max(...hourlyDemand.map((item) => item.value), 1);
  const maxRoute = Math.max(...routeDemand.map(([, value]) => value), 1);
  const totalStatus = Math.max(filtered.length, 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
          <p className="mt-1 text-sm text-gray-500">Monitor shuttle usage, demand and operational performance.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(['today', '7days', '30days', 'all'] as Range[]).map((item) => (
            <button key={item} onClick={() => setRange(item)} className={`rounded-lg px-3 py-2 text-sm font-medium transition ${range === item ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50'}`}>
              {item === 'today' ? 'Today' : item === '7days' ? 'Last 7 Days' : item === '30days' ? 'Last 30 Days' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total Bookings', value: filtered.length, icon: CalendarDays, note: `${activeBookings} active`, tone: 'bg-primary-50 text-primary-600' },
          { label: 'Peak Demand', value: peak.value, icon: Clock3, note: peak.value ? peak.label : 'No demand', tone: 'bg-warning-50 text-warning-600' },
          { label: 'Shuttle Utilization', value: `${utilization}%`, icon: Bus, note: `${shuttles.length} shuttles`, tone: 'bg-success-50 text-success-600' },
          { label: 'Cancellation Rate', value: `${cancellationRate}%`, icon: XCircle, note: `${cancelled} cancelled`, tone: 'bg-red-50 text-red-600' },
        ].map(({ label, value, icon: Icon, note, tone }) => (
          <Card key={label} padding="md">
            <div className="flex items-start justify-between">
              <div><p className="text-sm text-gray-500">{label}</p><p className="mt-1 text-2xl font-bold text-gray-900">{value}</p><p className="mt-1 text-xs text-gray-400">{note}</p></div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tone}`}><Icon className="h-5 w-5" /></div>
            </div>
          </Card>
        ))}
      </div>

      <Card padding="none">
        <CardHeader title="Filters" subtitle="Focus the operational metrics shown below." />
        <CardBody>
          <label className="block max-w-sm text-sm font-medium text-gray-700">
            Route
            <select value={routeFilter} onChange={(e) => setRouteFilter(e.target.value)} className="mt-2 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100">
              <option value="all">All routes</option>
              {routes.map((route) => <option key={route.id} value={route.name}>{route.name}</option>)}
            </select>
          </label>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card padding="none">
          <CardHeader title="Booking Trends" subtitle="Bookings over the selected period" />
          <CardBody>
            {dailyTrend.length === 0 ? <p className="py-12 text-center text-sm text-gray-400">No booking data for this period.</p> : (
              <div className="flex h-64 items-end gap-2 overflow-x-auto pb-7 pt-4">
                {dailyTrend.map(([date, value]) => (
                  <div key={date} className="flex h-full min-w-[38px] flex-1 flex-col items-center justify-end gap-2">
                    <span className="text-xs font-medium text-gray-600">{value}</span>
                    <div className="flex w-full max-w-8 items-end rounded-t-md bg-primary-100" style={{ height: `${Math.max(8, (value / maxDaily) * 82)}%` }}>
                      <div className="w-full rounded-t-md bg-primary-500" style={{ height: '100%' }} />
                    </div>
                    <span className="whitespace-nowrap text-[10px] text-gray-400">{formatDay(date)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card padding="none">
          <CardHeader title="Demand by Hour" subtitle="Identify peak campus travel periods" />
          <CardBody>
            <div className="space-y-3">
              {hourlyDemand.map((item) => (
                <div key={item.label} className="grid grid-cols-[48px_1fr_28px] items-center gap-3">
                  <span className="text-xs text-gray-500">{item.label}</span>
                  <div className="h-2.5 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-primary-500 transition-all" style={{ width: `${(item.value / maxHourly) * 100}%` }} /></div>
                  <span className="text-right text-xs font-medium text-gray-700">{item.value}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card padding="none">
          <CardHeader title="Route Demand" subtitle="Bookings by shuttle route" />
          <CardBody>
            <div className="space-y-4">
              {routeDemand.length === 0 ? <p className="py-8 text-center text-sm text-gray-400">No route data available.</p> : routeDemand.map(([route, value]) => (
                <div key={route}>
                  <div className="mb-1.5 flex items-center justify-between text-sm"><span className="flex items-center gap-2 font-medium text-gray-700"><RouteIcon className="h-4 w-4 text-primary-500" />{route}</span><span className="text-gray-500">{value}</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-accent-500" style={{ width: `${(value / maxRoute) * 100}%` }} /></div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card padding="none">
          <CardHeader title="Booking Status" subtitle="Distribution of current booking states" />
          <CardBody>
            <div className="space-y-4">
              {statusBreakdown.map(({ status, value }) => (
                <div key={status}>
                  <div className="mb-1.5 flex items-center justify-between text-sm"><span className="flex items-center gap-2 text-gray-700"><span className={`h-2.5 w-2.5 rounded-full ${statusClasses[status]}`} />{statusLabels[status]}</span><span className="font-medium text-gray-700">{value} <span className="font-normal text-gray-400">({Math.round((value / totalStatus) * 100)}%)</span></span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100"><div className={`h-full rounded-full ${statusClasses[status]}`} style={{ width: `${(value / totalStatus) * 100}%` }} /></div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card padding="md">
          <div className="flex items-center gap-3"><div className="rounded-lg bg-accent-50 p-2 text-accent-600"><Users className="h-5 w-5" /></div><div><p className="text-sm text-gray-500">Driver Utilization</p><p className="text-2xl font-bold text-gray-900">{driverUtilization}%</p></div></div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-accent-500" style={{ width: `${driverUtilization}%` }} /></div>
          <p className="mt-2 text-xs text-gray-400">{activeDrivers} of {drivers.length} drivers are not off-duty.</p>
        </Card>
        <Card padding="md">
          <div className="flex items-center gap-3"><div className="rounded-lg bg-success-50 p-2 text-success-600"><TrendingUp className="h-5 w-5" /></div><div><p className="text-sm text-gray-500">Operational Snapshot</p><p className="text-2xl font-bold text-gray-900">{routes.filter((r) => r.status !== 'inactive').length} active routes</p></div></div>
          <p className="mt-4 text-sm text-gray-500">Analytics are calculated from the same persisted booking, route, driver and shuttle data used throughout the application.</p>
        </Card>
      </div>

      <div className="rounded-lg border border-primary-100 bg-primary-50 p-4 text-sm text-primary-800">
        <strong>Peak-hour insight:</strong> {peak.value ? `${peak.label} currently has the highest recorded booking demand (${peak.value} bookings).` : 'There is not enough booking data to identify a peak hour yet.'}
      </div>
    </div>
  );
}
