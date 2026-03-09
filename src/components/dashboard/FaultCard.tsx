import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { DbFault, PROCUREMENT_CHECKLIST, ChecklistItem } from "@/hooks/useFaults";
import { FaultType } from "@/types/facilities";
import { Clock, Zap, Droplets, Shield, Bath, Hammer, Edit, Trash2, HelpCircle, Cuboid } from "lucide-react";
import { format } from "date-fns";

const faultIcons: Record<FaultType, React.ReactNode> = {
  electrical: <Zap className="h-4 w-4" />,
  plumbing: <Droplets className="h-4 w-4" />,
  security: <Shield className="h-4 w-4" />,
  sanitary: <Bath className="h-4 w-4" />,
  carpentry: <Hammer className="h-4 w-4" />,
  masonry: <Cuboid className="h-4 w-4" />,
  other: <HelpCircle className="h-4 w-4" />,
};

const faultColors: Record<FaultType, string> = {
  electrical: 'bg-amber-500',
  plumbing: 'bg-blue-500',
  security: 'bg-purple-500',
  sanitary: 'bg-emerald-500',
  carpentry: 'bg-orange-500',
  masonry: 'bg-stone-500',
  other: 'bg-gray-500',
};

const statusVariants: Record<string, 'critical' | 'warning' | 'healthy'> = {
  'open': 'critical',
  'in-progress': 'warning',
  'resolved': 'healthy',
};

interface FaultCardProps {
  fault: DbFault;
  locationDisplay: string;
  onEdit: (fault: DbFault) => void;
  onDelete: (id: string) => void;
  onChecklistToggle: (fault: DbFault, index: number) => void;
}

export const FaultCard = ({ fault, locationDisplay, onEdit, onDelete, onChecklistToggle }: FaultCardProps) => {
  const displayType = fault.type === 'other' && fault.custom_fault_type
    ? fault.custom_fault_type
    : fault.type;

  const checklist: ChecklistItem[] = (fault.checklist && fault.checklist.length > 0)
    ? fault.checklist
    : PROCUREMENT_CHECKLIST;

  const doneCount = checklist.filter(i => i.done).length;
  const progressPercent = Math.round((doneCount / checklist.length) * 100);

  return (
    <div className="p-4 rounded-lg border bg-card hover:shadow-sm transition-all">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg text-primary-foreground ${faultColors[fault.type]}`}>
          {faultIcons[fault.type]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm capitalize">{displayType}</span>
            <Badge variant={statusVariants[fault.status]} className="text-xs capitalize">
              {fault.status.replace('-', ' ')}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {fault.description}
          </p>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            📍 {locationDisplay}
          </p>
          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{format(new Date(fault.reported_at), 'MMM d, h:mm a')}</span>
          </div>

          {fault.status === 'in-progress' && (
            <div className="mt-3 pt-3 border-t space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Procurement Progress</span>
                <span className="text-xs text-muted-foreground">{doneCount}/{checklist.length}</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
              <div className="space-y-1.5 mt-2">
                {checklist.map((item, idx) => (
                  <label
                    key={idx}
                    className="flex items-center gap-2 cursor-pointer group"
                  >
                    <Checkbox
                      checked={item.done}
                      onCheckedChange={() => onChecklistToggle(fault, idx)}
                    />
                    <span className={`text-sm ${item.done ? 'line-through text-muted-foreground' : 'text-foreground'} group-hover:text-primary transition-colors`}>
                      {idx + 1}. {item.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => onEdit(fault)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(fault.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
    </div>
  );
};
