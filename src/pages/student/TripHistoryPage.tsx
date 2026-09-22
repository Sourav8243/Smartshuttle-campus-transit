import { History } from 'lucide-react';
import { PagePlaceholder } from '@/components/common/PagePlaceholder';

export function TripHistoryPage() {
  return (
    <PagePlaceholder
      title="Trip History"
      description="Review your past shuttle trips and travel records"
      icon={<History className="h-9 w-9" />}
    />
  );
}
