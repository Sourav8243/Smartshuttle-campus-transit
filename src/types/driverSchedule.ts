export interface DriverBreak {
  id: string;
  startTime: string;
  endTime: string;
}

export interface DriverSchedule {
  id: string;
  driverId: string;
  date: string;
  startTime: string;
  endTime: string;
  breaks: DriverBreak[];
  notes?: string;
}
