"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircleIcon, InfoIcon, XIcon, BadgeAlertIcon, WifiIcon } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useAppStore } from "@/store";
import { Alert as AlertType } from "@/types";
import { useSocket } from "@/hooks/use-socket";

interface AlertsListProps {
  className?: string;
  filterBySeverity?: "info" | "warning" | "critical" | null;
  maxAlerts?: number;
}

export function ClientAlertsList({ className, filterBySeverity, maxAlerts = 5 }: AlertsListProps) {
  const { alerts, setAlerts, dismissAlert } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { isConnected } = useSocket();

  // Fetch alerts from API
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setIsLoading(true);
        let url = '/api/alerts?active=true';
        
        if (filterBySeverity) {
          url += `&severity=${filterBySeverity}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch alerts');
        }
        
        const data = await response.json();
        setAlerts(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching alerts:', err);
        setError('Failed to load alerts. Please try again later.');
        toast({
          title: "Error", 
          description: "Failed to load alerts", 
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlerts();
  }, [setAlerts, filterBySeverity, toast]);

  // Handle alert dismissal
  const handleDismiss = async (id: string) => {
    try {
      const response = await fetch(`/api/alerts?id=${id}`, {
        method: 'PATCH',
      });
      
      if (!response.ok) {
        throw new Error('Failed to dismiss alert');
      }
      
      // Note: dismissAlert is now handled automatically via socket events
      // but we'll keep this here for redundancy
      toast({
        title: "Success",
        description: "Alert dismissed"
      });
    } catch (err) {
      console.error('Error dismissing alert:', err);
      toast({
        title: "Error",
        description: "Failed to dismiss alert", 
        variant: "destructive"
      });
    }
  };

  // Filter alerts if needed
  let filteredAlerts = [...alerts];
  if (filterBySeverity) {
    filteredAlerts = filteredAlerts.filter(alert => alert.severity === filterBySeverity);
  }

  // Sort alerts by severity (critical > warning > info)
  const sortedAlerts = filteredAlerts.sort((a, b) => {
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  }).slice(0, maxAlerts);

  // Get alert icon based on severity
  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <BadgeAlertIcon className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircleIcon className="h-4 w-4 text-amber-500" />;
      case 'info':
      default:
        return <InfoIcon className="h-4 w-4 text-blue-500" />;
    }
  };

  // Get alert variant based on severity
  const getAlertVariant = (severity: string) => {
    return severity === 'critical' ? 'destructive' : 'default';
  };

  // Get severity badge style
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge className="bg-red-500">Critical</Badge>;
      case 'warning':
        return <Badge className="bg-amber-500">Warning</Badge>;
      case 'info':
      default:
        return <Badge className="bg-blue-500">Info</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircleIcon className="h-5 w-5" />
            Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircleIcon className="h-5 w-5" />
            Alerts
          </div>
          {isConnected && (
            <div className="flex items-center gap-1 text-xs text-green-500 font-normal">
              <WifiIcon className="h-3 w-3" />
              <span>Live</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error ? (
          <Alert variant="destructive">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : sortedAlerts.length === 0 ? (
          <div className="text-center p-4">
            <p className="text-muted-foreground">No active alerts at this time.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedAlerts.map((alert) => (
              <Alert key={alert.id} variant={getAlertVariant(alert.severity)}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {getAlertIcon(alert.severity)}
                      <AlertTitle className="flex items-center gap-2">
                        {alert.title}
                        {getSeverityBadge(alert.severity)}
                      </AlertTitle>
                    </div>
                    <AlertDescription>{alert.message}</AlertDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0 rounded-full"
                    onClick={() => handleDismiss(alert.id)}
                  >
                    <span className="sr-only">Dismiss</span>
                    <XIcon className="h-4 w-4" />
                  </Button>
                </div>
              </Alert>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 