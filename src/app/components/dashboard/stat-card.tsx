import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

export default function StatCard({ title, value, icon, trend, variant = 'default' }: StatCardProps) {
  const variantStyles = {
    default: 'bg-card text-card-foreground hover:border-primary/50',
    primary: 'bg-primary/5 border-primary/20 hover:border-primary/50',
    success: 'bg-secondary/5 border-secondary/20 hover:border-secondary/50',
    warning: 'bg-accent/5 border-accent/20 hover:border-accent/50',
    danger: 'bg-destructive/5 border-destructive/20 hover:border-destructive/50',
  };

  const iconStyles = {
    default: 'text-muted-foreground bg-muted/20',
    primary: 'text-primary bg-primary/10',
    success: 'text-secondary bg-secondary/10',
    warning: 'text-accent bg-accent/10',
    danger: 'text-destructive bg-destructive/10',
  };

  return (
    <Card className={cn("transition-all duration-300 hover:shadow-lg hover:-translate-y-1", variantStyles[variant])}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</CardTitle>
        <div className={cn("p-2 rounded-lg bg-white/50 dark:bg-gray-800/50", iconStyles[variant])}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">{value}</div>
        {trend && (
          <p className={cn(
            "text-xs font-medium",
            trend.isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
          )}>
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </p>
        )}
      </CardContent>
    </Card>
  );
}
