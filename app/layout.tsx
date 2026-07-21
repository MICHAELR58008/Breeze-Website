import React from "react"
import type { Metadata, Viewport } from "next"
import { Instrument_Sans, Instrument_Serif, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const instrumentSans = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument" })
const instrumentSerif = Instrument_Serif({ subsets: ["latin"], weight: "400", variable: "--font-instrument-serif" })
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" })

export const metadata: Metadata = {
  title: "Breeze Cleaning | Professional Cleaning in Ventura County",
  description: "Owner-led deep and regular home cleaning in Ventura County, CA. Request a personalized free quote from Breeze Cleaning.",
  generator: "v0.app",
  keywords: ["home cleaning", "Ventura County", "deep cleaning", "regular cleaning"],
}

export const viewport: Viewport = {
  themeColor: "#eaf4f9",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className="bg-background"><body className={`${instrumentSans.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} font-sans antialiased`}>{children}<Toaster richColors /><Analytics /></body></html>
}
