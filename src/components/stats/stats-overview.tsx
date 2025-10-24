import { TrendingDown, TrendingUp, Users, AlertTriangle, Activity, BarChart3 } from "lucide-react";
import { StatCard } from "./stat-card";
import { StatsGrid } from "./stats-grid";

interface DengueStat {
  title: string;
  description: string;
  value: string | number;
  trendValue?: string | number;
  trendLabel?: string;
  trend?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
}

interface StatsOverviewProps {
  stats: DengueStat[];
  isLoading?: boolean;
  className?: string;
  columns?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export function StatsOverview({
  stats,
  isLoading = false,
  className,
  columns,
}: StatsOverviewProps) {
  return (
    <StatsGrid className={className} columns={columns}>
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          description={stat.description}
          value={stat.value}
          trendValue={stat.trendValue}
          trendLabel={stat.trendLabel}
          trend={stat.trend}
          icon={stat.icon}
          isLoading={isLoading}
        />
      ))}
    </StatsGrid>
  );
}

// Pre-configured stats overview components for common use cases
export function DengueStatsOverview({
  totalCases,
  activeCases,
  pendingCases,
  weeklyCases,
  isLoading = false,
  className,
}: {
  totalCases: number;
  activeCases: number;
  pendingCases: number;
  weeklyCases: number;
  isLoading?: boolean;
  className?: string;
}) {
  const stats: DengueStat[] = [
    {
      title: "Total Cases",
      description: "Cumulative reported cases (all statuses)",
      value: totalCases.toLocaleString(),
      icon: <Users className="h-4 w-4" />,
      trend: "neutral",
    },
    {
      title: "Active Cases",
      description: "Validated cases",
      value: activeCases.toLocaleString(),
      icon: <AlertTriangle className="h-4 w-4" />,
      trend: "neutral",
    },
    {
      title: "Pending Cases",
      description: "Reports pending validation",
      value: pendingCases.toLocaleString(),
      icon: <Activity className="h-4 w-4" />,
      trend: "neutral",
    },
    {
      title: "Weekly Reports",
      description: "New reports this week (all statuses)",
      value: weeklyCases.toLocaleString(),
      icon: <BarChart3 className="h-4 w-4" />,
      trend: "neutral",
    },
  ];

  return (
    <StatsOverview
      stats={stats}
      isLoading={isLoading}
      className={className}
      columns={{ default: 1, sm: 2, lg: 4 }}
    />
  );
} 