import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, Mail, Lock, ArrowRight, ShieldCheck, GraduationCap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function LoginPage() {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      toast('Welcome to SmartShuttle!', 'success');
      navigate(email.toLowerCase() === 'admin@smartshuttle.com' ? '/admin/dashboard' : '/student/dashboard');
    } else {
      setError(result.error || 'Login failed');
    }
  };

  const fillDemo = (type: 'student' | 'admin') => {
    if (type === 'student') {
      setEmail('student@smartshuttle.com');
      setPassword('student123');
    } else {
      setEmail('admin@smartshuttle.com');
      setPassword('admin123');
    }
    setError('');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-700 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900" />
        <div className="absolute top-20 right-20 h-64 w-64 rounded-full bg-primary-500/20 blur-3xl" />
        <div className="absolute bottom-20 left-10 h-48 w-48 rounded-full bg-primary-400/10 blur-3xl" />

        <div className="relative z-10 flex items-center gap-3 text-white">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
            <Bus className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xl font-bold leading-none">SmartShuttle</span>
            <span className="block text-sm text-primary-200 mt-1">Campus Transport System</span>
          </div>
        </div>

        <div className="relative z-10 text-white">
          <h2 className="text-4xl font-bold leading-tight max-w-md">
            Smart shuttle booking for modern campuses
          </h2>
          <p className="mt-4 text-lg text-primary-200 max-w-md">
            Book rides, track shuttles in real-time, and manage your campus transport — all in one place.
          </p>
          <div className="mt-10 space-y-4">
            {[
              'Real-time shuttle tracking',
              'Instant booking & scheduling',
              'Trip history & analytics',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3 text-primary-100">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15">
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-sm text-primary-300">© 2026 SmartShuttle. All rights reserved.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600">
              <Bus className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">SmartShuttle</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Sign in to your account</h1>
            <p className="mt-1.5 text-sm text-gray-500">Enter your credentials to access the dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email address"
              type="email"
              placeholder="you@smartshuttle.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="h-4 w-4" />}
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="h-4 w-4" />}
              required
              autoComplete="current-password"
            />

            {error && (
              <div className="rounded-lg bg-error-50 border border-error-100 px-4 py-3">
                <p className="text-sm text-error-700">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                Remember me
              </label>
              <span className="text-sm text-primary-600 font-medium cursor-pointer">Forgot password?</span>
            </div>

            <Button type="submit" size="lg" loading={loading} className="w-full">
              Sign in
              {!loading && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>

          {/* Demo accounts */}
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">Demo accounts</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => fillDemo('student')}
                className="flex flex-col items-start gap-1 rounded-xl border border-gray-200 bg-white p-4 text-left hover:border-primary-300 hover:bg-primary-50/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-primary-600" />
                  <span className="text-sm font-semibold text-gray-900">Student</span>
                </div>
                <span className="text-xs text-gray-400">student@smartshuttle.com</span>
              </button>
              <button
                onClick={() => fillDemo('admin')}
                className="flex flex-col items-start gap-1 rounded-xl border border-gray-200 bg-white p-4 text-left hover:border-primary-300 hover:bg-primary-50/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary-600" />
                  <span className="text-sm font-semibold text-gray-900">Admin</span>
                </div>
                <span className="text-xs text-gray-400">admin@smartshuttle.com</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
