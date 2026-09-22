<<<<<<< HEAD
import { useMemo, useState, type FormEvent } from 'react';
import { Calendar, CheckCircle2, Clock, Eye, Filter, Hash, MapPin, Search, User, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/hooks/useToast';
import { drivers } from '@/data/drivers';
import { getBookings, updateBooking, type BookingUpdate } from '@/services/bookingService';
import type { Booking, BookingStatus } from '@/types';
import { statusBadgeVariant, statusLabel, statusOptions } from '@/utils/bookingHelpers';

const PAGE_SIZE = 6;

const editableStatusOptions = statusOptions.filter((option) => option.value !== 'all');

export function AdminBookingsPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [routeFilter, setRouteFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [viewBooking, setViewBooking] = useState<Booking | null>(null);
  const [editBooking, setEditBooking] = useState<Booking | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [noShowTarget, setNoShowTarget] = useState<Booking | null>(null);
  const [saving, setSaving] = useState(false);

  const bookings = useMemo(() => getBookings(), [refreshKey]);

  const routeOptions = useMemo(() => {
    const routes = Array.from(new Set(bookings.map((booking) => booking.route))).sort();
    return [{ value: 'all', label: 'All Routes' }, ...routes.map((route) => ({ value: route, label: route }))];
  }, [bookings]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return bookings.filter((booking) => {
      if (statusFilter !== 'all' && booking.status !== statusFilter) return false;
      if (dateFilter && booking.date !== dateFilter) return false;
      if (routeFilter !== 'all' && booking.route !== routeFilter) return false;
      if (query) {
        const haystack = [
          booking.bookingId,
          booking.studentName,
          booking.pickup,
          booking.destination,
          booking.route,
          booking.driverName,
          booking.vehicleNumber,
        ].join(' ').toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [bookings, search, statusFilter, dateFilter, routeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function refresh() {
    setRefreshKey((key) => key + 1);
  }

  function updateStatus(booking: Booking, status: BookingStatus, message: string) {
    setSaving(true);
    window.setTimeout(() => {
      const updated = updateBooking(booking.id, { status });
      setSaving(false);
      if (!updated) {
        toast('Unable to update this booking because the shuttle has no available seat.', 'error');
        return;
      }
      setCancelTarget(null);
      setNoShowTarget(null);
      setViewBooking(null);
      refresh();
      toast(message, 'success');
    }, 350);
  }

  function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editBooking) return;
    const form = new FormData(event.currentTarget);
    const date = String(form.get('date') || '');
    const time = String(form.get('time') || '');
    const status = String(form.get('status') || editBooking.status) as BookingStatus;

    if (!date || !time) {
      toast('Date and time are required.', 'error');
      return;
    }

    setSaving(true);
    window.setTimeout(() => {
      const updates: BookingUpdate = { date, time: formatTimeForDisplay(time), status };
      const updated = updateBooking(editBooking.id, updates);
      setSaving(false);
      if (!updated) {
        toast('Unable to reactivate this booking because the shuttle is full.', 'error');
        return;
      }
      setEditBooking(null);
      refresh();
      toast(`Booking ${editBooking.bookingId} updated successfully.`, 'success');
    }, 350);
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function clearFilters() {
    setSearch('');
    setStatusFilter('all');
    setDateFilter('');
    setRouteFilter('all');
    setPage(1);
  }

  const hasFilters = Boolean(search || dateFilter || statusFilter !== 'all' || routeFilter !== 'all');

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Booking Management</h2>
          <p className="mt-1 text-sm text-gray-500">View and manage all campus shuttle bookings.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Filter className="h-4 w-4" />
          <span>{filtered.length} booking{filtered.length === 1 ? '' : 's'} found</span>
        </div>
      </div>

      <Card padding="md" className="mb-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Input
            placeholder="Search ID, employee, route, driver..."
            value={search}
            onChange={(event) => handleSearchChange(event.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
          <Select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }} options={statusOptions} />
          <Select value={routeFilter} onChange={(event) => { setRouteFilter(event.target.value); setPage(1); }} options={routeOptions} />
          <Input
            type="date"
            value={dateFilter}
            onChange={(event) => { setDateFilter(event.target.value); setPage(1); }}
            icon={<Calendar className="h-4 w-4" />}
          />
        </div>
        {hasFilters && (
          <div className="mt-3 flex justify-end">
            <Button variant="ghost" size="sm" onClick={clearFilters}>Clear filters</Button>
          </div>
        )}
      </Card>

      <Card padding="none">
        {pageItems.length === 0 ? (
          <EmptyState
            icon={<Search className="h-8 w-8" />}
            title="No bookings found"
            description="Try changing your search or filters."
            action={hasFilters ? <Button variant="outline" onClick={clearFilters}>Clear filters</Button> : undefined}
          />
        ) : (
          <>
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full min-w-[1120px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    {['Booking ID', 'Employee', 'Status', 'Route', 'Pickup', 'Destination', 'Vehicle', 'Requested Time', 'Driver', 'Actions'].map((heading) => (
                      <th key={heading} className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pageItems.map((booking) => (
                    <tr key={booking.id} className="transition-colors hover:bg-gray-50">
                      <td className="whitespace-nowrap px-4 py-3.5 text-sm font-semibold text-primary-700">{booking.bookingId}</td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-sm font-medium text-gray-900">{booking.studentName}</td>
                      <td className="whitespace-nowrap px-4 py-3.5"><Badge variant={statusBadgeVariant(booking.status)}>{statusLabel(booking.status)}</Badge></td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-sm text-gray-700">{booking.route}</td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-sm text-gray-700">{booking.pickup}</td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-sm text-gray-700">{booking.destination}</td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-sm text-gray-700">{booking.vehicleNumber}</td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-sm text-gray-700">{booking.date} · {booking.time}</td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-sm text-gray-700">{booking.driverName}</td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setViewBooking(booking)} className="rounded-lg p-1.5 text-gray-400 hover:bg-primary-50 hover:text-primary-600" title="View booking"><Eye className="h-4 w-4" /></button>
                          <button onClick={() => setEditBooking(booking)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700" title="Edit booking"><Calendar className="h-4 w-4" /></button>
                          {(booking.status === 'confirmed' || booking.status === 'pending') && (
                            <button onClick={() => setCancelTarget(booking)} className="rounded-lg p-1.5 text-gray-400 hover:bg-error-50 hover:text-error-600" title="Cancel booking"><XCircle className="h-4 w-4" /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-500">Showing {((currentPage - 1) * PAGE_SIZE) + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</Button>
                <span className="px-2 text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
                <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Next</Button>
              </div>
            </div>
          </>
        )}
      </Card>

      <Drawer open={!!viewBooking} onClose={() => setViewBooking(null)} title={viewBooking ? `Booking ${viewBooking.bookingId}` : undefined} width="max-w-lg">
        {viewBooking && (
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">Employee</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">{viewBooking.studentName}</p>
                <p className="text-sm text-gray-500">Employee ID: {viewBooking.studentId}</p>
              </div>
              <Badge variant={statusBadgeVariant(viewBooking.status)}>{statusLabel(viewBooking.status)}</Badge>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-400">Route</p>
              <p className="mt-1 font-semibold text-gray-900">{viewBooking.pickup} → {viewBooking.destination}</p>
              <p className="mt-1 text-sm text-gray-500">{viewBooking.route} · {viewBooking.shuttleDisplayId} · {viewBooking.vehicleNumber}</p>
            </div>

            <div className="grid grid-cols-2 gap-5 text-sm">
              <div><p className="flex items-center gap-1 text-gray-400"><Calendar className="h-3.5 w-3.5" /> Date</p><p className="mt-1 font-medium text-gray-900">{viewBooking.date}</p></div>
              <div><p className="flex items-center gap-1 text-gray-400"><Clock className="h-3.5 w-3.5" /> Requested time</p><p className="mt-1 font-medium text-gray-900">{viewBooking.time}</p></div>
              <div><p className="flex items-center gap-1 text-gray-400"><Clock className="h-3.5 w-3.5" /> Departure</p><p className="mt-1 font-medium text-gray-900">{viewBooking.departureTime}</p></div>
              <div><p className="flex items-center gap-1 text-gray-400"><MapPin className="h-3.5 w-3.5" /> Arrival</p><p className="mt-1 font-medium text-gray-900">{viewBooking.estimatedArrival}</p></div>
              <div><p className="flex items-center gap-1 text-gray-400"><User className="h-3.5 w-3.5" /> Driver</p><p className="mt-1 font-medium text-gray-900">{viewBooking.driverName}</p></div>
              <div><p className="flex items-center gap-1 text-gray-400"><Hash className="h-3.5 w-3.5" /> Vehicle</p><p className="mt-1 font-medium text-gray-900">{viewBooking.vehicleNumber}</p></div>
            </div>

            <div className="border-t border-gray-100 pt-5">
              <p className="mb-3 text-sm font-semibold text-gray-900">Admin actions</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Button variant="outline" onClick={() => { setEditBooking(viewBooking); setViewBooking(null); }}>Edit Booking</Button>
                {(viewBooking.status === 'confirmed' || viewBooking.status === 'pending') && (
                  <Button variant="danger" onClick={() => setCancelTarget(viewBooking)}>Cancel Booking</Button>
                )}
                {(viewBooking.status === 'confirmed' || viewBooking.status === 'pending') && (
                  <Button variant="secondary" onClick={() => setNoShowTarget(viewBooking)}><XCircle className="h-4 w-4" /> Mark No-show</Button>
                )}
                {viewBooking.status === 'pending' && (
                  <Button onClick={() => updateStatus(viewBooking, 'confirmed', `Booking ${viewBooking.bookingId} accepted.`)} loading={saving}><CheckCircle2 className="h-4 w-4" /> Accept Booking</Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Drawer>

      <Modal
        open={!!editBooking}
        onClose={() => setEditBooking(null)}
        title={editBooking ? `Edit ${editBooking.bookingId}` : undefined}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setEditBooking(null)} disabled={saving}>Cancel</Button>
            <Button type="submit" form="edit-booking-form" loading={saving}>Save Changes</Button>
          </>
        }
      >
        {editBooking && (
          <form id="edit-booking-form" onSubmit={saveEdit} className="space-y-4">
            <div className="rounded-lg bg-gray-50 p-4 text-sm">
              <p className="font-medium text-gray-900">{editBooking.studentName}</p>
              <p className="mt-1 text-gray-500">{editBooking.pickup} → {editBooking.destination}</p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Date" name="date" type="date" defaultValue={editBooking.date} required />
              <Input label="Requested Time" name="time" type="time" defaultValue={toTimeInput(editBooking.time)} required />
            </div>
            <Select label="Status" name="status" defaultValue={editBooking.status} options={editableStatusOptions} />
            <p className="text-xs text-gray-400">Driver and vehicle assignment will be managed in the Driver Assignment module.</p>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={() => cancelTarget && updateStatus(cancelTarget, 'cancelled', `Booking ${cancelTarget.bookingId} cancelled successfully.`)}
        title="Cancel Booking"
        message={`Are you sure you want to cancel ${cancelTarget?.bookingId || ''}? The shuttle seat will be restored.`}
        confirmLabel="Cancel Booking"
        danger
        loading={saving}
      />

      <ConfirmDialog
        open={!!noShowTarget}
        onClose={() => setNoShowTarget(null)}
        onConfirm={() => noShowTarget && updateStatus(noShowTarget, 'no-show', `Booking ${noShowTarget.bookingId} marked as no-show.`)}
        title="Mark Rider as No-show"
        message={`Mark ${noShowTarget?.studentName || 'this rider'} as a no-show for ${noShowTarget?.bookingId || ''}?`}
        confirmLabel="Mark No-show"
        loading={saving}
      />
    </div>
  );
}

function formatTimeForDisplay(value: string): string {
  const [hours, minutes] = value.split(':').map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return value;
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${String(hour12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
}

function toTimeInput(value: string): string {
  const match = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return value;
  let hour = Number(match[1]);
  const minute = match[2];
  const period = match[3].toUpperCase();
  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;
  return `${String(hour).padStart(2, '0')}:${minute}`;
}
=======
import { ClipboardList } from 'lucide-react';
import { PagePlaceholder } from '@/components/common/PagePlaceholder';

export function AdminBookingsPage() {
  return (
    <PagePlaceholder
      title="Bookings"
      description="View and manage all student shuttle bookings"
      icon={<ClipboardList className="h-9 w-9" />}
    />
  );
}
>>>>>>> 5659604fc572f48fdc5ffb0a48e7a78db09dad67
