import { CalendarPlus } from 'lucide-react';
import { PagePlaceholder } from '@/components/common/PagePlaceholder';

export function BookShuttlePage() {
  return (
    <PagePlaceholder
      title="Book a Shuttle"
      description="Search and book available shuttles for your trip"
      icon={<CalendarPlus className="h-9 w-9" />}
    />
  );
}
