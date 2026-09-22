import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, CalendarCheck, XCircle, Clock, MapPin, ArrowRight, TrendingUp, CalendarPlus, Route as RouteIcon } from 'lucide-react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuth } from '@/context/AuthContext';
import { getStudentBookings } from '@/services/bookingService';
import { statusBadgeVariant, statusLabel } from '@/utils/bookingHelpers';
import { routes } from '@/data/routes';

export function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const bookings = useMemo(() => (user ? getStudentBookings(user.id) : []), [user]);

  const activeBookings = bookings.filter((b) => b.status === 'confirmed' || b.status === 'pending');
  const upcomingTrips = bookings
    .filter((b) => b.status === 'confirmed' || b.status === 'pending')
    .sort((a, b) => new Date(a.date + ' ' + a.time).getTime() - new Date(b.date + ' ' + b.time).getTime())
    .slice(0, 3);
  const totalTrips = bookings.filter((b) => b.status === 'completed').length;
  const cancelledTrips = bookings.filter((b) => b.status === 'cancelled').length;
  const recentTrips = bookings
    .filter((b) => b.status === 'completed' || b.status === 'cancelled' || b.status === 'no-show')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  // Popular routes from completed trips
  const routeCount = new Map<string, number>();
  bookings.forEach((b) => {
    if (b.status === 'completed') {
      routeCount.set(b.route, (routeCount.get(b.route) || 0) + 1);
    }
  });
  const popularRoutes = [...routeCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name, count]) => ({ name, count, ...routes.find((r) => r.name === name) }));

  const stats = [
    { label: 'Active Bookings', value: activeBookings.length, icon: CalendarCheck, color: 'bg-primary-50 text-primary-600' },
    { label: 'Upcoming Trips', value: upcomingTrips.length, icon: Bus, color: 'bg-accent-50 text-accent-600' },
    { label: 'Total Trips', value: totalTrips, icon: MapPin, color: 'bg-success-50 text-success-600' },
    { label: 'Cancelled Trips', value: cancelledTrips, icon: XCircle, color: 'bg-error-50 text-error-600' },
  ];

  return (
    <div>
      {/* Welcome section */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name.split(' ')[0]}
        </h2>
        <p className="mt-1 text-sm text-gray-500">Track your shuttle bookings and travel activity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} padding="md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
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
              {upcomingTrips.length === 0 ? (
                <EmptyState
                  icon={<Bus className="h-7 w-7" />}
                  title="No upcoming trips"
                  description="Book a shuttle to get started"
                  action={<Button size="sm" onClick={() => navigate('/student/book-shuttle')}>Book a Shuttle</Button>}
                />
              ) : (
                <div className="divide-y divide-gray-100">
                  {upcomingTrips.map((trip) => (
                    <div key={trip.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                          <Bus className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{trip.route}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            #{trip.bookingId} · {trip.date} · {trip.time}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="hidden sm:flex items-center gap-1 text-xs text-gray-400">
                          <MapPin className="h-3 w-3" /> {trip.pickup}
                          <ArrowRight className="h-3 w-3" /> {trip.destination}
                        </span>
                        <Badge variant={statusBadgeVariant(trip.status)}>
                          {statusLabel(trip.status)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Quick book */}
        <div>
          <Card padding="lg">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
                <TrendingUp className="h-7 w-7" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">Need a ride?</h3>
              <p className="mt-1 text-sm text-gray-500">Book a shuttle to your destination in seconds.</p>
              <Button className="mt-4 w-full" onClick={() => navigate('/student/book-shuttle')}>
                <CalendarPlus className="h-4 w-4" /> Book a Shuttle
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent trips + Popular routes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card padding="none">
          <CardHeader
            title="Recent Trips"
            subtitle="Your latest travel activity"
            action={<Button size="sm" variant="ghost" onClick={() => navigate('/student/trip-history')}>View history</Button>}
          />
          <CardBody padding="none">
            {recentTrips.length === 0 ? (
              <EmptyState icon={<Clock className="h-7 w-7" />} title="No recent trips" />
            ) : (
              <div className="divide-y divide-gray-100">
                {recentTrips.map((trip) => (
                  <div key={trip.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                        <Bus className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{trip.route}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{trip.date} · {trip.time}</p>
                      </div>
                    </div>
                    <Badge variant={statusBadgeVariant(trip.status)}>
                      {statusLabel(trip.status)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card padding="none">
          <CardHeader title="Popular Routes" subtitle="Most traveled routes" />
          <CardBody padding="none">
            {popularRoutes.length === 0 ? (
              <EmptyState icon={<RouteIcon className="h-7 w-7" />} title="No route data yet" description="Complete trips to see your popular routes" />
            ) : (
              <div className="divide-y divide-gray-100">
                {popularRoutes.map((r) => (
                  <div key={r.name} className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                        <RouteIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{r.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {r.stops?.slice(0, 3).join(' → ') || ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{r.count} {r.count === 1 ? 'trip' : 'trips'}</p>
                      <p className="text-xs text-gray-400 mt-0.5">~{r.estimatedDuration || '?'} min</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
