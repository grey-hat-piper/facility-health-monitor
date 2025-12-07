import { cn } from "@/lib/utils";

interface HealthIndicatorProps {
  percentage: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const HealthIndicator = ({ percentage, size = 'md', showLabel = true }: HealthIndicatorProps) => {
  const getStatusColor = () => {
    if (percentage >= 80) return 'text-status-healthy';
    if (percentage >= 50) return 'text-status-warning';
    return 'text-status-critical';
  };

  const getTrackColor = () => {
    if (percentage >= 80) return 'stroke-status-healthy';
    if (percentage >= 50) return 'stroke-status-warning';
    return 'stroke-status-critical';
  };

  const sizeConfig = {
    sm: { size: 48, strokeWidth: 4, textSize: 'text-xs' },
    md: { size: 72, strokeWidth: 5, textSize: 'text-lg' },
    lg: { size: 96, strokeWidth: 6, textSize: 'text-2xl' },
  };

  const config = sizeConfig[size];
  const radius = (config.size - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={config.size}
        height={config.size}
        className="transform -rotate-90"
      >
        <circle
          cx={config.size / 2}
          cy={config.size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={config.strokeWidth}
          className="text-muted"
        />
        <circle
          cx={config.size / 2}
          cy={config.size / 2}
          r={radius}
          fill="none"
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn("transition-all duration-700 ease-out", getTrackColor())}
        />
      </svg>
      {showLabel && (
        <span className={cn(
          "absolute font-bold",
          config.textSize,
          getStatusColor()
        )}>
          {percentage}%
        </span>
      )}
    </div>
  );
};
