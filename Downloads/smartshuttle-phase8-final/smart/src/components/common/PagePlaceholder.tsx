import type { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';

interface PagePlaceholderProps {
  title: string;
  description: string;
  icon: ReactNode;
}

export function PagePlaceholder({ title, description, icon }: PagePlaceholderProps) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>
      <Card padding="lg" className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title} — Coming Soon</h3>
        <p className="mt-2 max-w-md text-sm text-gray-500">
          This module is ready for development. The route, layout, and navigation are all wired up and working.
        </p>
      </Card>
    </div>
  );
}
