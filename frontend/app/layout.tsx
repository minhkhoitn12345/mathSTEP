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
  metadataBase: new URL("https://mathstep-vn.vercel.app"),
  title: {
    default: "MathSTEP · Nền tảng Học liệu số Toán học THPT 3D/AR & Socratic AI",
    template: "%s | MathSTEP",
  },
  description: "Dự án Nghiên cứu KHKT: Hệ thống học liệu số tương tác 8 bước nhận thức, mô phỏng 2D/3D & AR và Trợ lý Socratic kiểm chứng tất định chuẩn SGK Kết nối tri thức.",
  keywords: [
    "Toán THPT",
    "Học liệu số",
    "Hình học không gian 3D",
    "Quy hoạch tuyến tính",
    "Socratic AI",
    "Nghiên cứu KHKT",
    "GDPT 2018",
  ],
  authors: [{ name: "Nguyễn Minh Khôi", url: "https://mathstep-vn.vercel.app" }],
  creator: "MathSTEP Project Team",
  publisher: "MathSTEP Education",
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "https://mathstep-vn.vercel.app",
    siteName: "MathSTEP",
    title: "MathSTEP · Nền tảng Học liệu số Toán học THPT 3D/AR & Socratic AI",
    description: "Học bằng thao tác, hiểu bằng lập luận: Khám phá 48 trạm thực nghiệm số và Trợ giảng Socratic AI chuẩn GDPT 2018.",
  },
  twitter: {
    card: "summary_large_image",
    title: "MathSTEP · Nền tảng Học liệu số Toán học THPT",
    description: "Khám phá 48 trạm thực nghiệm Toán học THPT tương tác 2D/3D & Trợ lý Socratic AI.",
  },
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
      <body className="font-sans antialiased bg-[#0B0F17] text-slate-100 selection:bg-blue-600/30 selection:text-white max-w-full overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
