import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReportItem } from "@/components/dashboard/ReportItem";
import { mockReports, mockFacilities } from "@/data/mockData";
import { FileText, Plus, Upload, CalendarIcon, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";

export const ReportsView = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const { toast } = useToast();

  const filteredReports = useMemo(() => {
    if (!selectedDate) return mockReports;
    return mockReports.filter(report => isSameDay(report.timestamp, selectedDate));
  }, [selectedDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Report Added",
      description: "Your brief report has been saved.",
    });
    setIsDialogOpen(false);
  };

  // Get dates that have reports for highlighting in calendar
  const reportDates = useMemo(() => {
    return mockReports.map(report => report.timestamp);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">Brief Reports</h2>
          <p className="text-muted-foreground">Quick notes and condition updates</p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Date Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : "Filter by date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
                className="p-3 pointer-events-auto"
                modifiers={{
                  hasReport: reportDates,
                }}
                modifiersStyles={{
                  hasReport: {
                    fontWeight: 'bold',
                    textDecoration: 'underline',
                  },
                }}
              />
            </PopoverContent>
          </Popover>
          
          {selectedDate && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedDate(undefined)}
              className="h-9 w-9"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          
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
      </div>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {selectedDate ? `Reports for ${format(selectedDate, "MMMM d, yyyy")}` : "Recent Reports"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredReports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No reports found for this date</p>
            </div>
          ) : (
            filteredReports.map((report, index) => (
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
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};
