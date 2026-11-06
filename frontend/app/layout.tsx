import type { Metadata } from "next";
import "./globals.css";
import "katex/dist/katex.min.css";

export const metadata: Metadata = {
  title: "MathSTEP · Học Toán cùng bạn",
  description: "Linh vật AI đồng hành để em khám phá, kiểm chứng và hiểu Toán.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body>{children}</body></html>;
}
