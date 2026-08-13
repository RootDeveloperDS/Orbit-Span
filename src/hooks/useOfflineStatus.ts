import { useEffect, useState } from "react";

export type ServiceWorkerStatus = "unsupported" | "pending" | "ready" | "failed";

export interface OfflineStatus {
  online: boolean;
  serviceWorker: ServiceWorkerStatus;
}

/**
 * Tracks connectivity and service-worker registration.
 * Offline support depends on the browser actually supporting service workers,
 * so the status is reported honestly rather than guaranteed.
 */
export function useOfflineStatus(): OfflineStatus {
  const [online, setOnline] = useState(true);
  const [serviceWorker, setServiceWorker] = useState<ServiceWorkerStatus>("pending");

  useEffect(() => {
    setOnline(navigator.onLine);
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    let cancelled = false;
    if (!("serviceWorker" in navigator)) {
      setServiceWorker("unsupported");
    } else {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => {
          if (!cancelled) setServiceWorker("ready");
        })
        .catch((error: unknown) => {
          console.warn("Service worker registration failed", error);
          if (!cancelled) setServiceWorker("failed");
        });
    }

    return () => {
      cancelled = true;
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return { online, serviceWorker };
}
