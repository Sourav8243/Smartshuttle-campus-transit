import { type ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({ children, className, padding = 'md' }: CardProps) {
  return (
    <div className={cn('rounded-xl border border-gray-200 bg-white shadow-card', paddings[padding], className)}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-4">
      <div>
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function CardBody({ children, className, padding = 'md' }: { children: ReactNode; className?: string; padding?: 'none' | 'sm' | 'md' | 'lg' }) {
  const paddings = { none: '', sm: 'p-4', md: 'px-6 py-5', lg: 'p-8' };
  return <div className={cn(paddings[padding], className)}>{children}</div>;
}
