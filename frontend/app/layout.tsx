import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Newsreader, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const serif = Newsreader({
  subsets: ["latin", "vietnamese"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "600"],
});

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
  themeColor: "#172b31",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={`${sans.variable} ${serif.variable} ${mono.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="font-sans antialiased bg-[#fbf9f5] text-[#172b31] selection:bg-[#c25e3e26] selection:text-[#a94c2d]">
        {children}
      </body>
    </html>
  );
}
