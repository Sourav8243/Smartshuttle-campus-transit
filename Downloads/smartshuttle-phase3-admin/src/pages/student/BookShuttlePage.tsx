import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bus, Clock, MapPin, Users, User as UserIcon, Hash, Calendar, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/useToast';
import { getShuttles, createBooking } from '@/services/bookingService';
import { locationOptions } from '@/data/locations';
import type { Shuttle } from '@/types';

type Step = 'search' | 'results' | 'confirm';

export function BookShuttlePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('search');
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchResults, setSearchResults] = useState<Shuttle[]>([]);
  const [selectedShuttle, setSelectedShuttle] = useState<Shuttle | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [booking, setBooking] = useState(false);
  const [successBookingId, setSuccessBookingId] = useState<string | null>(null);

  const today = useMemo(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  }, []);

  function validateSearch(): boolean {
    const errs: Record<string, string> = {};
    if (!pickup) errs.pickup = 'Pickup point is required';
    if (!destination) errs.destination = 'Destination is required';
    if (!date) errs.date = 'Date is required';
    if (!time) errs.time = 'Time is required';
    if (pickup && destination && pickup === destination) {
      errs.destination = 'Pickup and destination cannot be the same';
    }
    if (date && time) {
      const selectedDateTime = new Date(`${date}T${time}`);
      const now = new Date();
      if (selectedDateTime < now) {
        errs.time = 'Cannot select a past date and time';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSearch() {
    if (!validateSearch()) return;
    const allShuttles = getShuttles();
    const results = allShuttles.filter(
      (s) =>
        s.pickup === pickup &&
        s.destination === destination &&
        s.status !== 'departed'
    );
    setSearchResults(results);
    setStep('results');
  }

  function handleSelectShuttle(shuttle: Shuttle) {
    if (shuttle.availableSeats === 0) {
      toast('This shuttle is fully booked', 'error');
      return;
    }
    setSelectedShuttle(shuttle);
    setConfirmOpen(true);
  }

  function handleConfirmBooking() {
    if (!selectedShuttle || !user) return;
    setBooking(true);
    setTimeout(() => {
      const booking = createBooking(user.id, user.name, selectedShuttle, date, time);
      setBooking(false);
      setConfirmOpen(false);
      setSuccessBookingId(booking.bookingId);
      toast(`Booking confirmed! Your booking ID is ${booking.bookingId}`, 'success');
    }, 600);
  }

  function resetForm() {
    setPickup('');
    setDestination('');
    setDate('');
    setTime('');
    setErrors({});
    setStep('search');
    setSearchResults([]);
    setSelectedShuttle(null);
    setSuccessBookingId(null);
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Book a Shuttle</h2>
        <p className="mt-1 text-sm text-gray-500">Search available shuttles and book your ride</p>
      </div>

      {/* Success modal */}
      <Modal
        open={!!successBookingId}
        onClose={() => {
          setSuccessBookingId(null);
          navigate('/student/bookings');
        }}
        size="sm"
      >
        <div className="text-center py-2">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success-50">
            <CheckCircle2 className="h-8 w-8 text-success-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Booking Confirmed!</h3>
          <p className="mt-1 text-sm text-gray-500">Your shuttle has been booked successfully.</p>
          <div className="mt-4 rounded-lg bg-gray-50 px-4 py-3">
            <p className="text-xs text-gray-400">Booking ID</p>
            <p className="text-lg font-bold text-primary-700">{successBookingId}</p>
          </div>
          <div className="mt-6 flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => { setSuccessBookingId(null); resetForm(); }}>
              Book Another
            </Button>
            <Button className="flex-1" onClick={() => { setSuccessBookingId(null); navigate('/student/bookings'); }}>
              View Bookings
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirm booking modal */}
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirm Booking"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={booking}>Cancel</Button>
            <Button onClick={handleConfirmBooking} loading={booking}>Confirm Booking</Button>
          </>
        }
      >
        {selectedShuttle && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-lg bg-primary-50 px-4 py-3">
              <MapPin className="h-5 w-5 text-primary-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{selectedShuttle.pickup}</p>
                <ArrowRight className="h-3 w-3 text-gray-400 my-1" />
                <p className="text-sm font-medium text-gray-900">{selectedShuttle.destination}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-400">Shuttle</p>
                <p className="font-medium text-gray-900">{selectedShuttle.shuttleId}</p>
              </div>
              <div>
                <p className="text-gray-400">Route</p>
                <p className="font-medium text-gray-900">{selectedShuttle.routeName}</p>
              </div>
              <div>
                <p className="text-gray-400">Date</p>
                <p className="font-medium text-gray-900">{date}</p>
              </div>
              <div>
                <p className="text-gray-400">Departure</p>
                <p className="font-medium text-gray-900">{selectedShuttle.departureTime}</p>
              </div>
              <div>
                <p className="text-gray-400">Driver</p>
                <p className="font-medium text-gray-900">{selectedShuttle.driverName}</p>
              </div>
              <div>
                <p className="text-gray-400">Vehicle</p>
                <p className="font-medium text-gray-900">{selectedShuttle.vehicleNumber}</p>
              </div>
            </div>
            <div className="rounded-lg bg-gray-50 px-4 py-2.5 text-sm">
              <span className="text-gray-400">Estimated arrival: </span>
              <span className="font-medium text-gray-900">{selectedShuttle.estimatedArrival}</span>
            </div>
          </div>
        )}
      </Modal>

      {/* Step indicator */}
      <div className="mb-6 flex items-center gap-2">
        {[
          { key: 'search', label: 'Search' },
          { key: 'results', label: 'Select Shuttle' },
          { key: 'confirm', label: 'Confirm' },
        ].map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                step === s.key || (step === 'results' && s.key === 'search')
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {i + 1}
            </div>
            <span className={`text-sm font-medium ${step === s.key ? 'text-gray-900' : 'text-gray-400'}`}>
              {s.label}
            </span>
            {i < 2 && <div className="w-8 h-px bg-gray-200" />}
          </div>
        ))}
      </div>

      {/* Search form */}
      {step === 'search' && (
        <Card padding="lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Select
              label="Pickup Point"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              options={[{ value: '', label: 'Select pickup point' }, ...locationOptions]}
              error={errors.pickup}
            />
            <Select
              label="Destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              options={[{ value: '', label: 'Select destination' }, ...locationOptions]}
              error={errors.destination}
            />
            <Input
              label="Date"
              type="date"
              value={date}
              min={today}
              onChange={(e) => setDate(e.target.value)}
              icon={<Calendar className="h-4 w-4" />}
              error={errors.date}
            />
            <Input
              label="Time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              icon={<Clock className="h-4 w-4" />}
              error={errors.time}
            />
          </div>
          <div className="mt-6 flex justify-end">
            <Button size="lg" onClick={handleSearch}>
              <Search className="h-4 w-4" /> Search Available Shuttles
            </Button>
          </div>
        </Card>
      )}

      {/* Results */}
      {step === 'results' && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4 text-primary-600" />
              <span className="font-medium">{pickup}</span>
              <ArrowRight className="h-4 w-4 text-gray-400" />
              <span className="font-medium">{destination}</span>
              <span className="text-gray-400">·</span>
              <Calendar className="h-4 w-4 text-gray-400" />
              <span>{date}</span>
              <Clock className="h-4 w-4 text-gray-400 ml-1" />
              <span>{time}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setStep('search')}>Modify search</Button>
          </div>

          {searchResults.length === 0 ? (
            <Card padding="lg">
              <EmptyState
                icon={<Bus className="h-8 w-8" />}
                title="No shuttles found"
                description="No available shuttles match your search criteria. Try a different route or time."
                action={<Button variant="outline" onClick={() => setStep('search')}>Modify search</Button>}
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {searchResults.map((shuttle) => (
                <Card key={shuttle.id} padding="md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 flex-shrink-0">
                        <Bus className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-gray-900">{shuttle.shuttleId}</span>
                          <Badge variant={shuttle.status === 'full' ? 'error' : 'success'}>
                            {shuttle.status === 'full' ? 'Full' : 'Available'}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-gray-700">{shuttle.routeName}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Hash className="h-3 w-3" /> {shuttle.vehicleNumber}
                          </span>
                          <span className="flex items-center gap-1">
                            <UserIcon className="h-3 w-3" /> {shuttle.driverName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Dep: {shuttle.departureTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> Arr: {shuttle.estimatedArrival}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" /> {shuttle.availableSeats}/{shuttle.totalSeats} seats
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                      {shuttle.availableSeats === 0 ? (
                        <div className="flex items-center gap-1.5 text-sm text-error-600">
                          <XCircle className="h-4 w-4" /> Fully booked
                        </div>
                      ) : (
                        <Button onClick={() => handleSelectShuttle(shuttle)}>
                          Book Shuttle
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
