import { Bus, CalendarCheck, Clock, MapPin, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const stats = [
    { label: 'Active Bookings', value: '3', icon: CalendarCheck, change: '+2 this week', trend: 'up' },
    { label: 'Total Trips', value: '47', icon: Bus, change: '+12 this month', trend: 'up' },
    { label: 'Hours Saved', value: '23h', icon: Clock, change: '-3h vs last month', trend: 'down' },
    { label: 'Distance', value: '186 km', icon: MapPin, change: '+24 km this month', trend: 'up' },
  ];

  const upcomingTrips = [
    { id: 'SH-1284', route: 'North Campus Loop', time: '08:30 AM', status: 'confirmed' },
    { id: 'SH-1285', route: 'Library Express', time: '10:15 AM', status: 'pending' },
    { id: 'SH-1286', route: 'South Campus', time: '02:00 PM', status: 'confirmed' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="mt-1 text-sm text-gray-500">Track your shuttle bookings and travel activity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} padding="md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{stat.value}</p>
                  <div className="mt-2 flex items-center gap-1 text-xs">
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="h-3 w-3 text-success-600" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 text-error-600" />
                    )}
                    <span className={stat.trend === 'up' ? 'text-success-600' : 'text-error-600'}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming trips */}
        <div className="lg:col-span-2">
          <Card padding="none">
            <CardHeader
              title="Upcoming Trips"
              subtitle="Your scheduled shuttle rides"
              action={<Button size="sm" variant="outline" onClick={() => navigate('/student/bookings')}>View all</Button>}
            />
            <CardBody padding="none">
              <div className="divide-y divide-gray-100">
                {upcomingTrips.map((trip) => (
                  <div key={trip.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                        <Bus className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{trip.route}</p>
                        <p className="text-xs text-gray-400 mt-0.5">#{trip.id} · {trip.time}</p>
                      </div>
                    </div>
                    <Badge variant={trip.status === 'confirmed' ? 'success' : 'warning'}>
                      {trip.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Quick action */}
        <div>
          <Card padding="lg">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
                <TrendingUp className="h-7 w-7" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">Need a ride?</h3>
              <p className="mt-1 text-sm text-gray-500">Book a shuttle to your destination in seconds.</p>
              <Button className="mt-4 w-full" onClick={() => navigate('/student/book-shuttle')}>
                Book a Shuttle
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
