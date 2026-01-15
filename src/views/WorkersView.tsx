import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { WorkerCard } from "@/components/dashboard/WorkerCard";
import { useWorkers, useCreateWorker, useDeleteWorker, useToggleWorkerPresence } from "@/hooks/useWorkers";
import { Users, UserCheck, UserX, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type WorkerRole = Database['public']['Enums']['worker_role'];

const roles: { value: WorkerRole; label: string }[] = [
  { value: 'electrician', label: 'Electrician' },
  { value: 'plumber', label: 'Plumber' },
  { value: 'security', label: 'Security' },
  { value: 'inspector', label: 'Inspector' },
  { value: 'carpenter', label: 'Carpenter' },
  { value: 'janitor', label: 'Janitor' },
  { value: 'grounds', label: 'Grounds' },
  { value: 'other', label: 'Other' },
];

export const WorkersView = () => {
  const { data: workers = [], isLoading } = useWorkers();
  const createWorker = useCreateWorker();
  const deleteWorker = useDeleteWorker();
  const togglePresence = useToggleWorkerPresence();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newWorkerName, setNewWorkerName] = useState("");
  const [newWorkerRole, setNewWorkerRole] = useState<WorkerRole>("carpenter");
  const [customRole, setCustomRole] = useState("");

  const presentWorkers = workers.filter(w => w.is_present);
  const absentWorkers = workers.filter(w => !w.is_present);

  const handleCreateWorker = async () => {
    if (!newWorkerName.trim()) {
      toast.error("Please enter a name");
      return;
    }

    try {
      await createWorker.mutateAsync({
        name: newWorkerName.trim(),
        role: newWorkerRole,
        is_present: false,
        custom_role: newWorkerRole === 'other' ? customRole.trim() : null,
      });
      toast.success("Worker added successfully");
      setNewWorkerName("");
      setNewWorkerRole("carpenter");
      setCustomRole("");
      setIsDialogOpen(false);
    } catch (error) {
      toast.error("Failed to add worker");
    }
  };

  const handleDeleteWorker = async (id: string) => {
    try {
      await deleteWorker.mutateAsync(id);
      toast.success("Worker removed");
    } catch (error) {
      toast.error("Failed to remove worker");
    }
  };

  const handleTogglePresence = async (id: string, isPresent: boolean) => {
    try {
      await togglePresence.mutateAsync({ id, isPresent });
      toast.success(isPresent ? "Worker marked as present" : "Worker marked as away");
    } catch (error) {
      toast.error("Failed to update presence");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Workers</h2>
          <p className="text-muted-foreground">Track worker presence and assignments</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Worker
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Worker</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  placeholder="Enter worker name"
                  value={newWorkerName}
                  onChange={(e) => setNewWorkerName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Select value={newWorkerRole} onValueChange={(v) => setNewWorkerRole(v as WorkerRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {newWorkerRole === 'other' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Custom Role</label>
                  <Input
                    placeholder="Specify role"
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                  />
                </div>
              )}
              <Button 
                className="w-full" 
                onClick={handleCreateWorker}
                disabled={createWorker.isPending}
              >
                {createWorker.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Add Worker
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{workers.length}</p>
              <p className="text-xs text-muted-foreground">Total Workers</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-lg bg-status-healthy/10">
              <UserCheck className="h-5 w-5 text-status-healthy" />
            </div>
            <div>
              <p className="text-2xl font-bold">{presentWorkers.length}</p>
              <p className="text-xs text-muted-foreground">Present</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-lg bg-muted">
              <UserX className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{absentWorkers.length}</p>
              <p className="text-xs text-muted-foreground">Away</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Present Workers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-status-healthy" />
            Present Today
            <Badge variant="healthy" className="ml-2">{presentWorkers.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {presentWorkers.length === 0 ? (
            <p className="text-muted-foreground text-sm col-span-2">No workers present</p>
          ) : (
            presentWorkers.map((worker, index) => (
              <div key={worker.id} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                <WorkerCard 
                  worker={worker} 
                  onTogglePresence={handleTogglePresence}
                  onDelete={handleDeleteWorker}
                />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Absent Workers */}
      {absentWorkers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserX className="h-5 w-5 text-muted-foreground" />
              Away
              <Badge variant="neutral" className="ml-2">{absentWorkers.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {absentWorkers.map((worker, index) => (
              <div key={worker.id} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                <WorkerCard 
                  worker={worker} 
                  onTogglePresence={handleTogglePresence}
                  onDelete={handleDeleteWorker}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
