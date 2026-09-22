import type { ShuttleRoute } from '@/types';

export const routes: ShuttleRoute[] = [
  { id: 'rt-001', name: 'North Campus Loop', stops: ['Main Gate', 'Academic Block', 'Engineering Block', 'Library', 'Hostel'], estimatedDuration: 25 },
  { id: 'rt-002', name: 'Library Express', stops: ['Main Gate', 'Library', 'Admin Block', 'Parking'], estimatedDuration: 15 },
  { id: 'rt-003', name: 'South Campus', stops: ['Main Gate', 'Sports Complex', 'Cafeteria', 'Hostel'], estimatedDuration: 20 },
  { id: 'rt-004', name: 'Stadium Route', stops: ['Main Gate', 'Sports Complex', 'Parking', 'Engineering Block'], estimatedDuration: 18 },
  { id: 'rt-005', name: 'Hostel Circuit', stops: ['Hostel', 'Cafeteria', 'Library', 'Academic Block'], estimatedDuration: 22 },
  { id: 'rt-006', name: 'Admin Connector', stops: ['Admin Block', 'Data Centre', 'Main Gate', 'Parking'], estimatedDuration: 12 },
];
