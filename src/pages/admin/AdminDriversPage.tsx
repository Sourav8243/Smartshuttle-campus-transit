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
