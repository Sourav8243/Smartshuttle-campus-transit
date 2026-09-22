import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Ticket, Eye, XCircle, Calendar, MapPin, Clock, Bus, User as UserIcon, Hash } from 'lucide-react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/useToast';
import { getStudentBookings, cancelBooking } from '@/services/bookingService';
import { statusBadgeVariant, statusLabel, statusOptions } from '@/utils/bookingHelpers';
import type { Booking } from '@/types';

export function StudentBookingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [viewBooking, setViewBooking] = useState<Booking | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const bookings = useMemo(() => {
    if (!user) return [];
    return getStudentBookings(user.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, refreshKey]);

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      if (statusFilter !== 'all' && b.status !== statusFilter) return false;
      if (dateFilter && b.date !== dateFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const matches =
          b.bookingId.toLowerCase().includes(q) ||
          b.route.toLowerCase().includes(q) ||
          b.pickup.toLowerCase().includes(q) ||
          b.destination.toLowerCase().includes(q) ||
          b.driverName.toLowerCase().includes(q) ||
          b.vehicleNumber.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [bookings, search, statusFilter, dateFilter]);

  function handleCancel() {
    if (!cancelTarget) return;
    setCancelling(true);
    setTimeout(() => {
      cancelBooking(cancelTarget.id);
      setCancelling(false);
      setCancelTarget(null);
      setRefreshKey((k) => k + 1);
      toast(`Booking ${cancelTarget.bookingId} has been cancelled`, 'success');
    }, 500);
  }

  const canCancel = (status: string) => status === 'confirmed' || status === 'pending';

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>
        <p className="mt-1 text-sm text-gray-500">View and manage your shuttle bookings</p>
      </div>

      {/* Filters */}
      <Card padding="md" className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            placeholder="Search by ID, route, driver..."
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
            icon={<Ticket className="h-8 w-8" />}
            title="No bookings found"
            description={search || statusFilter !== 'all' || dateFilter ? "Try adjusting your filters" : "Book a shuttle to see your bookings here"}
            action={
              !search && statusFilter === 'all' && !dateFilter ? (
                <Button onClick={() => navigate('/student/book-shuttle')}>Book a Shuttle</Button>
              ) : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  {['Booking ID', 'Date', 'Time', 'Pickup', 'Destination', 'Driver', 'Vehicle', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3.5 text-sm font-medium text-gray-900 whitespace-nowrap">{b.bookingId}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-700 whitespace-nowrap">{b.date}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-700 whitespace-nowrap">{b.time}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-700 whitespace-nowrap">{b.pickup}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-700 whitespace-nowrap">{b.destination}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-700 whitespace-nowrap">{b.driverName}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-700 whitespace-nowrap">{b.vehicleNumber}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <Badge variant={statusBadgeVariant(b.status)}>{statusLabel(b.status)}</Badge>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setViewBooking(b)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-primary-50 hover:text-primary-600"
                          title="View booking"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {canCancel(b.status) && (
                          <button
                            onClick={() => setCancelTarget(b)}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-error-50 hover:text-error-600"
                            title="Cancel booking"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* View modal */}
      <Modal
        open={!!viewBooking}
        onClose={() => setViewBooking(null)}
        title="Booking Details"
        size="md"
        footer={
          canCancel(viewBooking?.status || '') ? (
            <Button
              variant="danger"
              onClick={() => { setCancelTarget(viewBooking); setViewBooking(null); }}
            >
              Cancel Booking
            </Button>
          ) : undefined
        }
      >
        {viewBooking && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Booking ID</p>
                <p className="text-lg font-bold text-primary-700">{viewBooking.bookingId}</p>
              </div>
              <Badge variant={statusBadgeVariant(viewBooking.status)}>{statusLabel(viewBooking.status)}</Badge>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                  <Bus className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{viewBooking.route}</p>
                  <p className="text-xs text-gray-400">Shuttle {viewBooking.shuttleDisplayId}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400 flex items-center gap-1"><MapPin className="h-3 w-3" /> Pickup</p>
                <p className="font-medium text-gray-900 mt-0.5">{viewBooking.pickup}</p>
              </div>
              <div>
                <p className="text-gray-400 flex items-center gap-1"><MapPin className="h-3 w-3" /> Destination</p>
                <p className="font-medium text-gray-900 mt-0.5">{viewBooking.destination}</p>
              </div>
              <div>
                <p className="text-gray-400 flex items-center gap-1"><Calendar className="h-3 w-3" /> Date</p>
                <p className="font-medium text-gray-900 mt-0.5">{viewBooking.date}</p>
              </div>
              <div>
                <p className="text-gray-400 flex items-center gap-1"><Clock className="h-3 w-3" /> Time</p>
                <p className="font-medium text-gray-900 mt-0.5">{viewBooking.time}</p>
              </div>
              <div>
                <p className="text-gray-400 flex items-center gap-1"><UserIcon className="h-3 w-3" /> Driver</p>
                <p className="font-medium text-gray-900 mt-0.5">{viewBooking.driverName}</p>
              </div>
              <div>
                <p className="text-gray-400 flex items-center gap-1"><Hash className="h-3 w-3" /> Vehicle</p>
                <p className="font-medium text-gray-900 mt-0.5">{viewBooking.vehicleNumber}</p>
              </div>
              <div>
                <p className="text-gray-400 flex items-center gap-1"><Clock className="h-3 w-3" /> Departure</p>
                <p className="font-medium text-gray-900 mt-0.5">{viewBooking.departureTime}</p>
              </div>
              <div>
                <p className="text-gray-400 flex items-center gap-1"><MapPin className="h-3 w-3" /> Est. Arrival</p>
                <p className="font-medium text-gray-900 mt-0.5">{viewBooking.estimatedArrival}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Cancel confirmation */}
      <ConfirmDialog
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        title="Cancel Booking"
        message={`Are you sure you want to cancel booking ${cancelTarget?.bookingId || ''}? This action cannot be undone.`}
        confirmLabel="Yes, Cancel Booking"
        danger
        loading={cancelling}
      />
    </div>
  );
}
