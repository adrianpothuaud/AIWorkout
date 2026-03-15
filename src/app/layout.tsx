import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "AIWorkout – AI-Powered Workout Planner",
  description: "Plan and track your workouts with AI-powered assistance using Google Gemini",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AIWorkout",
  },
  icons: {
    apple: "/icons/icon-192x192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#6366f1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans bg-slate-950 text-slate-100 min-h-screen">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 pt-4 pb-24 md:pt-20 md:pb-8">
          {children}
        </main>
      </body>
    </html>
  );
}
