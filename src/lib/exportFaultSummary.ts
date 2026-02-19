import * as XLSX from 'xlsx';
import { format } from 'date-fns';

interface FaultRow {
  id: string;
  type: string;
  custom_fault_type?: string | null;
  status: string;
  description: string;
  reported_at: string;
  facility_id: string;
}

interface FacilityRow {
  id: string;
  name: string;
}

export const exportFaultSummaryExcel = (
  faults: FaultRow[],
  facilities: FacilityRow[]
) => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const facilityMap = new Map(facilities.map(f => [f.id, f.name]));

  // Summary by status
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

  // Summary by type
  const typeCount: Record<string, number> = {};
  faults.forEach(f => {
    const label = f.type === 'other' && f.custom_fault_type ? f.custom_fault_type : f.type;
    typeCount[label] = (typeCount[label] || 0) + 1;
  });
  const typeData = Object.entries(typeCount).map(([Type, Count]) => ({ Type, Count }));

  // Detailed fault list
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
