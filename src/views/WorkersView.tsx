import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WorkerCard } from "@/components/dashboard/WorkerCard";
import { mockWorkers } from "@/data/mockData";
import { Users, UserCheck, UserX } from "lucide-react";

export const WorkersView = () => {
  const presentWorkers = mockWorkers.filter(w => w.isPresent);
  const absentWorkers = mockWorkers.filter(w => !w.isPresent);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Workers</h2>
        <p className="text-muted-foreground">Track worker presence and assignments</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{mockWorkers.length}</p>
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
          {presentWorkers.map((worker, index) => (
            <div key={worker.id} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
              <WorkerCard worker={worker} />
            </div>
          ))}
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
                <WorkerCard worker={worker} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
