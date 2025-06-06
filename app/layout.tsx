import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "../components/ThemeProvider";
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
  title: "Voice 2 Issue",
  description: "音声からGitHub Issueを自動生成",
  keywords: ["GitHub", "Issue", "音声認識", "Claude", "AI"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full bg-gradient-to-br from-main-light/20 to-white dark:from-navy-primary dark:to-navy-secondary text-main-primary dark:text-main-light`}
      >
        <ThemeProvider defaultTheme="light" storageKey="voice2issue-theme">
          <div className="min-h-full flex flex-col">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
