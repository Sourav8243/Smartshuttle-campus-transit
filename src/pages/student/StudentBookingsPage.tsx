import { Ticket } from 'lucide-react';
import { PagePlaceholder } from '@/components/common/PagePlaceholder';

export function StudentBookingsPage() {
  return (
    <PagePlaceholder
      title="My Bookings"
      description="View and manage your active shuttle bookings"
      icon={<Ticket className="h-9 w-9" />}
    />
  );
}
