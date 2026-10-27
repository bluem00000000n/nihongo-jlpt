import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#FAF9F5",
};

export const metadata: Metadata = {
  title: "nihongo-jlpt (日本語) - 대화하며 JLPT 1급(N1) 합격까지",
  description: "대화하며 JLPT 1급(N1) 합격까지! 모바일 맞춤형 AI 일본어 회화 및 급수별 실전 학습 도구",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "nihongo-jlpt",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
