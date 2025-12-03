
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'WatchApps',
  description: 'WatchApps Frontend',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
