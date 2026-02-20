import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Trash2, Phone, Pencil } from "lucide-react";
import type { Worker } from "@/hooks/useWorkers";

interface WorkerCardProps {
  worker: Worker;
  onTogglePresence?: (id: string, isPresent: boolean, absenceReason?: string | null) => void;
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, updates: { name: string; phone_number: string | null; role: string; custom_role: string | null }) => void;
}

export const roleLabels: Record<string, string> = {
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

export const absenceReasonLabels: Record<string, string> = {
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

const absenceReasonColors: Record<string, string> = {
  public_holiday: 'bg-blue-100 text-blue-800',
  casual_leave: 'bg-yellow-100 text-yellow-800',
  absent: 'bg-red-100 text-red-800',
  permission: 'bg-indigo-100 text-indigo-800',
  annual_leave: 'bg-cyan-100 text-cyan-800',
  late: 'bg-orange-100 text-orange-800',
  hospital: 'bg-pink-100 text-pink-800',
  official_duty: 'bg-emerald-100 text-emerald-800',
  maternity_leave: 'bg-purple-100 text-purple-800',
  resigned: 'bg-gray-100 text-gray-800',
};

export const WorkerCard = ({ worker, onTogglePresence, onDelete, onUpdate }: WorkerCardProps) => {
  const initials = worker.name.split(' ').map(n => n[0]).join('');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState(worker.name);
  const [editPhone, setEditPhone] = useState(worker.phone_number || "");
  const [editRole, setEditRole] = useState<string>(worker.role);
  const [editCustomRole, setEditCustomRole] = useState(worker.custom_role || "");
  const [absenceReason, setAbsenceReason] = useState<string>(
    (worker as any).absence_reason || ""
  );

  const handleSave = () => {
    onUpdate?.(worker.id, {
      name: editName.trim(),
      phone_number: editPhone.trim() || null,
      role: editRole,
      custom_role: editRole === 'other' ? editCustomRole.trim() : null,
    });
    setIsEditOpen(false);
  };

  const handleMarkAway = (reason: string) => {
    setAbsenceReason(reason);
    onTogglePresence?.(worker.id, false, reason);
  };

  const handleMarkPresent = () => {
    setAbsenceReason("");
    onTogglePresence?.(worker.id, true, null);
  };

  const currentAbsenceReason = (worker as any).absence_reason;

  return (
    <>
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
          <div className="flex items-center gap-1 mt-1 flex-wrap">
            <Badge 
              variant="outline" 
              className={cn("text-xs", roleColors[worker.role])}
            >
              {worker.role === 'other' && worker.custom_role 
                ? worker.custom_role 
                : roleLabels[worker.role]}
            </Badge>
            {!worker.is_present && currentAbsenceReason && (
              <Badge 
                variant="outline" 
                className={cn("text-xs", absenceReasonColors[currentAbsenceReason] || "bg-muted text-muted-foreground")}
              >
                {absenceReasonLabels[currentAbsenceReason] || currentAbsenceReason}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {worker.is_present ? (
            <Select onValueChange={(v) => handleMarkAway(v)}>
              <SelectTrigger className="h-7 w-auto text-xs px-2 border-none bg-transparent text-status-healthy hover:bg-muted">
                <span>Present</span>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(absenceReasonLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value} className="text-xs">
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 px-2 text-muted-foreground"
              onClick={handleMarkPresent}
            >
              Mark Present
            </Button>
          )}
          {onUpdate && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-primary"
              onClick={() => {
                setEditName(worker.name);
                setEditPhone(worker.phone_number || "");
                setEditRole(worker.role);
                setEditCustomRole(worker.custom_role || "");
                setIsEditOpen(true);
              }}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          )}
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

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Worker</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} type="tel" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select value={editRole} onValueChange={setEditRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(roleLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {editRole === 'other' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Custom Role</label>
                <Input value={editCustomRole} onChange={(e) => setEditCustomRole(e.target.value)} />
              </div>
            )}
            <Button className="w-full" onClick={handleSave}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
