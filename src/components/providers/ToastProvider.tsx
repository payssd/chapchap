"use client";

import { Toaster } from "@/components/ui/sonner";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        classNames: {
          error: "bg-red-50 border-red-200 text-red-800",
          success: "bg-green-50 border-green-200 text-green-800",
          warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
          info: "bg-blue-50 border-blue-200 text-blue-800",
        },
      }}
    />
  );
}
