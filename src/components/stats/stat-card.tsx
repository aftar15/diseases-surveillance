import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

const statVariants = cva("text-xs font-medium", {
  variants: {
    trend: {
      up: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50",
      down: "text-rose-500 bg-rose-50 dark:bg-rose-950/50",
      neutral: "text-gray-500 bg-gray-50 dark:bg-gray-800/50",
    },
  },
  defaultVariants: {
    trend: "neutral",
  },
});

export interface StatCardProps extends VariantProps<typeof statVariants> {
  title: string;
  description?: string;
  value: string | number;
  trendValue?: string | number;
  trendLabel?: string;
  trend?: "up" | "down" | "neutral";
  className?: string;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export function StatCard({
  title,
  description,
  value,
  trendValue,
  trendLabel,
  trend = "neutral",
  className,
  isLoading,
  icon,
}: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base">{title}</CardTitle>
          {description && (
            <CardDescription className="text-xs">
              {description}
            </CardDescription>
          )}
        </div>
        {icon && <div className="h-5 w-5 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-9 w-28 animate-pulse rounded-md bg-muted" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        {(trendValue || trendLabel) && (
          <div className="mt-2 flex items-center gap-1">
            {trend === "up" && <TrendingUp className="h-4 w-4 text-emerald-500" />}
            {trend === "down" && <TrendingDown className="h-4 w-4 text-rose-500" />}
            {trendValue && (
              <span className={cn(statVariants({ trend }), "rounded px-1 py-0.5")}>
                {trendValue}
              </span>
            )}
            {trendLabel && (
              <span className="text-xs text-muted-foreground">
                {trendLabel}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 