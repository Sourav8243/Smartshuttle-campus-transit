import { User as UserIcon, Mail, Shield, Calendar } from 'lucide-react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';

export function StudentProfilePage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
        <p className="mt-1 text-sm text-gray-500">Manage your personal information and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card padding="lg" className="lg:col-span-1 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-2xl font-bold">
            {user.name.charAt(0)}
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">{user.name}</h3>
          <p className="text-sm text-gray-400">{user.email}</p>
          <div className="mt-3 flex justify-center">
            <Badge variant="primary">
              <Shield className="h-3 w-3" /> Student
            </Badge>
          </div>
          <Button variant="outline" className="mt-6 w-full">Edit Profile</Button>
        </Card>

        <Card padding="none" className="lg:col-span-2">
          <CardHeader title="Account Information" subtitle="Your account details and status" />
          <CardBody>
            <div className="space-y-4">
              <div className="flex items-center gap-3 py-3 border-b border-gray-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                  <UserIcon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400">Full Name</p>
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 py-3 border-b border-gray-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400">Email Address</p>
                  <p className="text-sm font-medium text-gray-900">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 py-3 border-b border-gray-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                  <Shield className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400">Role</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">{user.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400">Member Since</p>
                  <p className="text-sm font-medium text-gray-900">September 2026</p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
