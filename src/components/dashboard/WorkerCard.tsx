import { Worker } from "@/types/facilities";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface WorkerCardProps {
  worker: Worker;
}

const roleLabels: Record<string, string> = {
  electrician: 'Electrician',
  plumber: 'Plumber',
  security: 'Security',
  inspector: 'Inspector',
  maintenance: 'Maintenance',
};

const roleColors: Record<string, string> = {
  electrician: 'bg-amber-100 text-amber-800',
  plumber: 'bg-blue-100 text-blue-800',
  security: 'bg-purple-100 text-purple-800',
  inspector: 'bg-emerald-100 text-emerald-800',
  maintenance: 'bg-slate-100 text-slate-800',
};

export const WorkerCard = ({ worker }: WorkerCardProps) => {
  const initials = worker.name.split(' ').map(n => n[0]).join('');

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-card border transition-all hover:shadow-sm">
      <div className="relative">
        <Avatar>
          <AvatarFallback className="bg-primary/10 text-primary font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
        <span
          className={cn(
            "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card",
            worker.isPresent ? "bg-status-healthy" : "bg-muted"
          )}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{worker.name}</p>
        <Badge 
          variant="outline" 
          className={cn("text-xs mt-1", roleColors[worker.role])}
        >
          {roleLabels[worker.role]}
        </Badge>
      </div>
      <Badge variant={worker.isPresent ? "healthy" : "neutral"} className="text-xs">
        {worker.isPresent ? "Present" : "Away"}
      </Badge>
    </div>
  );
};
