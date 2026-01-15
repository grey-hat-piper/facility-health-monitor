import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HealthIndicator } from "@/components/dashboard/HealthIndicator";
import { useFacilities, useCreateFacility, useUpdateFacility, useDeleteFacility, useCreateComponent, useUpdateComponent, useDeleteComponent, FacilityWithComponents, DbFacilityComponent } from "@/hooks/useFacilities";
import { MapPin, ChevronRight, CheckCircle2, Wrench, AlertTriangle, Calendar, Plus, Edit, Trash2, X } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

const statusIcons = {
  good: <CheckCircle2 className="h-4 w-4" />,
  repairs: <Wrench className="h-4 w-4" />,
  faulty: <AlertTriangle className="h-4 w-4" />,
};

const statusVariants = {
  good: 'healthy' as const,
  repairs: 'warning' as const,
  faulty: 'critical' as const,
};

export const FacilitiesView = () => {
  const { data: facilities, isLoading } = useFacilities();
  const createFacility = useCreateFacility();
  const updateFacility = useUpdateFacility();
  const deleteFacility = useDeleteFacility();
  const createComponent = useCreateComponent();
  const updateComponent = useUpdateComponent();
  const deleteComponent = useDeleteComponent();

  const [selectedFacility, setSelectedFacility] = useState<FacilityWithComponents | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddComponentDialogOpen, setIsAddComponentDialogOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState<DbFacilityComponent | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'facility' | 'component'; id: string } | null>(null);

  const [formData, setFormData] = useState({ name: '', location: '' });
  const [componentForm, setComponentForm] = useState({ name: '', status: 'good' as 'good' | 'repairs' | 'faulty' });

  const handleCreateFacility = (e: React.FormEvent) => {
    e.preventDefault();
    createFacility.mutate(formData, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
        setFormData({ name: '', location: '' });
      },
    });
  };

  const handleUpdateFacility = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFacility) return;
    updateFacility.mutate({ id: selectedFacility.id, ...formData }, {
      onSuccess: () => {
        setIsEditDialogOpen(false);
        setSelectedFacility(null);
      },
    });
  };

  const handleAddComponent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFacility) return;
    createComponent.mutate({ facility_id: selectedFacility.id, ...componentForm }, {
      onSuccess: (newComponent) => {
        // Update the selectedFacility with the new component
        setSelectedFacility(prev => prev ? {
          ...prev,
          components: [...prev.components, newComponent as DbFacilityComponent]
        } : null);
        setIsAddComponentDialogOpen(false);
        setComponentForm({ name: '', status: 'good' });
      },
    });
  };

  const handleUpdateComponent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingComponent) return;
    updateComponent.mutate({ id: editingComponent.id, ...componentForm }, {
      onSuccess: (updatedComponent) => {
        // Update the selectedFacility with the updated component
        setSelectedFacility(prev => prev ? {
          ...prev,
          components: prev.components.map(c => 
            c.id === editingComponent.id ? updatedComponent as DbFacilityComponent : c
          )
        } : null);
        setEditingComponent(null);
        setComponentForm({ name: '', status: 'good' });
      },
    });
  };

  const handleDeleteConfirm = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'facility') {
      deleteFacility.mutate(deleteConfirm.id, {
        onSuccess: () => setSelectedFacility(null),
      });
    } else {
      deleteComponent.mutate(deleteConfirm.id, {
        onSuccess: () => {
          // Update the selectedFacility by removing the deleted component
          setSelectedFacility(prev => prev ? {
            ...prev,
            components: prev.components.filter(c => c.id !== deleteConfirm.id)
          } : null);
        },
      });
    }
    setDeleteConfirm(null);
  };

  const openEditFacility = (facility: FacilityWithComponents) => {
    setFormData({ name: facility.name, location: facility.location });
    setSelectedFacility(facility);
    setIsEditDialogOpen(true);
  };

  const openEditComponent = (component: DbFacilityComponent) => {
    setComponentForm({ name: component.name, status: component.status });
    setEditingComponent(component);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Facilities</h2>
          <p className="text-muted-foreground">Manage and monitor all school facilities</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Facility
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Facility</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateFacility} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Main Building"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={formData.location}
                  onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., Block A"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={createFacility.isPending}>
                {createFacility.isPending ? 'Creating...' : 'Create Facility'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!facilities || facilities.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No facilities yet. Add your first facility to get started.</p>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Facility
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {facilities.map((facility, index) => (
            <Card 
              key={facility.id} 
              className="cursor-pointer hover:shadow-card-hover transition-all animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => setSelectedFacility(facility)}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <HealthIndicator percentage={facility.health_percentage} size="md" />
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg">{facility.name}</h3>
                    <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
                      <MapPin className="h-3 w-3" />
                      <span>{facility.location}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      {facility.components.filter(c => c.status === 'good').length > 0 && (
                        <Badge variant="healthy" className="gap-1">
                          {statusIcons.good}
                          {facility.components.filter(c => c.status === 'good').length} Good
                        </Badge>
                      )}
                      {facility.components.filter(c => c.status === 'repairs').length > 0 && (
                        <Badge variant="warning" className="gap-1">
                          {statusIcons.repairs}
                          {facility.components.filter(c => c.status === 'repairs').length} Repairs
                        </Badge>
                      )}
                      {facility.components.filter(c => c.status === 'faulty').length > 0 && (
                        <Badge variant="critical" className="gap-1">
                          {statusIcons.faulty}
                          {facility.components.filter(c => c.status === 'faulty').length} Faulty
                        </Badge>
                      )}
                      {facility.components.length === 0 && (
                        <Badge variant="neutral">No components</Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" onClick={() => openEditFacility(facility)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm({ type: 'facility', id: facility.id })}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Facility Details Dialog */}
      <Dialog open={!!selectedFacility && !isEditDialogOpen} onOpenChange={() => setSelectedFacility(null)}>
        <DialogContent className="max-w-2xl">
          {selectedFacility && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <HealthIndicator percentage={selectedFacility.health_percentage} size="sm" />
                  <div>
                    <span>{selectedFacility.name}</span>
                    <p className="text-sm font-normal text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {selectedFacility.location}
                    </p>
                  </div>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Components</h4>
                  <Button size="sm" className="gap-1" onClick={() => setIsAddComponentDialogOpen(true)}>
                    <Plus className="h-3 w-3" />
                    Add Component
                  </Button>
                </div>
                
                {selectedFacility.components.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                      No components yet. Add components to track facility health.
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-3">
                    {selectedFacility.components.map(component => (
                      <div 
                        key={component.id} 
                        className="flex items-center justify-between p-4 rounded-lg border bg-card"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            component.status === 'good' ? 'bg-status-healthy/10 text-status-healthy' :
                            component.status === 'repairs' ? 'bg-status-warning/10 text-status-warning' :
                            'bg-status-critical/10 text-status-critical'
                          }`}>
                            {statusIcons[component.status]}
                          </div>
                          <div>
                            <p className="font-medium">{component.name}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <Calendar className="h-3 w-3" />
                              Last inspected: {format(new Date(component.last_inspection), 'MMM d, yyyy')}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={statusVariants[component.status]} className="capitalize">
                            {component.status}
                          </Badge>
                          <Button variant="ghost" size="icon" onClick={() => openEditComponent(component)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm({ type: 'component', id: component.id })}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Facility Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Facility</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateFacility} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={formData.location}
                onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={updateFacility.isPending}>
              {updateFacility.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Component Dialog */}
      <Dialog open={isAddComponentDialogOpen} onOpenChange={setIsAddComponentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Component</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddComponent} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={componentForm.name}
                onChange={e => setComponentForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Electrical System"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={componentForm.status} onValueChange={(v: 'good' | 'repairs' | 'faulty') => setComponentForm(prev => ({ ...prev, status: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="repairs">Undergoing Repairs</SelectItem>
                  <SelectItem value="faulty">Faulty</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={createComponent.isPending}>
              {createComponent.isPending ? 'Adding...' : 'Add Component'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Component Dialog */}
      <Dialog open={!!editingComponent} onOpenChange={() => setEditingComponent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Component</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateComponent} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={componentForm.name}
                onChange={e => setComponentForm(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={componentForm.status} onValueChange={(v: 'good' | 'repairs' | 'faulty') => setComponentForm(prev => ({ ...prev, status: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="repairs">Undergoing Repairs</SelectItem>
                  <SelectItem value="faulty">Faulty</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={updateComponent.isPending}>
              {updateComponent.isPending ? 'Saving...' : 'Save Changes'}
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
              {deleteConfirm?.type === 'facility' 
                ? 'This will permanently delete the facility and all its components. This action cannot be undone.'
                : 'This will permanently delete this component. This action cannot be undone.'}
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
