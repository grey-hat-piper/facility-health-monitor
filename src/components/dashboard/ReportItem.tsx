import { BriefReport } from "@/types/facilities";
import { FileText, Clock, Image } from "lucide-react";
import { format } from "date-fns";

interface ReportItemProps {
  report: BriefReport;
  facilityName?: string;
}

export const ReportItem = ({ report, facilityName }: ReportItemProps) => {
  return (
    <div className="p-4 rounded-lg border bg-card hover:shadow-sm transition-all">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <FileText className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm">{report.note}</p>
          {report.imageUrl && (
            <div className="mt-3 rounded-lg overflow-hidden border">
              <img 
                src={report.imageUrl} 
                alt="Report attachment" 
                className="w-full max-h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(report.imageUrl, '_blank')}
              />
            </div>
          )}
          {facilityName && (
            <p className="text-xs text-muted-foreground mt-2">
              📍 {facilityName}
            </p>
          )}
          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{format(report.timestamp, 'MMM d, h:mm a')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
