import { Route } from 'lucide-react';
import { PagePlaceholder } from '@/components/common/PagePlaceholder';

export function AdminRoutesPage() {
  return (
    <PagePlaceholder
      title="Routes"
      description="Manage shuttle routes and schedules"
      icon={<Route className="h-9 w-9" />}
    />
  );
}
