import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useActivityLogs } from "@/hooks/useActivityLogs";
import { format } from "date-fns";
import { 
  AlertTriangle, 
  FileText, 
  Building, 
  Users, 
  Wrench,
  CalendarDays,
  Activity,
  Filter
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const entityTypes = [
  { value: 'all', label: 'All Types' },
  { value: 'fault', label: 'Faults' },
  { value: 'report', label: 'Reports' },
  { value: 'facility', label: 'Facilities' },
  { value: 'worker', label: 'Workers' },
  { value: 'component', label: 'Components' },
];

const getEventIcon = (entityType: string) => {
  switch (entityType) {
    case 'fault':
      return <AlertTriangle className="h-4 w-4 text-status-critical" />;
    case 'report':
      return <FileText className="h-4 w-4 text-primary" />;
    case 'facility':
      return <Building className="h-4 w-4 text-status-healthy" />;
    case 'worker':
      return <Users className="h-4 w-4 text-status-warning" />;
    case 'component':
      return <Wrench className="h-4 w-4 text-muted-foreground" />;
    default:
      return <Activity className="h-4 w-4 text-muted-foreground" />;
  }
};

const getEventBadgeVariant = (eventType: string) => {
  if (eventType.includes('created') || eventType.includes('added')) return 'default';
  if (eventType.includes('updated') || eventType.includes('modified')) return 'secondary';
  if (eventType.includes('deleted') || eventType.includes('removed')) return 'destructive';
  if (eventType.includes('resolved')) return 'outline';
  return 'secondary';
};

export const CalendarView = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [filterType, setFilterType] = useState<string>('all');
  const { data: activities, isLoading } = useActivityLogs(selectedDate);

  const filteredActivities = activities?.filter(activity => 
    filterType === 'all' || activity.entity_type === filterType
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <CalendarDays className="h-6 w-6 text-primary" />
          Activity Calendar
        </h2>
        <p className="text-muted-foreground">View all events and activities by date</p>
      </div>

      <div className="grid lg:grid-cols-[350px_1fr] gap-6">
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg">Select Date</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[320px]">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className={cn("rounded-md border pointer-events-auto")}
              />
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="animate-slide-up">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle className="text-lg">
                Activities on {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    {entityTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : filteredActivities && filteredActivities.length > 0 ? (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {filteredActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="mt-0.5">
                        {getEventIcon(activity.entity_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={getEventBadgeVariant(activity.event_type) as any}>
                            {activity.event_type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(activity.created_at), 'h:mm a')}
                          </span>
                        </div>
                        <p className="text-sm mt-1">{activity.event_description}</p>
                        {activity.created_by && (
                          <p className="text-xs text-muted-foreground mt-1">
                            By: {activity.created_by}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <CalendarDays className="h-12 w-12 mb-4 opacity-50" />
                <p>No activities recorded on this date</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
