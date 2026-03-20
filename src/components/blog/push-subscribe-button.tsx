"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff } from "lucide-react";

export function PushSubscribeButton() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      // Check existing subscription
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          setIsSubscribed(!!sub);
        });
      });
    }
  }, []);

  if (!isSupported) return null;

  async function handleToggle() {
    setIsLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;

      if (isSubscribed) {
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await fetch("/api/push", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ endpoint: sub.endpoint }),
          });
          await sub.unsubscribe();
        }
        setIsSubscribed(false);
      } else {
        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidKey) return;

        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        });

        await fetch("/api/push", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sub.toJSON()),
        });
        setIsSubscribed(true);
      }
    } catch (err) {
      console.error("Push subscription error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className="flex items-center gap-2 text-xs text-muted-foreground hover:text-neon transition-colors px-3 py-1.5 rounded-lg border border-border hover:border-neon/30 disabled:opacity-50"
    >
      {isSubscribed ? <BellOff size={12} /> : <Bell size={12} />}
      {isLoading
        ? "..."
        : isSubscribed
        ? "Изключи известия"
        : "Получавай известия"}
    </button>
  );
}

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) arr[i] = raw.charCodeAt(i);
  return arr.buffer as ArrayBuffer;
}
