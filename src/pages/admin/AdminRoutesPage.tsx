<<<<<<< HEAD
import { useMemo, useState } from 'react';
import {
  Edit3,
  MapPin,
  MoreHorizontal,
  Plus,
  Route as RouteIcon,
  Search,
  Trash2,
  UserCheck,
} from 'lucide-react';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Drawer } from '@/components/ui/Drawer';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/hooks/useToast';
import { getDrivers } from '@/services/driverService';
import { addRoute, assignDriverToRoute, deleteRoute, getRoutes, updateRoute } from '@/services/routeService';
import type { Driver, ShuttleRoute } from '@/types';

type RouteForm = {
  id?: string;
  name: string;
  stops: string;
  distanceKm: string;
  estimatedDuration: string;
  operatingStart: string;
  operatingEnd: string;
  status: 'active' | 'inactive';
};

function emptyForm(): RouteForm {
  return {
    name: '',
    stops: '',
    distanceKm: '3.0',
    estimatedDuration: '20',
    operatingStart: '08:00',
    operatingEnd: '18:00',
    status: 'active',
  };
}

function statusVariant(status: ShuttleRoute['status']): BadgeVariant {
  return status === 'active' ? 'success' : 'neutral';
}

export function AdminRoutesPage() {
  const { toast } = useToast();
  const [routesState, setRoutesState] = useState<ShuttleRoute[]>(() => getRoutes());
  const [drivers] = useState<Driver[]>(() => getDrivers());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [form, setForm] = useState<RouteForm | null>(null);
  const [viewRoute, setViewRoute] = useState<ShuttleRoute | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ShuttleRoute | null>(null);
  const [assignmentTarget, setAssignmentTarget] = useState<ShuttleRoute | null>(null);
  const [driverId, setDriverId] = useState('');
  const [assignmentDate, setAssignmentDate] = useState(() => new Date().toISOString().slice(0, 10));

  const filteredRoutes = useMemo(() => routesState.filter((route) => {
    const haystack = `${route.id} ${route.name} ${route.stops.join(' ')}`.toLowerCase();
    const matchesSearch = haystack.includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (route.status ?? 'active') === statusFilter;
    return matchesSearch && matchesStatus;
  }), [routesState, search, statusFilter]);

  function openCreate() {
    setForm(emptyForm());
  }

  function openEdit(route: ShuttleRoute) {
    setForm({
      id: route.id,
      name: route.name,
      stops: route.stops.join(', '),
      distanceKm: String(route.distanceKm ?? ''),
      estimatedDuration: String(route.estimatedDuration),
      operatingStart: route.operatingStart ?? '08:00',
      operatingEnd: route.operatingEnd ?? '18:00',
      status: route.status ?? 'active',
    });
  }

  function saveRoute() {
    if (!form) return;
    const stops = form.stops.split(',').map((stop) => stop.trim()).filter(Boolean);
    const distanceKm = Number(form.distanceKm);
    const estimatedDuration = Number(form.estimatedDuration);

    if (!form.name.trim()) return toast('Route name is required.', 'error');
    if (stops.length < 2) return toast('Add at least two pickup/drop-off points.', 'error');
    if (!Number.isFinite(distanceKm) || distanceKm <= 0) return toast('Distance must be greater than 0.', 'error');
    if (!Number.isFinite(estimatedDuration) || estimatedDuration <= 0) return toast('Estimated duration must be greater than 0.', 'error');
    if (form.operatingEnd <= form.operatingStart) return toast('Operating end time must be later than start time.', 'error');

    const duplicate = routesState.some((route) => route.name.toLowerCase() === form.name.trim().toLowerCase() && route.id !== form.id);
    if (duplicate) return toast('A route with this name already exists.', 'error');

    const next: ShuttleRoute = {
      id: form.id ?? `rt-${String(Date.now()).slice(-6)}`,
      name: form.name.trim(),
      stops,
      distanceKm: Math.round(distanceKm * 10) / 10,
      estimatedDuration,
      operatingStart: form.operatingStart,
      operatingEnd: form.operatingEnd,
      status: form.status,
      assignedDriverId: form.id ? routesState.find((route) => route.id === form.id)?.assignedDriverId : undefined,
      assignedDriverName: form.id ? routesState.find((route) => route.id === form.id)?.assignedDriverName : undefined,
    };

    if (form.id) {
      updateRoute(next);
      setRoutesState((items) => items.map((route) => route.id === next.id ? next : route));
      toast('Route updated successfully.');
    } else {
      addRoute(next);
      setRoutesState((items) => [...items, next]);
      toast('Route created successfully.');
    }
    setForm(null);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    const result = deleteRoute(deleteTarget.id);
    if (!result.success) {
      toast(result.reason ?? 'Unable to delete route.', 'error');
      setDeleteTarget(null);
      return;
    }
    setRoutesState((items) => items.filter((route) => route.id !== deleteTarget.id));
    setDeleteTarget(null);
    toast('Route deleted successfully.');
  }

  function openAssignment(route: ShuttleRoute) {
    setAssignmentTarget(route);
    setDriverId(route.assignedDriverId ?? '');
    setAssignmentDate(new Date().toISOString().slice(0, 10));
  }

  function saveAssignment() {
    if (!assignmentTarget) return;
    const driver = drivers.find((item) => item.id === driverId) ?? null;
    const result = assignDriverToRoute(assignmentTarget.id, driver, assignmentDate);
    if (!result.success) {
      toast(result.reason ?? 'Unable to assign driver.', 'error');
      return;
    }
    setRoutesState(getRoutes());
    setAssignmentTarget(null);
    toast(driver ? `${driver.name} assigned to ${assignmentTarget.name}.` : `Driver removed from ${assignmentTarget.name}.`);
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Route Management</h2>
          <p className="mt-1 text-sm text-gray-500">Define campus routes, stops, operating hours and driver assignments.</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> Add Route</Button>
      </div>

      <Card padding="md" className="mb-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search route, ID or stop..." icon={<Search className="h-4 w-4" />} />
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={[{ value: 'all', label: 'All Statuses' }, { value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
        </div>
      </Card>

      <Card padding="none">
        <CardHeader title="Campus Routes" subtitle={`${filteredRoutes.length} route${filteredRoutes.length === 1 ? '' : 's'} configured`} />
        {filteredRoutes.length === 0 ? (
          <EmptyState icon={<RouteIcon className="h-8 w-8" />} title="No routes found" description="Try a different search or create a new route." action={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Add Route</Button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="border-b border-gray-200">
                  {['Route', 'Stops', 'Duration', 'Distance', 'Operating Hours', 'Driver', 'Status', 'Actions'].map((heading) => (
                    <th key={heading} className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRoutes.map((route) => (
                  <tr key={route.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4"><p className="font-semibold text-gray-900">{route.name}</p><p className="mt-0.5 text-xs text-gray-400">{route.id}</p></td>
                    <td className="px-4 py-4"><div className="flex max-w-xs flex-wrap gap-1.5">{route.stops.map((stop, i) => <Badge key={`${route.id}-${stop}-${i}`} variant="neutral"><MapPin className="h-3 w-3" />{stop}</Badge>)}</div></td>
                    <td className="px-4 py-4 text-sm text-gray-700">{route.estimatedDuration} min</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{route.distanceKm ?? '—'} km</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{route.operatingStart ?? '—'} – {route.operatingEnd ?? '—'}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{route.assignedDriverName ?? 'Unassigned'}</td>
                    <td className="px-4 py-4"><Badge variant={statusVariant(route.status)}>{route.status === 'active' ? 'Active' : 'Inactive'}</Badge></td>
                    <td className="px-4 py-4"><div className="flex items-center gap-1">
                      <button title="View" onClick={() => setViewRoute(route)} className="rounded-lg p-1.5 text-gray-400 hover:bg-primary-50 hover:text-primary-600"><MoreHorizontal className="h-4 w-4" /></button>
                      <button title="Edit" onClick={() => openEdit(route)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"><Edit3 className="h-4 w-4" /></button>
                      <button title="Assign driver" onClick={() => openAssignment(route)} className="rounded-lg p-1.5 text-gray-400 hover:bg-primary-50 hover:text-primary-600"><UserCheck className="h-4 w-4" /></button>
                      <button title="Delete" onClick={() => setDeleteTarget(route)} className="rounded-lg p-1.5 text-gray-400 hover:bg-error-50 hover:text-error-600"><Trash2 className="h-4 w-4" /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Drawer open={!!viewRoute} onClose={() => setViewRoute(null)} title={viewRoute?.name} width="max-w-lg">
        {viewRoute && <div className="space-y-6">
          <div className="flex items-start justify-between"><div><p className="text-xs uppercase tracking-wide text-gray-400">Route ID</p><p className="mt-1 font-semibold text-gray-900">{viewRoute.id}</p></div><Badge variant={statusVariant(viewRoute.status)}>{viewRoute.status === 'active' ? 'Active' : 'Inactive'}</Badge></div>
          <div><p className="mb-2 text-sm font-semibold text-gray-900">Stops</p><div className="space-y-2">{viewRoute.stops.map((stop, i) => <div key={stop} className="flex items-center gap-3 text-sm text-gray-700"><div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-50 text-xs font-semibold text-primary-600">{i + 1}</div>{stop}</div>)}</div></div>
          <div className="grid grid-cols-2 gap-4 text-sm"><div><p className="text-gray-400">Distance</p><p className="mt-1 font-medium">{viewRoute.distanceKm ?? '—'} km</p></div><div><p className="text-gray-400">Duration</p><p className="mt-1 font-medium">{viewRoute.estimatedDuration} min</p></div><div><p className="text-gray-400">Operating hours</p><p className="mt-1 font-medium">{viewRoute.operatingStart} – {viewRoute.operatingEnd}</p></div><div><p className="text-gray-400">Assigned driver</p><p className="mt-1 font-medium">{viewRoute.assignedDriverName ?? 'Unassigned'}</p></div></div>
          <div className="flex gap-2"><Button className="flex-1" onClick={() => { openEdit(viewRoute); setViewRoute(null); }}><Edit3 className="h-4 w-4" /> Edit</Button><Button variant="outline" className="flex-1" onClick={() => { openAssignment(viewRoute); setViewRoute(null); }}><UserCheck className="h-4 w-4" /> Assign Driver</Button></div>
        </div>}
      </Drawer>

      <Modal open={!!form} onClose={() => setForm(null)} title={form?.id ? 'Edit Route' : 'Add Route'} size="lg" footer={<><Button variant="outline" onClick={() => setForm(null)}>Cancel</Button><Button onClick={saveRoute}>{form?.id ? 'Save Changes' : 'Create Route'}</Button></>}>
        {form && <div className="space-y-5">
          <Input label="Route Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Central Campus Loop" />
          <Input label="Pickup / Drop-off Points" value={form.stops} onChange={(e) => setForm({ ...form, stops: e.target.value })} placeholder="Main Gate, Library, Hostel" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><Input label="Distance (km)" type="number" min="0.1" step="0.1" value={form.distanceKm} onChange={(e) => setForm({ ...form, distanceKm: e.target.value })} /><Input label="Estimated Duration (minutes)" type="number" min="1" value={form.estimatedDuration} onChange={(e) => setForm({ ...form, estimatedDuration: e.target.value })} /></div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3"><Input label="Operating Start" type="time" value={form.operatingStart} onChange={(e) => setForm({ ...form, operatingStart: e.target.value })} /><Input label="Operating End" type="time" value={form.operatingEnd} onChange={(e) => setForm({ ...form, operatingEnd: e.target.value })} /><Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as 'active' | 'inactive' })} options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} /></div>
        </div>}
      </Modal>

      <Modal open={!!assignmentTarget} onClose={() => setAssignmentTarget(null)} title="Assign Driver" size="sm" footer={<><Button variant="outline" onClick={() => setAssignmentTarget(null)}>Cancel</Button><Button onClick={saveAssignment}>Save Assignment</Button></>}>
        {assignmentTarget && <div className="space-y-4"><div className="rounded-lg bg-gray-50 p-4"><p className="text-xs text-gray-400">Route</p><p className="mt-1 font-semibold text-gray-900">{assignmentTarget.name}</p><p className="mt-1 text-sm text-gray-500">{assignmentTarget.operatingStart} – {assignmentTarget.operatingEnd}</p></div><Input label="Assignment Date" type="date" value={assignmentDate} onChange={(e) => setAssignmentDate(e.target.value)} />
          <Select label="Driver" value={driverId} onChange={(e) => setDriverId(e.target.value)} options={[{ value: '', label: 'Unassigned' }, ...drivers.map((driver) => ({ value: driver.id, label: `${driver.name} · ${driver.status === 'off-duty' ? 'Off duty' : driver.status === 'on-trip' ? 'On trip' : 'Available'}` }))]} /><p className="text-xs text-gray-400">The selected driver must have a duty schedule covering the route operating hours on the assignment date. Off-duty drivers cannot be assigned. Assignment updates shuttle and booking driver information for this route.</p></div>}
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete} title="Delete route?" message={`Delete ${deleteTarget?.name ?? 'this route'}? This action cannot be undone.`} confirmLabel="Delete Route" danger />
    </div>
=======
import { Route } from 'lucide-react';
import { PagePlaceholder } from '@/components/common/PagePlaceholder';

export function AdminRoutesPage() {
  return (
    <PagePlaceholder
      title="Routes"
      description="Manage shuttle routes and schedules"
      icon={<Route className="h-9 w-9" />}
    />
>>>>>>> 5659604fc572f48fdc5ffb0a48e7a78db09dad67
  );
}
