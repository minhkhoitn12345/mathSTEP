import type { Metadata, Viewport } from "next";
import "./globals.css";
import "katex/dist/katex.min.css";

export const metadata: Metadata = {
  title: "MathSTEP · Nền tảng Học liệu số Toán học THPT 3D/AR & Socratic AI",
  description: "Dự án Nghiên cứu KHKT: Hệ thống học liệu số tương tác 8 bước nhận thức, mô phỏng 2D/3D & AR và Trợ lý Socratic kiểm chứng tất định chuẩn SGK Kết nối tri thức.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MathSTEP",
  },
};

export const viewport: Viewport = {
  themeColor: "#087e7c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>{children}</body>
    </html>
  );
}
