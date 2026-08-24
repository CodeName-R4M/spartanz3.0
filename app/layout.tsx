import { Analytics } from "@vercel/analytics/next"
import type { Metadata, Viewport } from "next"
import { Chakra_Petch, JetBrains_Mono, Orbitron } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { PerfProvider } from "@/components/perf/perf-provider"
import { siteConfig } from "@/lib/site-config"
import "./globals.css"

const _sans = Chakra_Petch({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

const _display = Orbitron({
  subsets: ["latin"],
  weight: ["500", "700", "900"],
  display: "swap",
})

const _mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.symposium} — ${siteConfig.department} Symposium`,
    template: `%s · ${siteConfig.symposium}`,
  },
  description: `${siteConfig.symposium}: ${siteConfig.heroLine} Hosted by ${siteConfig.club}, ${siteConfig.department}, ${siteConfig.college}.`,
  keywords: [
    siteConfig.symposium,
    "symposium",
    "cyber security symposium",
    "technical symposium Chennai",
    siteConfig.college,
    siteConfig.club,
  ],
  generator: "v0.app",
  openGraph: {
    title: `${siteConfig.symposium} — ${siteConfig.subtitle}`,
    description: siteConfig.heroLine,
    type: "website",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#0d0708",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className="antialiased">
        <PerfProvider>{children}</PerfProvider>
        <Toaster position="top-center" />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
