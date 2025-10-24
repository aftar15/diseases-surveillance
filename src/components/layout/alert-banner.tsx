"use client";

import { useState, useEffect } from "react";
import { AlertTriangleIcon, XIcon, InfoIcon, AlertCircleIcon } from "lucide-react";
import { useSocket } from "@/hooks/use-socket";
import { useAppStore } from "@/store";

export function AlertBanner() {
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const { alerts, setAlerts } = useAppStore();
  const { isConnected } = useSocket();

  // Fetch active alerts on mount
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await fetch('/api/alerts?active=true');
        if (response.ok) {
          const data = await response.json();
          setAlerts(data);
        }
      } catch (error) {
        console.error('Error fetching alerts:', error);
      }
    };

    fetchAlerts();
  }, [setAlerts]);

  // Filter out dismissed alerts and get active ones
  const activeAlerts = alerts.filter(
    (alert) =>
      !dismissedAlerts.has(alert.id) &&
      (!alert.expiresAt || new Date(alert.expiresAt) > new Date())
  );

  // Get the highest severity alert to display
  const alertToShow = activeAlerts.sort((a, b) => {
    const severityOrder = { critical: 3, warning: 2, info: 1 };
    return severityOrder[b.severity] - severityOrder[a.severity];
  })[0];

  const handleDismiss = (alertId: string) => {
    setDismissedAlerts((prev) => new Set([...prev, alertId]));
  };

  if (!alertToShow) {
    return null;
  }

  const getAlertStyles = () => {
    switch (alertToShow.severity) {
      case "critical":
        return {
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          textColor: "text-red-800",
          iconColor: "text-red-500",
          icon: <AlertCircleIcon className="h-5 w-5 flex-shrink-0" />,
        };
      case "warning":
        return {
          bgColor: "bg-amber-50",
          borderColor: "border-amber-200",
          textColor: "text-amber-800",
          iconColor: "text-amber-500",
          icon: <AlertTriangleIcon className="h-5 w-5 flex-shrink-0" />,
        };
      case "info":
      default:
        return {
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          textColor: "text-blue-800",
          iconColor: "text-blue-500",
          icon: <InfoIcon className="h-5 w-5 flex-shrink-0" />,
        };
    }
  };

  const styles = getAlertStyles();

  return (
    <div className={`${styles.bgColor} border-y ${styles.borderColor}`}>
      <div className="container py-2 px-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className={styles.iconColor}>{styles.icon}</div>
          <div className={`text-sm ${styles.textColor} font-medium`}>
            <span className="font-bold">{alertToShow.title}:</span> {alertToShow.message}
          </div>
          {activeAlerts.length > 1 && (
            <span className={`text-xs ${styles.textColor} opacity-75 whitespace-nowrap`}>
              +{activeAlerts.length - 1} more
            </span>
          )}
        </div>
        <button
          onClick={() => handleDismiss(alertToShow.id)}
          className={`flex-shrink-0 ${styles.iconColor} hover:opacity-70 transition-opacity`}
          aria-label="Dismiss alert"
        >
          <XIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
} 