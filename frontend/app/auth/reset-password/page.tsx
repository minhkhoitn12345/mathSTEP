"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [accessToken, setAccessToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    setAccessToken(params.get("access_token") ?? "");
    if (params.get("error_description")) setError("Liên kết đã hết hạn hoặc không hợp lệ. Hãy yêu cầu email đặt lại mới.");
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setNotice("");
    if (!accessToken) { setError("Không tìm thấy phiên đặt lại mật khẩu. Hãy mở liên kết trong email mới nhất."); return; }
    if (password.length < 6) { setError("Mật khẩu cần có ít nhất 6 ký tự."); return; }
    if (password !== confirmation) { setError("Hai mật khẩu chưa khớp nhau."); return; }
    setBusy(true);
    try {
      const response = await fetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ access_token: accessToken, password }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.detail?.message ?? "Chưa đổi được mật khẩu.");
      setNotice("Mật khẩu đã được cập nhật. Em có thể đăng nhập lại."); setPassword(""); setConfirmation(""); setAccessToken("");
      window.history.replaceState(null, "", window.location.pathname);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Đã có lỗi. Hãy thử lại."); }
    finally { setBusy(false); }
  }

  return <main className="auth-utility-page"><div className="auth-utility-card"><span className="login-kicker">KHÔI PHỤC TÀI KHOẢN</span><h1>Đặt mật khẩu mới</h1><p>Chọn mật khẩu mới có ít nhất 6 ký tự để tiếp tục hành trình học.</p><form className="login-form" onSubmit={submit}><label>Mật khẩu mới<input type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={6} required disabled={busy || !accessToken} /></label><label>Nhập lại mật khẩu<input type="password" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required disabled={busy || !accessToken} /></label>{error && <p className="inline-error" role="alert">{error}</p>}{notice && <p className="auth-notice" role="status">{notice}</p>}<button className="primary-button" disabled={busy || !accessToken}>{busy ? "Đang cập nhật…" : "Lưu mật khẩu mới"}</button></form><Link className="auth-utility-link" href="/">Quay lại đăng nhập</Link></div></main>;
}
