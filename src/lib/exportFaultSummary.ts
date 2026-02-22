import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import type { ChecklistItem } from '@/hooks/useFaults';

interface FaultRow {
  id: string;
  type: string;
  custom_fault_type?: string | null;
  status: string;
  description: string;
  reported_at: string;
  facility_id: string;
  component_id?: string | null;
  assigned_worker_id?: string | null;
  checklist?: ChecklistItem[] | null;
}

interface FacilityRow {
  id: string;
  name: string;
  location: string;
  health_percentage: number;
  components: {
    id: string;
    name: string;
    status: string;
    last_inspection: string;
  }[];
}

interface WorkerRow {
  id: string;
  name: string;
  role: string;
  custom_role?: string | null;
  is_present: boolean;
  absence_reason?: string | null;
  phone_number?: string | null;
}

interface ReportRow {
  id: string;
  note: string;
  created_at: string;
  reported_by?: string | null;
  facility_id?: string | null;
}

interface StatsRow {
  date: Date;
  totalFaults: number;
  resolvedFaults: number;
  inspections: number;
  averageHealth: number;
}

interface ExportData {
  faults: FaultRow[];
  facilities: FacilityRow[];
  workers: WorkerRow[];
  reports: ReportRow[];
  stats: StatsRow[];
}

const absenceReasonLabels: Record<string, string> = {
  public_holiday: 'Public Holiday',
  casual_leave: 'Casual Leave',
  absent: 'Absent',
  permission: 'Permission',
  annual_leave: 'Annual Leave',
  late: 'Late',
  hospital: 'Hospital',
  official_duty: 'Official Duty',
  maternity_leave: 'Maternity Leave',
  resigned: 'Resigned',
};

export const exportFullReportExcel = (data: ExportData) => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const wb = XLSX.utils.book_new();
  const facilityMap = new Map(data.facilities.map(f => [f.id, f.name]));

  // === Dashboard Sheet ===
  const totalHealth = data.facilities.length > 0
    ? Math.round(data.facilities.reduce((a, f) => a + f.health_percentage, 0) / data.facilities.length)
    : 100;
  const presentWorkers = data.workers.filter(w => w.is_present).length;
  const openFaults = data.faults.filter(f => f.status === 'open').length;
  const inProgressFaults = data.faults.filter(f => f.status === 'in-progress').length;
  const resolvedFaults = data.faults.filter(f => f.status === 'resolved').length;

  const dashboardData = [
    { Metric: 'Report Date', Value: today },
    { Metric: 'Overall Facility Health', Value: `${totalHealth}%` },
    { Metric: 'Total Facilities', Value: data.facilities.length },
    { Metric: 'Total Workers', Value: data.workers.length },
    { Metric: 'Workers Present', Value: presentWorkers },
    { Metric: 'Workers Away', Value: data.workers.length - presentWorkers },
    { Metric: 'Total Faults', Value: data.faults.length },
    { Metric: 'Open Faults', Value: openFaults },
    { Metric: 'In Progress Faults', Value: inProgressFaults },
    { Metric: 'Resolved Faults', Value: resolvedFaults },
    { Metric: 'Total Reports', Value: data.reports.length },
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dashboardData), 'Dashboard');

  // === Facilities Sheet ===
  const facilitiesData = data.facilities.map(f => ({
    Name: f.name,
    Location: f.location,
    'Health %': f.health_percentage,
    'Total Components': f.components.length,
    'Good': f.components.filter(c => c.status === 'good').length,
    'Repairs': f.components.filter(c => c.status === 'repairs').length,
    'Faulty': f.components.filter(c => c.status === 'faulty').length,
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(facilitiesData.length ? facilitiesData : [{ Name: 'No facilities' }]), 'Facilities');

  // Components sub-sheet
  const componentsData = data.facilities.flatMap(f =>
    f.components.map(c => ({
      Facility: f.name,
      Component: c.name,
      Status: c.status,
      'Last Inspection': format(new Date(c.last_inspection), 'MMM d, yyyy'),
    }))
  );
  if (componentsData.length > 0) {
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(componentsData), 'Components');
  }

  // === Workers Sheet ===
  const workersData = data.workers.map(w => ({
    Name: w.name,
    Role: w.role === 'other' && w.custom_role ? w.custom_role : w.role,
    Phone: w.phone_number || '',
    Status: w.is_present ? 'Present' : 'Away',
    'Absence Reason': !w.is_present && w.absence_reason ? (absenceReasonLabels[w.absence_reason] || w.absence_reason) : '',
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(workersData.length ? workersData : [{ Name: 'No workers' }]), 'Workers');

  // === Faults Sheet ===
  const faultsData = data.faults.map(f => {
    const checklist = f.checklist || [];
    const checklistStatus = checklist.length > 0
      ? checklist.map(c => `${c.done ? '✓' : '○'} ${c.label}`).join(', ')
      : '';

    return {
      'Fault Type': f.type === 'other' && f.custom_fault_type ? f.custom_fault_type : f.type,
      Status: f.status,
      Description: f.description,
      Facility: facilityMap.get(f.facility_id) || 'Unknown',
      'Reported At': format(new Date(f.reported_at), 'MMM d, yyyy h:mm a'),
      'Procurement Progress': checklistStatus,
    };
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(faultsData.length ? faultsData : [{ 'Fault Type': 'No faults' }]), 'Faults');

  // Fault summary by type
  const typeCount: Record<string, number> = {};
  data.faults.forEach(f => {
    const label = f.type === 'other' && f.custom_fault_type ? f.custom_fault_type : f.type;
    typeCount[label] = (typeCount[label] || 0) + 1;
  });
  const typeData = Object.entries(typeCount).map(([Type, Count]) => ({ Type, Count }));
  if (typeData.length > 0) {
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(typeData), 'Faults By Type');
  }

  // === Reports Sheet ===
  const reportsData = data.reports.map(r => ({
    Note: r.note,
    Facility: r.facility_id ? (facilityMap.get(r.facility_id) || 'Unknown') : 'General',
    'Reported By': r.reported_by || '',
    'Created At': format(new Date(r.created_at), 'MMM d, yyyy h:mm a'),
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(reportsData.length ? reportsData : [{ Note: 'No reports' }]), 'Reports');

  // === Stats Sheet ===
  const statsData = data.stats.map(s => ({
    Date: format(s.date, 'MMM d, yyyy'),
    'Total Faults': s.totalFaults,
    'Resolved Faults': s.resolvedFaults,
    'Reports Filed': s.inspections,
    'Avg Health %': s.averageHealth,
  }));
  if (statsData.length > 0) {
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(statsData), 'Stats');
  }

  XLSX.writeFile(wb, `Facility_Report_${today}.xlsx`);
};

// Keep backward compat
export const exportFaultSummaryExcel = (
  faults: { id: string; type: string; custom_fault_type?: string | null; status: string; description: string; reported_at: string; facility_id: string }[],
  facilities: { id: string; name: string }[]
) => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const facilityMap = new Map(facilities.map(f => [f.id, f.name]));

  const open = faults.filter(f => f.status === 'open').length;
  const inProgress = faults.filter(f => f.status === 'in-progress').length;
  const resolved = faults.filter(f => f.status === 'resolved').length;

  const summaryData = [
    { Metric: 'Report Date', Value: today },
    { Metric: 'Total Faults', Value: faults.length },
    { Metric: 'Open', Value: open },
    { Metric: 'In Progress', Value: inProgress },
    { Metric: 'Resolved', Value: resolved },
  ];

  const typeCount: Record<string, number> = {};
  faults.forEach(f => {
    const label = f.type === 'other' && f.custom_fault_type ? f.custom_fault_type : f.type;
    typeCount[label] = (typeCount[label] || 0) + 1;
  });
  const typeData = Object.entries(typeCount).map(([Type, Count]) => ({ Type, Count }));

  const detailData = faults.map(f => ({
    'Fault Type': f.type === 'other' && f.custom_fault_type ? f.custom_fault_type : f.type,
    Status: f.status,
    Description: f.description,
    Facility: facilityMap.get(f.facility_id) || 'Unknown',
    'Reported At': format(new Date(f.reported_at), 'MMM d, yyyy h:mm a'),
  }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryData), 'Summary');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(typeData), 'By Type');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(detailData), 'All Faults');

  XLSX.writeFile(wb, `Fault_Summary_${today}.xlsx`);
};
