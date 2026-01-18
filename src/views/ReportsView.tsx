import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReportItem } from "@/components/dashboard/ReportItem";
import { FileText, Plus, Loader2, X, Image } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useReports, useCreateReport, useUpdateReport, useDeleteReport, Report } from "@/hooks/useReports";
import { useFacilities } from "@/hooks/useFacilities";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export const ReportsView = () => {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<string>("");
  const [note, setNote] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { data: reports, isLoading: reportsLoading } = useReports();
  const { data: facilities, isLoading: facilitiesLoading } = useFacilities();
  const createReport = useCreateReport();
  const updateReport = useUpdateReport();
  const deleteReport = useDeleteReport();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image under 5MB",
          variant: "destructive",
        });
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `reports/${fileName}`;

    const { error } = await supabase.storage
      .from('report-images')
      .upload(filePath, file);

    if (error) {
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('report-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const resetForm = () => {
    setSelectedFacility("");
    setNote("");
    removeImage();
    setEditingReport(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;

    setIsUploading(true);
    try {
      let imageUrl: string | null = null;
      
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
      }

      createReport.mutate({
        facility_id: selectedFacility || null,
        note: note.trim(),
        image_url: imageUrl,
        reported_by: user?.username || null,
      }, {
        onSuccess: () => {
          setIsDialogOpen(false);
          resetForm();
        }
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReport || !note.trim()) return;

    setIsUploading(true);
    try {
      let imageUrl: string | null | undefined = undefined;
      
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
      } else if (imagePreview === null && editingReport.image_url) {
        // Image was removed
        imageUrl = null;
      }

      updateReport.mutate({
        id: editingReport.id,
        facility_id: selectedFacility || null,
        note: note.trim(),
        ...(imageUrl !== undefined && { image_url: imageUrl }),
      }, {
        onSuccess: () => {
          setEditingReport(null);
          resetForm();
        }
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const openEditReport = (report: Report) => {
    setEditingReport(report);
    setSelectedFacility(report.facility_id || "");
    setNote(report.note);
    setImagePreview(report.image_url || null);
  };

  const handleDeleteConfirm = () => {
    if (!deleteConfirm) return;
    deleteReport.mutate(deleteConfirm);
    setDeleteConfirm(null);
  };

  const isLoading = reportsLoading || facilitiesLoading;
  const isSubmitting = createReport.isPending || updateReport.isPending || isUploading;

  const ReportFormContent = ({ isEdit = false }: { isEdit?: boolean }) => (
    <form onSubmit={isEdit ? handleUpdate : handleSubmit} className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label>Facility (optional)</Label>
        <Select value={selectedFacility} onValueChange={setSelectedFacility}>
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
        <Label>Note</Label>
        <Textarea 
          placeholder="Write a brief note about the condition or work done..." 
          rows={4}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label>Attach Image (optional)</Label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
        {imagePreview ? (
          <div className="relative rounded-lg overflow-hidden border">
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="w-full h-40 object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8"
              onClick={removeImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div 
            className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Image className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground mt-2">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Max 5MB
            </p>
          </div>
        )}
      </div>
      
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            {isUploading ? "Uploading..." : "Saving..."}
          </>
        ) : (
          isEdit ? "Save Changes" : "Save Report"
        )}
      </Button>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Brief Reports</h2>
          <p className="text-muted-foreground">Quick notes and condition updates</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Report
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Brief Report</DialogTitle>
            </DialogHeader>
            <ReportFormContent />
          </DialogContent>
        </Dialog>
      </div>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Recent Reports
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : reports && reports.length > 0 ? (
            reports.map((report, index) => (
              <div 
                key={report.id} 
                className="animate-slide-up" 
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <ReportItem 
                  report={{
                    id: report.id,
                    facilityId: report.facility_id || '',
                    note: report.note,
                    timestamp: new Date(report.created_at),
                    imageUrl: report.image_url || undefined,
                    reportedBy: report.reported_by || undefined,
                  }} 
                  facilityName={facilities?.find(f => f.id === report.facility_id)?.name}
                  onEdit={() => openEditReport(report)}
                  onDelete={() => setDeleteConfirm(report.id)}
                />
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No reports yet. Add your first report!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Edit Report Dialog */}
      <Dialog open={!!editingReport} onOpenChange={(open) => {
        if (!open) {
          setEditingReport(null);
          resetForm();
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Report</DialogTitle>
          </DialogHeader>
          <ReportFormContent isEdit />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this report. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};