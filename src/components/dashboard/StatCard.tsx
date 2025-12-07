import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'healthy' | 'warning' | 'critical';
}

const variantStyles = {
  default: 'bg-primary/10 text-primary',
  healthy: 'bg-status-healthy/10 text-status-healthy',
  warning: 'bg-status-warning/10 text-status-warning',
  critical: 'bg-status-critical/10 text-status-critical',
};

export const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  variant = 'default' 
}: StatCardProps) => {
  return (
    <Card className="animate-fade-in">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
            {trend && (
              <p className={cn(
                "text-xs mt-2 font-medium",
                trend.isPositive ? "text-status-healthy" : "text-status-critical"
              )}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% vs last period
              </p>
            )}
          </div>
          <div className={cn("p-3 rounded-xl", variantStyles[variant])}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
