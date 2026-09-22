<<<<<<< HEAD
import { useMemo, useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit3,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  UserPlus,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Drawer } from '@/components/ui/Drawer';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/hooks/useToast';
import { getBookings, getShuttles } from '@/services/bookingService';
import {
  addDriver,
  assignDriverToShuttle,
  getDrivers,
  getSchedules,
  removeDriver,
  saveSchedules,
  updateDriver,
} from '@/services/driverService';
import type { Driver, Shuttle } from '@/types';
import type { DriverBreak, DriverSchedule } from '@/types/driverSchedule';

const START_HOUR = 8;
const END_HOUR = 18;
const SLOT_COUNT = END_HOUR - START_HOUR;

type ScheduleForm = {
  id?: string;
  driverId: string;
  date: string;
  startTime: string;
  endTime: string;
  breakStart: string;
  breakEnd: string;
  notes: string;
};

type DriverForm = {
  id?: string;
  name: string;
  phone: string;
  rating: string;
  status: Driver['status'];
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function minutes(value: string): number {
  const [hours, mins] = value.split(':').map(Number);
  return hours * 60 + mins;
}

function timeLabel(value: string) {
  const [hours, mins] = value.split(':').map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(mins)) return value;
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12}:${String(mins).padStart(2, '0')} ${period}`;
}

function statusVariant(status: Driver['status']): BadgeVariant {
  if (status === 'available') return 'success';
  if (status === 'on-trip') return 'primary';
  return 'neutral';
}

function statusLabel(status: Driver['status']) {
  return status === 'on-trip' ? 'On Trip' : status === 'off-duty' ? 'Off Duty' : 'Available';
}

function emptyDriverForm(): DriverForm {
  return { name: '', phone: '', rating: '4.5', status: 'available' };
}

function emptyScheduleForm(driverId: string, date: string): ScheduleForm {
  return { driverId, date, startTime: '08:00', endTime: '17:00', breakStart: '', breakEnd: '', notes: '' };
}

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return aStart < bEnd && bStart < aEnd;
}

function scheduleCovers(schedule: DriverSchedule, start: string, end: string) {
  const startMinutes = minutes(start);
  const endMinutes = minutes(end);
  return minutes(schedule.startTime) <= startMinutes && minutes(schedule.endTime) >= endMinutes;
}

export function AdminDriversPage() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(today());
  const [driversState, setDriversState] = useState<Driver[]>(() => getDrivers());
  const [schedules, setSchedules] = useState<DriverSchedule[]>(() => getSchedules());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [driverForm, setDriverForm] = useState<DriverForm | null>(null);
  const [scheduleForm, setScheduleForm] = useState<ScheduleForm | null>(null);
  const [viewDriver, setViewDriver] = useState<Driver | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Driver | null>(null);
  const [assignmentTarget, setAssignmentTarget] = useState<Driver | null>(null);
  const [assignmentShuttleId, setAssignmentShuttleId] = useState('');
  const [saving, setSaving] = useState(false);

  const filteredDrivers = useMemo(() => driversState.filter((driver) => {
    const matchesSearch = `${driver.name} ${driver.phone}`.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || driver.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [driversState, search, statusFilter]);

  const dateSchedules = useMemo(() => schedules.filter((schedule) => schedule.date === selectedDate), [schedules, selectedDate]);
  const shuttles = useMemo(() => getShuttles(), [assignmentTarget, driversState]);
  const bookings = useMemo(() => getBookings(), [driversState]);

  const stats = useMemo(() => ({
    total: driversState.length,
    available: driversState.filter((driver) => driver.status === 'available').length,
    onTrip: driversState.filter((driver) => driver.status === 'on-trip').length,
    offDuty: driversState.filter((driver) => driver.status === 'off-duty').length,
  }), [driversState]);

  const getDriverSchedule = (driverId: string) => dateSchedules.find((schedule) => schedule.driverId === driverId);

  function persistSchedules(next: DriverSchedule[]) {
    setSchedules(next);
    saveSchedules(next);
  }

  function validateSchedule(form: ScheduleForm): string | null {
    if (!form.driverId || !form.date || !form.startTime || !form.endTime) return 'Complete all required schedule fields.';
    if (minutes(form.endTime) <= minutes(form.startTime)) return 'End duty must be later than start duty.';

    if ((form.breakStart && !form.breakEnd) || (!form.breakStart && form.breakEnd)) {
      return 'Enter both break start and break end, or leave both empty.';
    }

    if (form.breakStart && form.breakEnd) {
      if (minutes(form.breakEnd) <= minutes(form.breakStart)) return 'Break end must be later than break start.';
      if (minutes(form.breakStart) < minutes(form.startTime) || minutes(form.breakEnd) > minutes(form.endTime)) {
        return 'Break must be inside the driver duty period.';
      }
    }

    const existing = schedules.filter((item) => item.driverId === form.driverId && item.date === form.date && item.id !== form.id);
    if (existing.some((item) => overlaps(minutes(form.startTime), minutes(form.endTime), minutes(item.startTime), minutes(item.endTime)))) {
      return 'This driver already has an overlapping duty schedule.';
    }

    return null;
  }

  function saveSchedule() {
    if (!scheduleForm) return;
    const error = validateSchedule(scheduleForm);
    if (error) {
      toast(error, 'error');
      return;
    }

    const breakItems: DriverBreak[] = scheduleForm.breakStart && scheduleForm.breakEnd
      ? [{ id: scheduleForm.id ? `break-${scheduleForm.id}` : `break-${Date.now()}`, startTime: scheduleForm.breakStart, endTime: scheduleForm.breakEnd }]
      : [];

    const nextSchedule: DriverSchedule = {
      id: scheduleForm.id ?? `sch-${Date.now()}`,
      driverId: scheduleForm.driverId,
      date: scheduleForm.date,
      startTime: scheduleForm.startTime,
      endTime: scheduleForm.endTime,
      breaks: breakItems,
      notes: scheduleForm.notes.trim(),
    };

    persistSchedules(scheduleForm.id
      ? schedules.map((item) => item.id === scheduleForm.id ? nextSchedule : item)
      : [...schedules, nextSchedule]);
    setScheduleForm(null);
    toast('Driver schedule saved successfully.');
  }

  function addBreakToSchedule(schedule: DriverSchedule) {
    const nextStart = window.prompt('Break start time (HH:MM)', '12:00');
    if (!nextStart) return;
    const nextEnd = window.prompt('Break end time (HH:MM)', '13:00');
    if (!nextEnd) return;

    if (minutes(nextEnd) <= minutes(nextStart) || minutes(nextStart) < minutes(schedule.startTime) || minutes(nextEnd) > minutes(schedule.endTime)) {
      toast('Break must be inside the duty period and end after it starts.', 'error');
      return;
    }

    if (schedule.breaks.some((item) => overlaps(minutes(nextStart), minutes(nextEnd), minutes(item.startTime), minutes(item.endTime)))) {
      toast('This break overlaps an existing break.', 'error');
      return;
    }

    const next = { ...schedule, breaks: [...schedule.breaks, { id: `break-${Date.now()}`, startTime: nextStart, endTime: nextEnd }] };
    persistSchedules(schedules.map((item) => item.id === schedule.id ? next : item));
    toast('Break added to the driver schedule.');
  }

  function deleteBreak(schedule: DriverSchedule, breakId: string) {
    persistSchedules(schedules.map((item) => item.id === schedule.id ? { ...item, breaks: item.breaks.filter((br) => br.id !== breakId) } : item));
    toast('Break removed.');
  }

  function saveDriver() {
    if (!driverForm) return;
    if (!driverForm.name.trim() || !driverForm.phone.trim()) {
      toast('Driver name and phone are required.', 'error');
      return;
    }
    const rating = Number(driverForm.rating);
    if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
      toast('Rating must be between 0 and 5.', 'error');
      return;
    }

    const driver: Driver = {
      id: driverForm.id ?? `drv-${Date.now()}`,
      name: driverForm.name.trim(),
      phone: driverForm.phone.trim(),
      rating: Math.round(rating * 10) / 10,
      status: driverForm.status,
    };

    if (driverForm.id) {
      updateDriver(driver);
      setDriversState((items) => items.map((item) => item.id === driver.id ? driver : item));
    } else {
      addDriver(driver);
      setDriversState((items) => [...items, driver]);
    }
    setDriverForm(null);
    toast(driverForm.id ? 'Driver updated successfully.' : 'Driver added successfully.');
  }

  function confirmDeleteDriver() {
    if (!deleteTarget) return;
    const assigned = getShuttles().some((shuttle) => shuttle.driverId === deleteTarget.id);
    if (assigned) {
      toast('This driver is assigned to a shuttle. Reassign the shuttle before deleting.', 'error');
      setDeleteTarget(null);
      return;
    }
    removeDriver(deleteTarget.id);
    setDriversState((items) => items.filter((driver) => driver.id !== deleteTarget.id));
    setDeleteTarget(null);
    toast('Driver deleted successfully.');
  }

  function openAssignment(driver: Driver) {
    const available = shuttles.find((shuttle) => shuttle.driverId === driver.id);
    setAssignmentTarget(driver);
    setAssignmentShuttleId(available?.id ?? '');
  }

  function assignShuttle() {
    if (!assignmentTarget || !assignmentShuttleId) {
      toast('Select a shuttle to assign.', 'error');
      return;
    }
    const shuttle = shuttles.find((item) => item.id === assignmentShuttleId);
    if (!shuttle) return;

    if (assignmentTarget.status === 'off-duty') {
      toast('An off-duty driver cannot be assigned.', 'error');
      return;
    }

    const schedule = schedules.find((item) => item.driverId === assignmentTarget.id && item.date === selectedDate);
    if (!schedule || !scheduleCovers(schedule, to24Hour(shuttle.departureTime), to24Hour(shuttle.estimatedArrival))) {
      toast(`Driver ${assignmentTarget.name} does not have duty coverage for ${shuttle.departureTime}–${shuttle.estimatedArrival} on ${selectedDate}.`, 'error');
      return;
    }

    const tripStart = minutes(to24Hour(shuttle.departureTime));
    const tripEnd = minutes(to24Hour(shuttle.estimatedArrival));
    const breakConflict = schedule.breaks.some((br) => overlaps(tripStart, tripEnd, minutes(br.startTime), minutes(br.endTime)));
    if (breakConflict) {
      toast('The selected shuttle overlaps the driver break.', 'error');
      return;
    }

    const conflictingShuttle = shuttles.find((item) => {
      if (item.id === shuttle.id || item.driverId !== assignmentTarget.id) return false;
      return overlaps(tripStart, tripEnd, minutes(to24Hour(item.departureTime)), minutes(to24Hour(item.estimatedArrival)));
    });
    if (conflictingShuttle) {
      toast(`Driver already has an overlapping assignment on ${conflictingShuttle.shuttleId}.`, 'error');
      return;
    }

    setSaving(true);
    const success = assignDriverToShuttle(shuttle.id, assignmentTarget);
    setSaving(false);
    if (!success) {
      toast('Unable to assign driver.', 'error');
      return;
    }
    setAssignmentTarget(null);
    toast(`${assignmentTarget.name} assigned to ${shuttle.shuttleId}.`);
  }

  function editSchedule(driver: Driver) {
    const existing = getDriverSchedule(driver.id);
    if (existing) {
      const firstBreak = existing.breaks[0];
      setScheduleForm({
        id: existing.id,
        driverId: existing.driverId,
        date: existing.date,
        startTime: existing.startTime,
        endTime: existing.endTime,
        breakStart: firstBreak?.startTime ?? '',
        breakEnd: firstBreak?.endTime ?? '',
        notes: existing.notes ?? '',
      });
    } else {
      setScheduleForm(emptyScheduleForm(driver.id, selectedDate));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-primary-600">Operations</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">Driver Management</h1>
          <p className="mt-1 text-sm text-gray-500">Manage drivers, duty schedules, breaks and shuttle assignments.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setScheduleForm(emptyScheduleForm(driversState[0]?.id ?? '', selectedDate))}>
            <Clock3 className="h-4 w-4" /> Add Schedule
          </Button>
          <Button onClick={() => setDriverForm(emptyDriverForm())}>
            <UserPlus className="h-4 w-4" /> Add Driver
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Total Drivers', value: stats.total, icon: Users },
          { label: 'Available', value: stats.available, icon: CheckCircle2 },
          { label: 'On Trip', value: stats.onTrip, icon: CalendarDays },
          { label: 'Off Duty', value: stats.offDuty, icon: XCircle },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} padding="sm">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary-50 p-2.5 text-primary-600"><Icon className="h-5 w-5" /></div>
                <div><p className="text-xs text-gray-500">{item.label}</p><p className="text-xl font-bold text-gray-900">{item.value}</p></div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card padding="none">
        <CardHeader
          title="Driver availability timeline"
          subtitle="Daily duty coverage, breaks and assignment readiness"
          action={
            <div className="flex items-center gap-2">
              <Input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
            </div>
          }
        />
        <div className="overflow-x-auto scrollbar-thin">
          <div className="min-w-[980px] p-5">
            <div className="grid grid-cols-[210px_1fr] gap-4 border-b border-gray-100 pb-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">Driver</div>
              <div className="grid grid-cols-10 text-xs font-medium text-gray-400">
                {Array.from({ length: SLOT_COUNT }, (_, index) => <span key={index}>{formatHour(START_HOUR + index)}</span>)}
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {filteredDrivers.map((driver) => {
                const schedule = getDriverSchedule(driver.id);
                return (
                  <div key={driver.id} className="grid grid-cols-[210px_1fr] gap-4 py-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-semibold text-primary-700">{initials(driver.name)}</div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900">{driver.name}</p>
                          <Badge variant={statusVariant(driver.status)}>{statusLabel(driver.status)}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="relative h-12 rounded-lg bg-gray-50">
                      <div className="absolute inset-0 grid grid-cols-10">
                        {Array.from({ length: SLOT_COUNT }, (_, index) => <span key={index} className="border-l border-gray-100 first:border-l-0" />)}
                      </div>
                      {schedule ? (
                        <>
                          <ScheduleBar schedule={schedule} />
                          {schedule.breaks.map((br) => <BreakBar key={br.id} breakItem={br} schedule={schedule} />)}
                        </>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">No duty scheduled</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-gray-100 pt-4 text-xs text-gray-500">
              <Legend className="bg-primary-100" label="Duty" />
              <Legend className="bg-warning-100" label="Break" />
              <Legend className="bg-gray-200" label="Unavailable" />
            </div>
          </div>
        </div>
      </Card>

      <Card padding="none">
        <CardHeader
          title="Driver directory"
          subtitle="Search, edit and assign drivers"
          action={<div className="flex flex-wrap gap-2"><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search driver..." icon={<Search className="h-4 w-4" />} /><Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} options={[{ value: 'all', label: 'All statuses' }, { value: 'available', label: 'Available' }, { value: 'on-trip', label: 'On Trip' }, { value: 'off-duty', label: 'Off Duty' }]} /></div>}
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead><tr className="border-b border-gray-100 bg-gray-50/80 text-xs font-semibold uppercase tracking-wide text-gray-500">
              {['Driver', 'Phone', 'Status', 'Rating', 'Duty', 'Assigned Shuttle', 'Actions'].map((heading) => <th key={heading} className="px-5 py-3">{heading}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDrivers.map((driver) => {
                const schedule = getDriverSchedule(driver.id);
                const assigned = getShuttles().filter((shuttle) => shuttle.driverId === driver.id);
                return (
                  <tr key={driver.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-xs font-semibold text-primary-700">{initials(driver.name)}</div><div><p className="font-semibold text-gray-900">{driver.name}</p><p className="text-xs text-gray-500">{driver.id}</p></div></div></td>
                    <td className="px-5 py-4 text-sm text-gray-600">{driver.phone}</td>
                    <td className="px-5 py-4"><Badge variant={statusVariant(driver.status)}>{statusLabel(driver.status)}</Badge></td>
                    <td className="px-5 py-4 text-sm font-medium text-gray-700">★ {driver.rating.toFixed(1)}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{schedule ? `${timeLabel(schedule.startTime)} – ${timeLabel(schedule.endTime)}` : 'Not scheduled'}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{assigned.length ? assigned.map((shuttle) => shuttle.shuttleId).join(', ') : 'Unassigned'}</td>
                    <td className="px-5 py-4"><div className="flex items-center gap-1">
                      <button onClick={() => setViewDriver(driver)} className="rounded-lg p-2 text-gray-400 hover:bg-primary-50 hover:text-primary-600" title="View"><MoreHorizontal className="h-4 w-4" /></button>
                      <button onClick={() => setDriverForm({ id: driver.id, name: driver.name, phone: driver.phone, rating: String(driver.rating), status: driver.status })} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700" title="Edit"><Edit3 className="h-4 w-4" /></button>
                      <button onClick={() => editSchedule(driver)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700" title="Schedule"><Clock3 className="h-4 w-4" /></button>
                      <button onClick={() => openAssignment(driver)} className="rounded-lg p-2 text-gray-400 hover:bg-primary-50 hover:text-primary-600" title="Assign shuttle"><CalendarDays className="h-4 w-4" /></button>
                      <button onClick={() => setDeleteTarget(driver)} className="rounded-lg p-2 text-gray-400 hover:bg-error-50 hover:text-error-600" title="Delete"><Trash2 className="h-4 w-4" /></button>
                    </div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!filteredDrivers.length && <div className="p-10 text-center text-sm text-gray-500">No drivers match your search or status filter.</div>}
        </div>
      </Card>

      <Card padding="none">
        <CardHeader title="Scheduled breaks" subtitle={`Breaks for ${selectedDate}`} />
        <div className="divide-y divide-gray-100">
          {dateSchedules.flatMap((schedule) => schedule.breaks.map((br) => ({ schedule, br }))).map(({ schedule, br }) => {
            const driver = driversState.find((item) => item.id === schedule.driverId);
            return <div key={br.id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4"><div><p className="font-medium text-gray-900">{driver?.name ?? schedule.driverId}</p><p className="text-sm text-gray-500">{timeLabel(br.startTime)} – {timeLabel(br.endTime)} · Duty {timeLabel(schedule.startTime)} – {timeLabel(schedule.endTime)}</p></div><Button size="sm" variant="ghost" onClick={() => deleteBreak(schedule, br.id)}><X className="h-4 w-4" /> Remove</Button></div>;
          })}
          {!dateSchedules.some((schedule) => schedule.breaks.length) && <div className="p-8 text-center text-sm text-gray-500">No breaks scheduled for this date.</div>}
        </div>
      </Card>

      <Drawer open={!!viewDriver} onClose={() => setViewDriver(null)} title={viewDriver ? viewDriver.name : undefined} width="max-w-lg">
        {viewDriver && <DriverDrawer driver={viewDriver} schedule={getDriverSchedule(viewDriver.id)} assigned={getShuttles().filter((shuttle) => shuttle.driverId === viewDriver.id)} bookings={bookings.filter((booking) => booking.driverName === viewDriver.name)} onEdit={() => { setDriverForm({ id: viewDriver.id, name: viewDriver.name, phone: viewDriver.phone, rating: String(viewDriver.rating), status: viewDriver.status }); setViewDriver(null); }} onSchedule={() => { editSchedule(viewDriver); setViewDriver(null); }} onAssign={() => { openAssignment(viewDriver); setViewDriver(null); }} />}
      </Drawer>

      <Modal open={!!driverForm} onClose={() => setDriverForm(null)} title={driverForm?.id ? 'Edit Driver' : 'Add Driver'} footer={<><Button variant="outline" onClick={() => setDriverForm(null)}>Cancel</Button><Button onClick={saveDriver}>Save Driver</Button></>}>
        {driverForm && <div className="space-y-4">
          <Input label="Driver Name" value={driverForm.name} onChange={(event) => setDriverForm({ ...driverForm, name: event.target.value })} placeholder="e.g. Raj Kumar" required />
          <Input label="Phone" value={driverForm.phone} onChange={(event) => setDriverForm({ ...driverForm, phone: event.target.value })} placeholder="+91 98765 43210" required />
          <div className="grid grid-cols-2 gap-4"><Input label="Rating" type="number" min="0" max="5" step="0.1" value={driverForm.rating} onChange={(event) => setDriverForm({ ...driverForm, rating: event.target.value })} /><Select label="Status" value={driverForm.status} onChange={(event) => setDriverForm({ ...driverForm, status: event.target.value as Driver['status'] })} options={[{ value: 'available', label: 'Available' }, { value: 'on-trip', label: 'On Trip' }, { value: 'off-duty', label: 'Off Duty' }]} /></div>
        </div>}
      </Modal>

      <Modal open={!!scheduleForm} onClose={() => setScheduleForm(null)} title={scheduleForm?.id ? 'Edit Duty Schedule' : 'Add Duty Schedule'} size="md" footer={<><Button variant="outline" onClick={() => setScheduleForm(null)}>Cancel</Button><Button onClick={saveSchedule}>Save Schedule</Button></>}>
        {scheduleForm && <div className="space-y-4">
          <Select label="Driver" value={scheduleForm.driverId} onChange={(event) => setScheduleForm({ ...scheduleForm, driverId: event.target.value })} options={driversState.map((driver) => ({ value: driver.id, label: driver.name }))} />
          <Input label="Date" type="date" value={scheduleForm.date} onChange={(event) => setScheduleForm({ ...scheduleForm, date: event.target.value })} />
          <div className="grid grid-cols-2 gap-4"><Input label="Start Duty" type="time" value={scheduleForm.startTime} onChange={(event) => setScheduleForm({ ...scheduleForm, startTime: event.target.value })} /><Input label="End Duty" type="time" value={scheduleForm.endTime} onChange={(event) => setScheduleForm({ ...scheduleForm, endTime: event.target.value })} /></div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4"><p className="mb-3 text-sm font-semibold text-gray-900">Break (optional)</p><div className="grid grid-cols-2 gap-4"><Input label="Break Start" type="time" value={scheduleForm.breakStart} onChange={(event) => setScheduleForm({ ...scheduleForm, breakStart: event.target.value })} /><Input label="Break End" type="time" value={scheduleForm.breakEnd} onChange={(event) => setScheduleForm({ ...scheduleForm, breakEnd: event.target.value })} /></div></div>
          <Input label="Notes" value={scheduleForm.notes} onChange={(event) => setScheduleForm({ ...scheduleForm, notes: event.target.value })} placeholder="Optional schedule note" />
        </div>}
      </Modal>

      <Modal open={!!assignmentTarget} onClose={() => setAssignmentTarget(null)} title="Assign Driver to Shuttle" footer={<><Button variant="outline" onClick={() => setAssignmentTarget(null)}>Cancel</Button><Button onClick={assignShuttle} loading={saving}>Assign Driver</Button></>}>
        {assignmentTarget && <div className="space-y-4">
          <div className="rounded-xl bg-gray-50 p-4"><p className="text-xs uppercase tracking-wide text-gray-400">Driver</p><p className="mt-1 font-semibold text-gray-900">{assignmentTarget.name}</p><p className="mt-1 text-sm text-gray-500">{statusLabel(assignmentTarget.status)} · {selectedDate}</p></div>
          <Select label="Shuttle" value={assignmentShuttleId} onChange={(event) => setAssignmentShuttleId(event.target.value)} options={[{ value: '', label: 'Select shuttle' }, ...shuttles.map((shuttle) => ({ value: shuttle.id, label: `${shuttle.shuttleId} · ${shuttle.departureTime} · ${shuttle.routeName}` }))]} />
          <p className="text-xs text-gray-500">The driver must be on duty for the complete trip, cannot overlap a break or another shuttle assignment, and cannot be off duty.</p>
        </div>}
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={confirmDeleteDriver} title="Delete Driver" message={`Are you sure you want to delete ${deleteTarget?.name ?? 'this driver'}? Driver schedules will also be removed.`} confirmLabel="Delete Driver" danger />
    </div>
  );
}

function ScheduleBar({ schedule }: { schedule: DriverSchedule }) {
  const left = Math.max(0, ((minutes(schedule.startTime) - START_HOUR * 60) / (SLOT_COUNT * 60)) * 100);
  const right = Math.min(100, ((minutes(schedule.endTime) - START_HOUR * 60) / (SLOT_COUNT * 60)) * 100);
  const width = Math.max(1, right - left);
  return <div className="absolute top-2 h-8 rounded-md bg-primary-100 px-2 text-xs font-medium text-primary-800 shadow-sm" style={{ left: `${left}%`, width: `${width}%` }}><div className="flex h-full items-center truncate">Duty · {timeLabel(schedule.startTime)}–{timeLabel(schedule.endTime)}</div></div>;
}

function BreakBar({ breakItem, schedule }: { breakItem: DriverBreak; schedule: DriverSchedule }) {
  const left = Math.max(0, ((minutes(breakItem.startTime) - START_HOUR * 60) / (SLOT_COUNT * 60)) * 100);
  const right = Math.min(100, ((minutes(breakItem.endTime) - START_HOUR * 60) / (SLOT_COUNT * 60)) * 100);
  const width = Math.max(1, right - left);
  return <div className="absolute top-2 z-10 h-8 rounded-md bg-warning-100 px-2 text-xs font-medium text-warning-800 ring-1 ring-white" style={{ left: `${left}%`, width: `${width}%` }}>Break</div>;
}

function Legend({ className, label }: { className: string; label: string }) {
  return <span className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${className}`} />{label}</span>;
}

function DriverDrawer({ driver, schedule, assigned, bookings, onEdit, onSchedule, onAssign }: { driver: Driver; schedule?: DriverSchedule; assigned: Shuttle[]; bookings: ReturnType<typeof getBookings>; onEdit: () => void; onSchedule: () => void; onAssign: () => void }) {
  return <div className="space-y-6">
    <div className="flex items-center gap-4"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-lg font-bold text-primary-700">{initials(driver.name)}</div><div><h3 className="text-xl font-bold text-gray-900">{driver.name}</h3><Badge variant={statusVariant(driver.status)}>{statusLabel(driver.status)}</Badge></div></div>
    <div className="grid grid-cols-2 gap-4 text-sm"><InfoItem label="Phone" value={driver.phone} /><InfoItem label="Rating" value={`★ ${driver.rating.toFixed(1)}`} /><InfoItem label="Duty" value={schedule ? `${timeLabel(schedule.startTime)} – ${timeLabel(schedule.endTime)}` : 'Not scheduled'} /><InfoItem label="Today's breaks" value={schedule ? String(schedule.breaks.length) : '0'} /></div>
    <div><p className="mb-2 text-sm font-semibold text-gray-900">Assigned shuttles</p>{assigned.length ? <div className="space-y-2">{assigned.map((shuttle) => <div key={shuttle.id} className="rounded-lg border border-gray-100 p-3"><p className="font-medium text-gray-900">{shuttle.shuttleId} · {shuttle.routeName}</p><p className="text-xs text-gray-500">{shuttle.departureTime} · {shuttle.pickup} → {shuttle.destination}</p></div>)}</div> : <p className="text-sm text-gray-500">No shuttles currently assigned.</p>}</div>
    <div><p className="mb-2 text-sm font-semibold text-gray-900">Recent bookings</p>{bookings.length ? <div className="space-y-2">{bookings.slice(0, 5).map((booking) => <div key={booking.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3"><div><p className="text-sm font-medium text-gray-900">{booking.bookingId}</p><p className="text-xs text-gray-500">{booking.studentName} · {booking.date}</p></div><Badge variant={booking.status === 'completed' ? 'success' : booking.status === 'cancelled' ? 'error' : 'primary'}>{booking.status}</Badge></div>)}</div> : <p className="text-sm text-gray-500">No bookings found for this driver.</p>}</div>
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3"><Button variant="outline" onClick={onEdit}><Edit3 className="h-4 w-4" /> Edit</Button><Button variant="outline" onClick={onSchedule}><Clock3 className="h-4 w-4" /> Schedule</Button><Button onClick={onAssign}><CalendarDays className="h-4 w-4" /> Assign</Button></div>
  </div>;
}

function InfoItem({ label, value }: { label: string; value: string }) { return <div className="rounded-lg bg-gray-50 p-3"><p className="text-xs text-gray-400">{label}</p><p className="mt-1 font-medium text-gray-900">{value}</p></div>; }
function initials(name: string) { return name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase(); }
function formatHour(hour: number) { const period = hour >= 12 ? 'PM' : 'AM'; const h = hour % 12 || 12; return `${h} ${period}`; }
function to24Hour(value: string) {
  const match = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return value;
  let hour = Number(match[1]);
  if (match[3].toUpperCase() === 'PM' && hour !== 12) hour += 12;
  if (match[3].toUpperCase() === 'AM' && hour === 12) hour = 0;
  return `${String(hour).padStart(2, '0')}:${match[2]}`;
}
=======
import { Users } from 'lucide-react';
import { PagePlaceholder } from '@/components/common/PagePlaceholder';

export function AdminDriversPage() {
  return (
    <PagePlaceholder
      title="Drivers"
      description="Manage shuttle drivers and their assignments"
      icon={<Users className="h-9 w-9" />}
    />
  );
}
>>>>>>> 5659604fc572f48fdc5ffb0a48e7a78db09dad67
