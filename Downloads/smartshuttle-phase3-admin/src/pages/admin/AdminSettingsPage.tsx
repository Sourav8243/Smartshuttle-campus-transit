import { Settings } from 'lucide-react';
import { PagePlaceholder } from '@/components/common/PagePlaceholder';

export function AdminSettingsPage() {
  return (
    <PagePlaceholder
      title="Settings"
      description="Configure system preferences and options"
      icon={<Settings className="h-9 w-9" />}
    />
  );
}
