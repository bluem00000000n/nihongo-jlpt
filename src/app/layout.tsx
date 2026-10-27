import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "nihongo-jlpt (日本語) - 대화하며 JLPT 1급(N1) 합격까지",
  description: "대화하며 JLPT 1급(N1) 합격까지! 실시간 AI 대화 미션, 구술 모의고사, 급수별 핵심 문법, 3단계 섀도잉, 코토모 음성 통화 통합 학습 앱",
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
