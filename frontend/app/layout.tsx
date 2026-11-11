import type { Metadata, Viewport } from "next";
import OfflineSupport from "./components/OfflineSupport";
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
  metadataBase: new URL("https://mathstep.click"),
  title: {
    default: "MathSTEP · Học Toán THPT qua bài học và mô phỏng tương tác",
    template: "%s | MathSTEP",
  },
  description:
    "Học Toán THPT qua bài học có hướng dẫn, mô phỏng trực quan và trợ lý học tập theo chương trình GDPT 2018.",
  keywords: [
    "MathSTEP",
    "Toán 10",
    "Bất phương trình bậc nhất hai ẩn",
    "Hệ bất phương trình",
    "Quy hoạch tuyến tính",
    "Socratic AI",
    "GDPT 2018",
  ],
  authors: [{ name: "MathSTEP", url: "https://mathstep.click" }],
  creator: "MathSTEP",
  publisher: "MathSTEP",
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "https://mathstep.click",
    siteName: "MathSTEP",
    title: "MathSTEP · Học Toán THPT qua bài học và mô phỏng tương tác",
    description:
      "Học Toán 10 và 11 qua ba chuyên đề: bất phương trình và quy hoạch tuyến tính, hình học không gian, lượng giác.",
  },
  twitter: {
    card: "summary_large_image",
    title: "MathSTEP · Học Toán THPT qua mô phỏng tương tác",
    description:
      "Khám phá miền nghiệm, trực quan hóa 2D Oxy và đồng hành cùng Trợ lý Socratic AI chuẩn GDPT 2018.",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MathSTEP",
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
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
      <body className="font-sans antialiased bg-slate-50 text-slate-900 selection:bg-blue-600/30 selection:text-blue-900 max-w-full overflow-x-clip">
        {children}
        <OfflineSupport />
      </body>
    </html>
  );
}
