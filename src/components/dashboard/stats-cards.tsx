"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { UsersIcon, CheckCircleIcon, ClockIcon, ActivityIcon } from "lucide-react"; // Or other relevant icons
import { cn } from "@/lib/utils";

// Define the structure for the statistics data prop
interface DashboardStats {
  totalCases: number;
  activeCases: number;
  pendingCases: number;
  weeklyReports: number;
}

interface StatsCardsProps {
  stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cardVariants = {
    hover: {
      scale: 1.04,
      boxShadow: "0 10px 15px -3px rgba(0, 100, 0, 0.1), 0 4px 6px -2px rgba(0, 100, 0, 0.05)",
      transition: { type: "spring", stiffness: 300, damping: 15 }
    },
    initial: {
      scale: 1,
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    }
  };

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Cases Card */}
      <motion.div variants={cardVariants} initial="initial" whileHover="hover">
        <Card className="border-l-4 border-l-emerald-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-emerald-700">Total Cases</CardTitle>
            <UsersIcon className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-xl sm:text-2xl font-bold">{stats.totalCases.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Cumulative reported cases (all statuses)</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Active Cases Card */}
      <motion.div variants={cardVariants} initial="initial" whileHover="hover">
        <Card className="border-l-4 border-l-green-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-green-700">Active Cases</CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-xl sm:text-2xl font-bold">{stats.activeCases.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Validated cases</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Pending Cases Card */}
      <motion.div variants={cardVariants} initial="initial" whileHover="hover">
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-emerald-600">Pending Cases</CardTitle>
            <ClockIcon className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-xl sm:text-2xl font-bold">{stats.pendingCases.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Reports pending validation</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Weekly Reports Card */}
      <motion.div variants={cardVariants} initial="initial" whileHover="hover">
        <Card className="border-l-4 border-l-green-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-green-600">Weekly Reports</CardTitle>
            <ActivityIcon className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-xl sm:text-2xl font-bold">{stats.weeklyReports.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">New reports this week (all statuses)</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
} 