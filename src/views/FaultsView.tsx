import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFaults, useCreateFault, useUpdateFault, useDeleteFault, DbFault } from "@/hooks/useFaults";
import { useFacilities } from "@/hooks/useFacilities";
import { FaultType } from "@/types/facilities";
import { AlertTriangle, Clock, CheckCircle2, Plus, Zap, Droplets, Shield, ClipboardCheck, Hammer, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { format } from "date-fns";

const faultIcons: Record<FaultType, React.ReactNode> = {
  electrical: <Zap className="h-4 w-4" />,
  plumbing: <Droplets className="h-4 w-4" />,
  security: <Shield className="h-4 w-4" />,
  inspection: <ClipboardCheck className="h-4 w-4" />,
  carpentry: <Hammer className="h-4 w-4" />,
};

const faultColors: Record<FaultType, string> = {
  electrical: 'bg-amber-500',
  plumbing: 'bg-blue-500',
  security: 'bg-purple-500',
  inspection: 'bg-emerald-500',
  carpentry: 'bg-orange-500',
};

const statusVariants: Record<string, 'critical' | 'warning' | 'healthy'> = {
  'open': 'critical',
  'in-progress': 'warning',
  'resolved': 'healthy',
};

export const FaultsView = () => {
  const { data: faults, isLoading: faultsLoading } = useFaults();
  const { data: facilities, isLoading: facilitiesLoading } = useFacilities();
  const createFault = useCreateFault();
  const updateFault = useUpdateFault();
  const deleteFault = useDeleteFault();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFault, setEditingFault] = useState<DbFault | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    facility_id: '',
    type: '' as FaultType | '',
    description: '',
    status: 'open' as 'open' | 'in-progress' | 'resolved',
  });
  
  const openFaults = faults?.filter(f => f.status === 'open') || [];
  const inProgressFaults = faults?.filter(f => f.status === 'in-progress') || [];
  const resolvedFaults = faults?.filter(f => f.status === 'resolved') || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.facility_id || !formData.type) return;
    
    createFault.mutate({
      facility_id: formData.facility_id,
      type: formData.type,
      description: formData.description,
    }, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setFormData({ facility_id: '', type: '', description: '', status: 'open' });
      },
    });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFault) return;
    
    updateFault.mutate({
      id: editingFault.id,
      description: formData.description,
      status: formData.status,
    }, {
      onSuccess: () => {
        setEditingFault(null);
        setFormData({ facility_id: '', type: '', description: '', status: 'open' });
      },
    });
  };

  const openEditFault = (fault: DbFault) => {
    setFormData({
      facility_id: fault.facility_id,
      type: fault.type,
      description: fault.description,
      status: fault.status,
    });
    setEditingFault(fault);
  };

  const handleDeleteConfirm = () => {
    if (!deleteConfirm) return;
    deleteFault.mutate(deleteConfirm);
    setDeleteConfirm(null);
  };

  const getFacilityName = (facilityId: string) => {
    return facilities?.find(f => f.id === facilityId)?.name || 'Unknown';
  };

  const isLoading = faultsLoading || facilitiesLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-40 mt-2" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const FaultCard = ({ fault }: { fault: DbFault }) => (
    <div className="p-4 rounded-lg border bg-card hover:shadow-sm transition-all">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg text-primary-foreground ${faultColors[fault.type]}`}>
          {faultIcons[fault.type]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm capitalize">{fault.type}</span>
            <Badge variant={statusVariants[fault.status]} className="text-xs capitalize">
              {fault.status.replace('-', ' ')}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {fault.description}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            📍 {getFacilityName(fault.facility_id)}
          </p>
          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{format(new Date(fault.reported_at), 'MMM d, h:mm a')}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => openEditFault(fault)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(fault.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
    </div>
  );

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
                <Select value={formData.facility_id} onValueChange={v => setFormData(prev => ({ ...prev, facility_id: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select facility" />
                  </SelectTrigger>
                  <SelectContent>
                    {facilities?.map(facility => (
                      <SelectItem key={facility.id} value={facility.id}>
                        {facility.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Fault Type</Label>
                <Select value={formData.type} onValueChange={(v: FaultType) => setFormData(prev => ({ ...prev, type: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="plumbing">Plumbing</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="inspection">Inspection</SelectItem>
                    <SelectItem value="carpentry">Carpentry</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the issue..." 
                  required
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={createFault.isPending}>
                {createFault.isPending ? 'Submitting...' : 'Submit Report'}
              </Button>
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
                <FaultCard fault={fault} />
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
                <FaultCard fault={fault} />
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
                <FaultCard fault={fault} />
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Fault Dialog */}
      <Dialog open={!!editingFault} onOpenChange={() => setEditingFault(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Fault</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(v: 'open' | 'in-progress' | 'resolved') => setFormData(prev => ({ ...prev, status: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={updateFault.isPending}>
              {updateFault.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this fault report. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
