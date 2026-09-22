import { useState, useMemo } from 'react';
import { Search, History, Eye, Calendar, MapPin, Clock, Bus, User as UserIcon, Hash, Route as RouteIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/context/AuthContext';
import { getStudentBookings } from '@/services/bookingService';
import { statusBadgeVariant, statusLabel, statusOptions } from '@/utils/bookingHelpers';
import type { Booking } from '@/types';

export function TripHistoryPage() {
  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [viewTrip, setViewTrip] = useState<Booking | null>(null);

  const historyBookings = useMemo(() => {
    if (!user) return [];
    return getStudentBookings(user.id)
      .filter((b) => b.status === 'completed' || b.status === 'cancelled' || b.status === 'no-show' || b.status === 'rejected')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [user]);

  const filtered = useMemo(() => {
    return historyBookings.filter((b) => {
      if (statusFilter !== 'all' && b.status !== statusFilter) return false;
      if (dateFilter && b.date !== dateFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const matches =
          b.bookingId.toLowerCase().includes(q) ||
          b.route.toLowerCase().includes(q) ||
          b.driverName.toLowerCase().includes(q) ||
          b.vehicleNumber.toLowerCase().includes(q) ||
          b.shuttleDisplayId.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [historyBookings, search, statusFilter, dateFilter]);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Trip History</h2>
        <p className="mt-1 text-sm text-gray-500">Review your past shuttle trips and travel records</p>
      </div>

      {/* Filters */}
      <Card padding="md" className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            placeholder="Search by trip ID, route, driver..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={statusOptions}
          />
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            icon={<Calendar className="h-4 w-4" />}
          />
        </div>
      </Card>

      {/* Table */}
      <Card padding="none">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<History className="h-8 w-8" />}
            title="No trip history found"
            description={search || statusFilter !== 'all' || dateFilter ? "Try adjusting your filters" : "Your completed and past trips will appear here"}
          />
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  {['Trip ID', 'Date', 'Time', 'Route', 'Driver', 'Vehicle', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3.5 text-sm font-medium text-gray-900 whitespace-nowrap">{t.bookingId}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-700 whitespace-nowrap">{t.date}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-700 whitespace-nowrap">{t.time}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-700 whitespace-nowrap">{t.route}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-700 whitespace-nowrap">{t.driverName}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-700 whitespace-nowrap">{t.vehicleNumber}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <Badge variant={statusBadgeVariant(t.status)}>{statusLabel(t.status)}</Badge>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <button
                        onClick={() => setViewTrip(t)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-primary-50 hover:text-primary-600"
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* View details modal */}
      <Modal
        open={!!viewTrip}
        onClose={() => setViewTrip(null)}
        title="Trip Details"
        size="md"
      >
        {viewTrip && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Trip ID</p>
                <p className="text-lg font-bold text-primary-700">{viewTrip.bookingId}</p>
              </div>
              <Badge variant={statusBadgeVariant(viewTrip.status)}>{statusLabel(viewTrip.status)}</Badge>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                  <Bus className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{viewTrip.route}</p>
                  <p className="text-xs text-gray-400">Shuttle {viewTrip.shuttleDisplayId}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400 flex items-center gap-1"><MapPin className="h-3 w-3" /> Pickup</p>
                <p className="font-medium text-gray-900 mt-0.5">{viewTrip.pickup}</p>
              </div>
              <div>
                <p className="text-gray-400 flex items-center gap-1"><MapPin className="h-3 w-3" /> Destination</p>
                <p className="font-medium text-gray-900 mt-0.5">{viewTrip.destination}</p>
              </div>
              <div>
                <p className="text-gray-400 flex items-center gap-1"><Calendar className="h-3 w-3" /> Date</p>
                <p className="font-medium text-gray-900 mt-0.5">{viewTrip.date}</p>
              </div>
              <div>
                <p className="text-gray-400 flex items-center gap-1"><Clock className="h-3 w-3" /> Time</p>
                <p className="font-medium text-gray-900 mt-0.5">{viewTrip.time}</p>
              </div>
              <div>
                <p className="text-gray-400 flex items-center gap-1"><RouteIcon className="h-3 w-3" /> Route</p>
                <p className="font-medium text-gray-900 mt-0.5">{viewTrip.route}</p>
              </div>
              <div>
                <p className="text-gray-400 flex items-center gap-1"><UserIcon className="h-3 w-3" /> Driver</p>
                <p className="font-medium text-gray-900 mt-0.5">{viewTrip.driverName}</p>
              </div>
              <div>
                <p className="text-gray-400 flex items-center gap-1"><Hash className="h-3 w-3" /> Vehicle</p>
                <p className="font-medium text-gray-900 mt-0.5">{viewTrip.vehicleNumber}</p>
              </div>
              <div>
                <p className="text-gray-400 flex items-center gap-1"><Clock className="h-3 w-3" /> Est. Arrival</p>
                <p className="font-medium text-gray-900 mt-0.5">{viewTrip.estimatedArrival}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
