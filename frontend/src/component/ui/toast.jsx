import * as React from "react";
import { Toaster as SonnerToaster } from "sonner";

// The styled toaster component that will be used at the application root level
export function Toaster(props) {
  const { ...rest } = props;

  return (
    <SonnerToaster
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          title: "group-[.toast]:text-foreground text-sm font-semibold",
          description: "group-[.toast]:text-muted-foreground text-sm",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          error:
            "group-[.toaster]:bg-destructive group-[.toaster]:text-destructive-foreground group-[.toaster]:border-destructive",
          success:
            "group-[.toaster]:bg-green-50 group-[.toaster]:border-green-200 group-[.toaster]:text-green-800",
          warning:
            "group-[.toaster]:bg-amber-50 group-[.toaster]:border-amber-200 group-[.toaster]:text-amber-800",
          info:
            "group-[.toaster]:bg-blue-50 group-[.toaster]:border-blue-200 group-[.toaster]:text-blue-800",
        },
      }}
      {...rest}
    />
  );
}

// The toast function that will be used to trigger toasts from anywhere in the app
export const toast = (props) => {
  const { title, description, variant, ...rest } = props;
  
  // Import sonner dynamically to avoid SSR issues
  return import("sonner").then((sonner) => {
    const { toast } = sonner;
    
    // Handle different variants
    switch (variant) {
      case "destructive":
        return toast.error(title, {
          description,
          ...rest,
        });
      case "success":
        return toast.success(title, {
          description,
          ...rest,
        });
      case "warning":
        return toast(title, {
          description,
          ...rest,
          className: "warning",
        });
      case "info":
        return toast(title, {
          description,
          ...rest,
          className: "info",
        });
      default:
        return toast(title, {
          description,
          ...rest,
        });
    }
  });
};

// Also export a direct function to create toast with a promise
export const promiseToast = async (promise, msgs, opts = {}) => {
  return import("sonner").then(({ toast }) => {
    return toast.promise(promise, msgs, opts);
  });
};
