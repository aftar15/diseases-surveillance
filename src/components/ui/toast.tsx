"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const toastVariants = cva(
  "fixed bottom-4 right-4 z-50 rounded-md border p-4 shadow-md transition-all",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive: "bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface ToastProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
  title: string;
  description?: string;
  action?: React.ReactNode;
  onClose?: () => void;
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant, title, description, action, onClose, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(toastVariants({ variant }), className)}
        {...props}
      >
        <div className="grid gap-1">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-sm">{title}</h3>
            {onClose && (
              <button
                onClick={onClose}
                className="rounded-full p-1 hover:bg-background/10"
              >
                <XIcon className="h-4 w-4" />
              </button>
            )}
          </div>
          {description && <p className="text-sm">{description}</p>}
        </div>
        {action && <div className="mt-2">{action}</div>}
      </div>
    );
  }
);
Toast.displayName = "Toast";

// Simple useToast hook
type ToastOptions = Omit<ToastProps, "onClose"> & { duration?: number };

interface ToastContextValue {
  toast: (options: ToastOptions) => void;
  dismiss: () => void;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [activeToast, setActiveToast] = React.useState<ToastProps | null>(null);
  const [timeoutId, setTimeoutId] = React.useState<NodeJS.Timeout | null>(null);
  
  const dismiss = React.useCallback(() => {
    setActiveToast(null);
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
  }, [timeoutId]);
  
  const toast = React.useCallback((options: ToastOptions) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    setActiveToast({
      ...options,
      onClose: dismiss
    });
    
    const id = setTimeout(() => {
      setActiveToast(null);
      setTimeoutId(null);
    }, options.duration || 5000);
    
    setTimeoutId(id);
  }, [dismiss, timeoutId]);
  
  React.useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);
  
  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      {activeToast && <Toast {...activeToast} />}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export { Toast }; 