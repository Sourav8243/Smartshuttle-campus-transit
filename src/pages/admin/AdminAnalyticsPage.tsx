import { BarChart3 } from 'lucide-react';
import { PagePlaceholder } from '@/components/common/PagePlaceholder';

export function AdminAnalyticsPage() {
  return (
    <PagePlaceholder
      title="Analytics"
      description="Insights and reports on shuttle operations"
      icon={<BarChart3 className="h-9 w-9" />}
    />
  );
}
