"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AuthCallbackPage() {
  const [message, setMessage] = useState("Đang xác nhận phiên đăng nhập…");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const params = new URLSearchParams(window.location.hash.slice(1));
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      const code = new URLSearchParams(window.location.search).get("code");
      const error = params.get("error_description") ?? new URLSearchParams(window.location.search).get("error_description");
      if (error) {
        setMessage("Đăng nhập chưa thành công. Hãy thử lại hoặc dùng email và mật khẩu.");
        return;
      }
      if ((!accessToken || !refreshToken) && !code) {
        setMessage("Liên kết xác nhận không hợp lệ hoặc đã hết hạn. Hãy đăng nhập hoặc yêu cầu gửi lại email.");
        return;
      }
      const response = await fetch("/api/auth/oauth-session", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(code ? { code } : { access_token: accessToken, refresh_token: refreshToken, expires_in: Number(params.get("expires_in")) || 3600 }),
      }).catch(() => null);
      if (cancelled) return;
      if (response?.ok) window.location.replace("/");
      else setMessage("Chưa xác nhận được phiên. Hãy quay lại và đăng nhập.");
    })();
    return () => { cancelled = true; };
  }, []);

  return <main className="auth-utility-page"><div className="auth-utility-card"><span className="login-kicker">MATHSTEP</span><h1>Đang hoàn tất</h1><p role="status">{message}</p><Link className="primary-button" href="/">Về trang đăng nhập</Link></div></main>;
}
