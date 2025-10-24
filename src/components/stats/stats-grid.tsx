import { cn } from "@/lib/utils";

interface StatsGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export function StatsGrid({
  children,
  className,
  columns = {
    default: 1,
    sm: 2,
    md: 3,
    lg: 4,
  },
}: StatsGridProps) {
  const getGridCols = () => {
    const cols = [];
    
    if (columns.default) cols.push(`grid-cols-${columns.default}`);
    if (columns.sm) cols.push(`sm:grid-cols-${columns.sm}`);
    if (columns.md) cols.push(`md:grid-cols-${columns.md}`);
    if (columns.lg) cols.push(`lg:grid-cols-${columns.lg}`);
    if (columns.xl) cols.push(`xl:grid-cols-${columns.xl}`);
    
    return cols.join(" ");
  };

  return (
    <div className={cn("grid gap-4", getGridCols(), className)}>
      {children}
    </div>
  );
} 