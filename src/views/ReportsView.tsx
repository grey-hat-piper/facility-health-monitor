import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReportItem } from "@/components/dashboard/ReportItem";
import { FileText, Plus, Upload, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useReports, useCreateReport } from "@/hooks/useReports";
import { useFacilities } from "@/hooks/useFacilities";

export const ReportsView = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<string>("");
  const [note, setNote] = useState("");

  const { data: reports, isLoading: reportsLoading } = useReports();
  const { data: facilities, isLoading: facilitiesLoading } = useFacilities();
  const createReport = useCreateReport();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;

    createReport.mutate({
      facility_id: selectedFacility || null,
      note: note.trim(),
      image_url: null,
    }, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setSelectedFacility("");
        setNote("");
      }
    });
  };

  const isLoading = reportsLoading || facilitiesLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Brief Reports</h2>
          <p className="text-muted-foreground">Quick notes and condition updates</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
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
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mt-2">
                    Click to upload or drag and drop
                  </p>
                </div>
              </div>
              
              <Button type="submit" className="w-full" disabled={createReport.isPending}>
                {createReport.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Report"
                )}
              </Button>
            </form>
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
                  }} 
                  facilityName={facilities?.find(f => f.id === report.facility_id)?.name}
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
    </div>
  );
};
