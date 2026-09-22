import type { BookingStatus } from '@/types';
import type { BadgeVariant } from '@/components/ui/Badge';

export function statusBadgeVariant(status: BookingStatus): BadgeVariant {
  switch (status) {
    case 'confirmed':
      return 'success';
    case 'pending':
      return 'warning';
    case 'completed':
      return 'primary';
    case 'cancelled':
      return 'error';
    case 'rejected':
      return 'error';
    case 'no-show':
      return 'neutral';
    default:
      return 'neutral';
  }
}

export function statusLabel(status: BookingStatus): string {
  const labels: Record<BookingStatus, string> = {
    confirmed: 'Confirmed',
    pending: 'Pending',
    completed: 'Completed',
    cancelled: 'Cancelled',
    rejected: 'Rejected',
    'no-show': 'No-show',
  };
  return labels[status] || status;
}

export const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'no-show', label: 'No-show' },
];
