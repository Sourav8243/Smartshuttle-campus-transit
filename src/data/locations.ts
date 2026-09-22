export const campusLocations: string[] = [
  'Main Gate',
  'Library',
  'Hostel',
  'Parking',
  'Data Centre',
  'Academic Block',
  'Admin Block',
  'Cafeteria',
  'Sports Complex',
  'Engineering Block',
];

export const locationOptions = campusLocations.map((loc) => ({ value: loc, label: loc }));
