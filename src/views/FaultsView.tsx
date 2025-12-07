import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FaultItem } from "@/components/dashboard/FaultItem";
import { mockFaults, mockFacilities } from "@/data/mockData";
import { AlertTriangle, Clock, CheckCircle2, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export const FaultsView = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const openFaults = mockFaults.filter(f => f.status === 'open');
  const inProgressFaults = mockFaults.filter(f => f.status === 'in-progress');
  const resolvedFaults = mockFaults.filter(f => f.status === 'resolved');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Fault Reported",
      description: "The fault has been logged successfully.",
    });
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Faults</h2>
          <p className="text-muted-foreground">Track and manage facility issues</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Report Fault
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Report New Fault</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Facility</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select facility" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockFacilities.map(facility => (
                      <SelectItem key={facility.id} value={facility.id}>
                        {facility.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Fault Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="plumbing">Plumbing</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="inspection">Inspection</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Describe the issue..." />
              </div>
              
              <Button type="submit" className="w-full">Submit Report</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-lg bg-status-critical/10">
              <AlertTriangle className="h-5 w-5 text-status-critical" />
            </div>
            <div>
              <p className="text-2xl font-bold">{openFaults.length}</p>
              <p className="text-xs text-muted-foreground">Open</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-lg bg-status-warning/10">
              <Clock className="h-5 w-5 text-status-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{inProgressFaults.length}</p>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-lg bg-status-healthy/10">
              <CheckCircle2 className="h-5 w-5 text-status-healthy" />
            </div>
            <div>
              <p className="text-2xl font-bold">{resolvedFaults.length}</p>
              <p className="text-xs text-muted-foreground">Resolved</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Faults Tabs */}
      <Tabs defaultValue="open" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="open" className="gap-2">
            Open
            <Badge variant="critical" className="h-5 w-5 p-0 flex items-center justify-center">
              {openFaults.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="in-progress" className="gap-2">
            In Progress
            <Badge variant="warning" className="h-5 w-5 p-0 flex items-center justify-center">
              {inProgressFaults.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="resolved" className="gap-2">
            Resolved
            <Badge variant="healthy" className="h-5 w-5 p-0 flex items-center justify-center">
              {resolvedFaults.length}
            </Badge>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="open" className="space-y-3 mt-4">
          {openFaults.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No open faults
              </CardContent>
            </Card>
          ) : (
            openFaults.map((fault, index) => (
              <div key={fault.id} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                <FaultItem 
                  fault={fault} 
                  facilityName={mockFacilities.find(f => f.id === fault.facilityId)?.name}
                />
              </div>
            ))
          )}
        </TabsContent>
        
        <TabsContent value="in-progress" className="space-y-3 mt-4">
          {inProgressFaults.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No faults in progress
              </CardContent>
            </Card>
          ) : (
            inProgressFaults.map((fault, index) => (
              <div key={fault.id} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                <FaultItem 
                  fault={fault} 
                  facilityName={mockFacilities.find(f => f.id === fault.facilityId)?.name}
                />
              </div>
            ))
          )}
        </TabsContent>
        
        <TabsContent value="resolved" className="space-y-3 mt-4">
          {resolvedFaults.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No resolved faults yet
              </CardContent>
            </Card>
          ) : (
            resolvedFaults.map((fault, index) => (
              <div key={fault.id} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                <FaultItem 
                  fault={fault} 
                  facilityName={mockFacilities.find(f => f.id === fault.facilityId)?.name}
                />
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
