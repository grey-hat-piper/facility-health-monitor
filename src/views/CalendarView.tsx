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
  Activity
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const { data: activities, isLoading } = useActivityLogs(selectedDate);

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
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="text-lg">
              Activities on {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : activities && activities.length > 0 ? (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {activities.map((activity) => (
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
