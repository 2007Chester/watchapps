
import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "WatchApps Dev Console",
  description: "Developer console for WatchApps marketplace",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-slate-950 text-slate-50">
        {children}
      </body>
    </html>
  );
}
