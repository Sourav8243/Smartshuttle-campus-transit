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
