export type FaultType = 'electrical' | 'plumbing' | 'security' | 'sanitary' | 'carpentry' | 'masonry' | 'other';

export type ComponentStatus = 'good' | 'repairs' | 'faulty';

export type WorkerRole = 'electrician' | 'plumber' | 'security' | 'inspector' | 'maintenance';

export interface Worker {
  id: string;
  name: string;
  role: WorkerRole;
  isPresent: boolean;
  avatar?: string;
}

export interface FacilityComponent {
  id: string;
  name: string;
  status: ComponentStatus;
  lastInspection: Date;
  facilityId: string;
}

export interface Facility {
  id: string;
  name: string;
  location: string;
  components: FacilityComponent[];
  healthPercentage: number;
}

export interface Fault {
  id: string;
  facilityId: string;
  componentId: string;
  type: FaultType;
  description: string;
  reportedAt: Date;
  assignedWorkerId?: string;
  status: 'open' | 'in-progress' | 'resolved';
  images?: string[];
}

export interface BriefReport {
  id: string;
  facilityId: string;
  componentId?: string;
  note: string;
  timestamp: Date;
  authorId?: string;
  images?: string[];
}

export interface DailyStats {
  date: Date;
  totalFaults: number;
  resolvedFaults: number;
  inspections: number;
  averageHealth: number;
}
