import { Facility, Worker, Fault, BriefReport, DailyStats } from '@/types/facilities';

export const mockWorkers: Worker[] = [
  { id: '1', name: 'John Smith', role: 'electrician', isPresent: true },
  { id: '2', name: 'Maria Garcia', role: 'plumber', isPresent: true },
  { id: '3', name: 'David Chen', role: 'security', isPresent: false },
  { id: '4', name: 'Sarah Wilson', role: 'inspector', isPresent: true },
  { id: '5', name: 'Mike Johnson', role: 'maintenance', isPresent: true },
  { id: '6', name: 'Emily Brown', role: 'electrician', isPresent: false },
];

export const mockFacilities: Facility[] = [
  {
    id: '1',
    name: 'Main Building',
    location: 'Block A',
    healthPercentage: 87,
    components: [
      { id: 'c1', name: 'Electrical System', status: 'good', lastInspection: new Date('2024-12-01'), facilityId: '1' },
      { id: 'c2', name: 'Plumbing Network', status: 'repairs', lastInspection: new Date('2024-12-03'), facilityId: '1' },
      { id: 'c3', name: 'Fire Safety', status: 'good', lastInspection: new Date('2024-12-05'), facilityId: '1' },
      { id: 'c4', name: 'HVAC System', status: 'good', lastInspection: new Date('2024-12-02'), facilityId: '1' },
    ],
  },
  {
    id: '2',
    name: 'Science Lab',
    location: 'Block B',
    healthPercentage: 72,
    components: [
      { id: 'c5', name: 'Lab Equipment', status: 'repairs', lastInspection: new Date('2024-12-04'), facilityId: '2' },
      { id: 'c6', name: 'Ventilation', status: 'good', lastInspection: new Date('2024-12-01'), facilityId: '2' },
      { id: 'c7', name: 'Gas Supply', status: 'faulty', lastInspection: new Date('2024-12-06'), facilityId: '2' },
    ],
  },
  {
    id: '3',
    name: 'Sports Complex',
    location: 'Block C',
    healthPercentage: 94,
    components: [
      { id: 'c8', name: 'Pool Filtration', status: 'good', lastInspection: new Date('2024-12-05'), facilityId: '3' },
      { id: 'c9', name: 'Gym Equipment', status: 'good', lastInspection: new Date('2024-12-03'), facilityId: '3' },
      { id: 'c10', name: 'Lighting System', status: 'good', lastInspection: new Date('2024-12-04'), facilityId: '3' },
    ],
  },
  {
    id: '4',
    name: 'Library',
    location: 'Block A',
    healthPercentage: 45,
    components: [
      { id: 'c11', name: 'Climate Control', status: 'faulty', lastInspection: new Date('2024-12-02'), facilityId: '4' },
      { id: 'c12', name: 'Security System', status: 'repairs', lastInspection: new Date('2024-12-06'), facilityId: '4' },
      { id: 'c13', name: 'Electrical Outlets', status: 'faulty', lastInspection: new Date('2024-12-01'), facilityId: '4' },
    ],
  },
];

export const mockFaults: Fault[] = [
  {
    id: 'f1',
    facilityId: '2',
    componentId: 'c7',
    type: 'plumbing',
    description: 'Gas leak detected in chemistry lab section',
    reportedAt: new Date('2024-12-06T09:30:00'),
    assignedWorkerId: '2',
    status: 'in-progress',
  },
  {
    id: 'f2',
    facilityId: '4',
    componentId: 'c11',
    type: 'electrical',
    description: 'AC unit not functioning properly',
    reportedAt: new Date('2024-12-05T14:15:00'),
    assignedWorkerId: '1',
    status: 'open',
  },
  {
    id: 'f3',
    facilityId: '4',
    componentId: 'c13',
    type: 'electrical',
    description: 'Multiple outlets sparking when in use',
    reportedAt: new Date('2024-12-06T11:00:00'),
    status: 'open',
  },
  {
    id: 'f4',
    facilityId: '1',
    componentId: 'c2',
    type: 'plumbing',
    description: 'Minor leak in restroom B',
    reportedAt: new Date('2024-12-04T16:45:00'),
    assignedWorkerId: '2',
    status: 'in-progress',
  },
];

export const mockReports: BriefReport[] = [
  {
    id: 'r1',
    facilityId: '1',
    note: 'Completed quarterly electrical inspection. All systems operational.',
    timestamp: new Date('2024-12-06T10:00:00'),
    authorId: '4',
  },
  {
    id: 'r2',
    facilityId: '2',
    componentId: 'c7',
    note: 'Gas supply isolated pending repair. Alternative arrangements made for lab classes.',
    timestamp: new Date('2024-12-06T09:45:00'),
    authorId: '2',
  },
  {
    id: 'r3',
    facilityId: '3',
    note: 'Pool filtration system serviced. Water quality tests passed.',
    timestamp: new Date('2024-12-05T15:30:00'),
    authorId: '5',
  },
  {
    id: 'r4',
    facilityId: '4',
    note: 'Temporary cooling units installed while AC repair is pending.',
    timestamp: new Date('2024-12-05T16:00:00'),
    authorId: '1',
  },
];

// Generate 30 days of stats
export const generateDailyStats = (): DailyStats[] => {
  const stats: DailyStats[] = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    stats.push({
      date,
      totalFaults: Math.floor(Math.random() * 8) + 2,
      resolvedFaults: Math.floor(Math.random() * 6) + 1,
      inspections: Math.floor(Math.random() * 5) + 1,
      averageHealth: Math.floor(Math.random() * 20) + 70,
    });
  }
  
  return stats;
};

export const mockDailyStats = generateDailyStats();
