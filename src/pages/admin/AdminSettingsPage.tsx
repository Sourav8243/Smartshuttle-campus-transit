<<<<<<< HEAD
import { useEffect, useState } from 'react';
import {
  Bell,
  Check,
  Globe2,
  Lock,
  Palette,
  RotateCcw,
  Save,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/hooks/useToast';

const STORAGE_KEY = 'smartshuttle_preferences';

type Preferences = {
  emailNotifications: boolean;
  bookingAlerts: boolean;
  scheduleAlerts: boolean;
  compactTables: boolean;
  language: string;
  timezone: string;
};

const defaults: Preferences = {
  emailNotifications: true,
  bookingAlerts: true,
  scheduleAlerts: true,
  compactTables: false,
  language: 'en',
  timezone: 'Asia/Kolkata',
};

function loadPreferences(): Preferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
  } catch {
    return defaults;
  }
}

function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (value: boolean) => void; label: string; description: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-xl border border-gray-100 p-4 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
    >
      <span>
        <span className="block text-sm font-medium text-gray-900">{label}</span>
        <span className="mt-0.5 block text-xs text-gray-500">{description}</span>
      </span>
      <span className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors ${checked ? 'bg-primary-600' : 'bg-gray-300'}`}>
        <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </span>
    </button>
  );
}

export function AdminSettingsPage() {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<Preferences>(loadPreferences);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(false);
  }, [preferences]);

  const update = <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
    setPreferences((current) => ({ ...current, [key]: value }));
  };

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    setSaved(true);
    toast('Settings saved successfully', 'success');
  };

  const reset = () => {
    setPreferences(defaults);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
    setSaved(true);
    toast('Settings restored to defaults', 'info');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-primary-600">
            <Settings className="h-5 w-5" />
            <span className="text-sm font-medium">System Preferences</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <p className="mt-1 text-sm text-gray-500">Configure notifications, regional preferences and dashboard behavior.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={reset}>
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
          <Button onClick={save}>
            {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saved ? 'Saved' : 'Save changes'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card padding="none">
            <CardHeader title="Notifications" subtitle="Choose which operational updates you want to receive." />
            <CardBody className="space-y-3">
              <Toggle checked={preferences.emailNotifications} onChange={(v) => update('emailNotifications', v)} label="Email notifications" description="Receive important system updates by email." />
              <Toggle checked={preferences.bookingAlerts} onChange={(v) => update('bookingAlerts', v)} label="Booking alerts" description="Get notified when bookings are created, changed or cancelled." />
              <Toggle checked={preferences.scheduleAlerts} onChange={(v) => update('scheduleAlerts', v)} label="Driver schedule alerts" description="Receive alerts for schedule changes and conflicts." />
            </CardBody>
          </Card>

          <Card padding="none">
            <CardHeader title="Dashboard preferences" subtitle="Adjust how operational data is displayed." />
            <CardBody>
              <Toggle checked={preferences.compactTables} onChange={(v) => update('compactTables', v)} label="Compact tables" description="Use denser table rows when reviewing large datasets." />
            </CardBody>
          </Card>

          <Card padding="none">
            <CardHeader title="Regional preferences" subtitle="These preferences are stored locally for this demo environment." />
            <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select label="Language" value={preferences.language} onChange={(e) => update('language', e.target.value)} options={[{ value: 'en', label: 'English' }]} />
              <Select label="Time zone" value={preferences.timezone} onChange={(e) => update('timezone', e.target.value)} options={[{ value: 'Asia/Kolkata', label: 'India Standard Time (IST)' }, { value: 'UTC', label: 'UTC' }]} />
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-gray-900">Security</h3>
            <p className="mt-1 text-sm text-gray-500">Your demo session uses local browser storage. No real credentials are stored.</p>
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-success-50 px-3 py-2 text-xs font-medium text-success-700">
              <Check className="h-4 w-4" /> Demo security checks active
            </div>
          </Card>

          <Card>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-gray-50 p-3">
                <Bell className="h-5 w-5 text-primary-600" />
                <p className="mt-3 text-xs text-gray-500">Alerts</p>
                <p className="text-sm font-semibold text-gray-900">{preferences.bookingAlerts ? 'Enabled' : 'Off'}</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-3">
                <Palette className="h-5 w-5 text-primary-600" />
                <p className="mt-3 text-xs text-gray-500">Theme</p>
                <p className="text-sm font-semibold text-gray-900">Light</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-3">
                <Globe2 className="h-5 w-5 text-primary-600" />
                <p className="mt-3 text-xs text-gray-500">Timezone</p>
                <p className="text-sm font-semibold text-gray-900">{preferences.timezone === 'UTC' ? 'UTC' : 'IST'}</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-3">
                <Lock className="h-5 w-5 text-primary-600" />
                <p className="mt-3 text-xs text-gray-500">Session</p>
                <p className="text-sm font-semibold text-gray-900">Protected</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
=======
import { Settings } from 'lucide-react';
import { PagePlaceholder } from '@/components/common/PagePlaceholder';

export function AdminSettingsPage() {
  return (
    <PagePlaceholder
      title="Settings"
      description="Configure system preferences and options"
      icon={<Settings className="h-9 w-9" />}
    />
>>>>>>> 5659604fc572f48fdc5ffb0a48e7a78db09dad67
  );
}
