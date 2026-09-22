import type { Driver } from '@/types';

export const drivers: Driver[] = [
  { id: 'drv-001', name: 'Michael Brown', phone: '+1 (555) 102-3001', rating: 4.8, status: 'available' },
  { id: 'drv-002', name: 'David Wilson', phone: '+1 (555) 102-3002', rating: 4.6, status: 'on-trip' },
  { id: 'drv-003', name: 'Robert Taylor', phone: '+1 (555) 102-3003', rating: 4.9, status: 'available' },
  { id: 'drv-004', name: 'James Anderson', phone: '+1 (555) 102-3004', rating: 4.5, status: 'available' },
  { id: 'drv-005', name: 'William Garcia', phone: '+1 (555) 102-3005', rating: 4.7, status: 'off-duty' },
  { id: 'drv-006', name: 'Thomas Martinez', phone: '+1 (555) 102-3006', rating: 4.4, status: 'available' },
];
