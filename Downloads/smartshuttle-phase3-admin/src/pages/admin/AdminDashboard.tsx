import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, Users, Route as RouteIcon, CalendarCheck, ArrowUpRight, TrendingUp, Clock, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getBookings } from '@/services/bookingService';
import { drivers } from '@/data/drivers';
import { routes } from '@/data/routes';
import { shuttles } from '@/data/shuttles';
import { statusBadgeVariant, statusLabel } from '@/utils/bookingHelpers';

export function AdminDashboard() {
  const navigate = useNavigate();
  const bookings = useMemo(() => getBookings(), []);

  const stats = useMemo(() => {
    const activeDrivers = drivers.filter((driver) => driver.status !== 'off-duty').length;
    const activeShuttles = shuttles.filter((shuttle) => shuttle.status !== 'departed').length;
    const completed = bookings.filter((booking) => booking.status === 'completed').length;
    const cancelled = bookings.filter((booking) => booking.status === 'cancelled').length;
    const utilization = bookings.length ? Math.round(((bookings.length - cancelled) / bookings.length) * 100) : 0;

    return [
      { label: 'Total Bookings', value: bookings.length.toLocaleString(), icon: CalendarCheck, detail: `${completed} completed`, color: 'primary' },
      { label: 'Active Drivers', value: activeDrivers.toString(), icon: Users, detail: `${drivers.filter((driver) => driver.status === 'on-trip').length} on trip`, color: 'accent' },
      { label: 'Active Routes', value: routes.length.toString(), icon: RouteIcon, detail: 'All configured', color: 'success' },
      { label: 'Active Shuttles', value: activeShuttles.toString(), icon: Bus, detail: `${utilization}% booking utilization`, color: 'warning' },
    ];
  }, [bookings]);

  const recentBookings = bookings.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
        <p className="mt-1 text-sm text-gray-500">Overview of campus shuttle operations and activity</p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const colorClasses: Record<string, string> = {
            primary: 'bg-primary-50 text-primary-600',
            accent: 'bg-accent-50 text-accent-600',
            success: 'bg-success-50 text-success-600',
            warning: 'bg-warning-50 text-warning-600',
          };
          return (
            <Card key={stat.label} padding="md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{stat.value}</p>
                  <div className="mt-2 flex items-center gap-1 text-xs">
                    <ArrowUpRight className="h-3 w-3 text-success-600" />
                    <span className="text-success-600">{stat.detail}</span>
                  </div>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colorClasses[stat.color]}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card padding="none">
            <CardHeader
              title="Recent Bookings"
              subtitle="Latest activity from students and employees"
              action={<Button size="sm" variant="outline" onClick={() => navigate('/admin/bookings')}>View all <ChevronRight className="h-4 w-4" /></Button>}
            />
            <CardBody padding="none">
              {recentBookings.length === 0 ? (
                <div className="px-6 py-12 text-center text-sm text-gray-400">No bookings available.</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {recentBookings.map((booking) => (
                    <button key={booking.id} onClick={() => navigate('/admin/bookings')} className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left hover:bg-gray-50">
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600"><Bus className="h-5 w-5" /></div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-gray-900">{booking.studentName}</p>
                          <p className="mt-0.5 truncate text-xs text-gray-400">#{booking.bookingId} · {booking.route} · {booking.time}</p>
                        </div>
                      </div>
                      <Badge variant={statusBadgeVariant(booking.status)}>{statusLabel(booking.status)}</Badge>
                    </button>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        <div>
          <Card padding="none">
            <CardHeader title="System Status" subtitle="Current operational status" />
            <CardBody>
              <div className="space-y-4">
                {[
                  ['Shuttle Tracking', 'Operational', 'success'],
                  ['Booking System', 'Operational', 'success'],
                  ['Driver Scheduling', 'Ready', 'success'],
                  ['Notifications', 'Operational', 'success'],
                ].map(([name, status, tone]) => (
                  <div key={name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><div className={`h-2 w-2 rounded-full ${tone === 'success' ? 'bg-success-500' : 'bg-warning-500'}`} /><span className="text-sm text-gray-700">{name}</span></div>
                    <span className="text-xs text-gray-400">{status}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-lg bg-gray-50 p-4">
                <div className="mb-2 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary-600" /><span className="text-sm font-medium text-gray-900">Today's Operations</span></div>
                <p className="text-xs text-gray-500">{bookings.filter((booking) => booking.date === '2026-09-22').length} bookings scheduled for today.</p>
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-400"><Clock className="h-3 w-3" />Data is persisted locally for this demo</div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
