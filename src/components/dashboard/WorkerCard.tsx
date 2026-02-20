import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Trash2, Phone } from "lucide-react";
import type { Worker } from "@/hooks/useWorkers";

interface WorkerCardProps {
  worker: Worker;
  onTogglePresence?: (id: string, isPresent: boolean) => void;
  onDelete?: (id: string) => void;
}

const roleLabels: Record<string, string> = {
  electrician: 'Electrician',
  plumber: 'Plumber',
  security: 'Security',
  inspector: 'Inspector',
  carpenter: 'Carpenter',
  janitor: 'Janitor',
  grounds: 'Grounds',
  other: 'Other',
};

const roleColors: Record<string, string> = {
  electrician: 'bg-amber-100 text-amber-800',
  plumber: 'bg-blue-100 text-blue-800',
  security: 'bg-purple-100 text-purple-800',
  inspector: 'bg-emerald-100 text-emerald-800',
  carpenter: 'bg-orange-100 text-orange-800',
  janitor: 'bg-teal-100 text-teal-800',
  grounds: 'bg-green-100 text-green-800',
  other: 'bg-slate-100 text-slate-800',
};

export const WorkerCard = ({ worker, onTogglePresence, onDelete }: WorkerCardProps) => {
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
            worker.is_present ? "bg-status-healthy" : "bg-muted"
          )}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{worker.name}</p>
        {worker.phone_number && (
          <a href={`tel:${worker.phone_number}`} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors mt-0.5">
            <Phone className="h-3 w-3" />
            {worker.phone_number}
          </a>
        )}
        <Badge 
          variant="outline" 
          className={cn("text-xs mt-1", roleColors[worker.role])}
        >
          {worker.role === 'other' && worker.custom_role 
            ? worker.custom_role 
            : roleLabels[worker.role]}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "text-xs h-7 px-2",
            worker.is_present ? "text-status-healthy" : "text-muted-foreground"
          )}
          onClick={() => onTogglePresence?.(worker.id, !worker.is_present)}
        >
          {worker.is_present ? "Present" : "Away"}
        </Button>
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={() => onDelete(worker.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
