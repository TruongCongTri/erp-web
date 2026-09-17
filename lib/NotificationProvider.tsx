"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { gooeyToast } from "@/components/ui/goey-toaster";

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    // 1. Initialize WebSocket connection
    // const socket = io(process.env.NEXT_PUBLIC_WS_URL, { withCredentials: true });

    // Mocking the websocket event for demonstration
    const handleNotification = (event: any) => {
      // 2. Show client-side toast
      gooeyToast.info(`New Alert: ${event.message}`);
      
      // 3. THE MAGIC: Soft-refresh the Server Components.
      // This refetches data for Server Components without losing React state 
      // or causing a full page blink.
      router.refresh(); 
    };

    // socket.on("erp_notification", handleNotification);
    
    return () => {
      // socket.disconnect();
    };
  }, [router]);

  return <>{children}</>;
}



