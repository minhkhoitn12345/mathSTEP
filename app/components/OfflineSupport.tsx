"use client";

import { useEffect, useState } from "react";

export default function OfflineSupport() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
      void navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!offline) return null;
  return <div role="status" className="fixed bottom-3 left-3 z-[100] max-w-[min(22rem,calc(100vw-1.5rem))] rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-950 shadow-lg">
    Đang ngoại tuyến. Các bài đã mở có thể tiếp tục xem; trợ lý AI và đồng bộ tài khoản cần mạng.
  </div>;
}
