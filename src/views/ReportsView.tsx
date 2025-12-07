import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReportItem } from "@/components/dashboard/ReportItem";
import { mockReports, mockFacilities } from "@/data/mockData";
import { FileText, Plus, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export const ReportsView = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Report Added",
      description: "Your brief report has been saved.",
    });
    setIsDialogOpen(false);
  };

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
                <Label>Note</Label>
                <Textarea 
                  placeholder="Write a brief note about the condition or work done..." 
                  rows={4}
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
              
              <Button type="submit" className="w-full">Save Report</Button>
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
          {mockReports.map((report, index) => (
            <div 
              key={report.id} 
              className="animate-slide-up" 
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <ReportItem 
                report={report} 
                facilityName={mockFacilities.find(f => f.id === report.facilityId)?.name}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
