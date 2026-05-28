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
  title: "3rip Admin | Control Center",
  description: "Advanced management portal for the 3rip Taxi Super App.",
};

import QueryProvider from "@/components/providers/query-provider";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-full bg-slate-50 text-slate-900 flex flex-col`}>
        <QueryProvider>
          {children}
          <Toaster theme="light" position="top-right" />
        </QueryProvider>
      </body>
    </html>
  );
}
