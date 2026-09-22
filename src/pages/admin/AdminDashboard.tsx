import { Bus, Users, Route, CalendarCheck, ArrowUpRight, TrendingUp, Clock } from 'lucide-react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export function AdminDashboard() {
  const stats = [
    { label: 'Total Bookings', value: '1,284', icon: CalendarCheck, change: '+18% vs last week', color: 'primary' },
    { label: 'Active Drivers', value: '12', icon: Users, change: '2 on break', color: 'accent' },
    { label: 'Active Routes', value: '8', icon: Route, change: 'All operational', color: 'success' },
    { label: 'Shuttles Running', value: '9', icon: Bus, change: '3 in maintenance', color: 'warning' },
  ];

  const recentBookings = [
    { id: 'SH-1284', student: 'Alex Johnson', route: 'North Campus Loop', time: '08:30 AM', status: 'confirmed' },
    { id: 'SH-1283', student: 'Emma Wilson', route: 'Library Express', time: '08:15 AM', status: 'completed' },
    { id: 'SH-1282', student: 'James Park', route: 'South Campus', time: '07:45 AM', status: 'completed' },
    { id: 'SH-1281', student: 'Lily Chen', route: 'North Campus Loop', time: '07:30 AM', status: 'cancelled' },
    { id: 'SH-1280', student: 'Tom Garcia', route: 'Stadium Route', time: '07:15 AM', status: 'completed' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
        <p className="mt-1 text-sm text-gray-500">Overview of campus shuttle operations and activity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
                    <span className="text-success-600">{stat.change}</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent bookings */}
        <div className="lg:col-span-2">
          <Card padding="none">
            <CardHeader
              title="Recent Bookings"
              subtitle="Latest shuttle booking activity"
              action={<Button size="sm" variant="outline">View all</Button>}
            />
            <CardBody padding="none">
              <div className="divide-y divide-gray-100">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                        <Bus className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{booking.student}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          #{booking.id} · {booking.route} · {booking.time}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        booking.status === 'confirmed' ? 'success' :
                        booking.status === 'completed' ? 'primary' : 'error'
                      }
                    >
                      {booking.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* System status */}
        <div>
          <Card padding="none">
            <CardHeader title="System Status" subtitle="Live operational status" />
            <CardBody>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-success-500" />
                    <span className="text-sm text-gray-700">Shuttle Tracking</span>
                  </div>
                  <span className="text-xs text-gray-400">Operational</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-success-500" />
                    <span className="text-sm text-gray-700">Booking System</span>
                  </div>
                  <span className="text-xs text-gray-400">Operational</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-warning-500" />
                    <span className="text-sm text-gray-700">Driver App</span>
                  </div>
                  <span className="text-xs text-gray-400">Degraded</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-success-500" />
                    <span className="text-sm text-gray-700">Notifications</span>
                  </div>
                  <span className="text-xs text-gray-400">Operational</span>
                </div>
              </div>
              <div className="mt-6 rounded-lg bg-gray-50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-primary-600" />
                  <span className="text-sm font-medium text-gray-900">Today's Performance</span>
                </div>
                <p className="text-xs text-gray-500">
                  94% on-time arrivals · 3 minor delays reported
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                  <Clock className="h-3 w-3" />
                  Updated 2 minutes ago
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
