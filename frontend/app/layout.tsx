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
    default: "OPTIMATH LAB · Phòng Thí Nghiệm Toán Học Tương Tác & Socratic AI",
    template: "%s | OPTIMATH LAB",
  },
  description:
    "Phòng thí nghiệm Toán học trực quan 2D Oxy, mô phỏng quy hoạch tuyến tính và Trợ lý Socratic AI chuẩn GDPT 2018.",
  keywords: [
    "OPTIMATH LAB",
    "Toán 10",
    "Bất phương trình bậc nhất hai ẩn",
    "Hệ bất phương trình",
    "Quy hoạch tuyến tính",
    "Socratic AI",
    "GDPT 2018",
  ],
  authors: [{ name: "OPTIMATH LAB", url: "https://mathstep-vn.vercel.app" }],
  creator: "OPTIMATH LAB Team",
  publisher: "OPTIMATH LAB",
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "https://mathstep-vn.vercel.app",
    siteName: "OPTIMATH LAB",
    title: "OPTIMATH LAB · Phòng Thí Nghiệm Toán Học Tương Tác & Socratic AI",
    description:
      "Học bằng thao tác, hiểu bằng lập luận: 5 Module trực quan hoá Bất phương trình & Quy hoạch tuyến tính cùng Trợ lý Socratic AI.",
  },
  twitter: {
    card: "summary_large_image",
    title: "OPTIMATH LAB · Phòng Thí Nghiệm Toán Học Tương Tác",
    description:
      "Khám phá miền nghiệm, trực quan hóa 2D Oxy và đồng hành cùng Trợ lý Socratic AI chuẩn GDPT 2018.",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "OPTIMATH LAB",
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
      </body>
    </html>
  );
}
