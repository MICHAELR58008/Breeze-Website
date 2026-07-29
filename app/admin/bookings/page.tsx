"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, RefreshCw, Eye, Mail, Phone } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Booking {
  id: string
  serviceType: string
  bedrooms: number
  bathrooms: number
  addOns: string[]
  estimateCents: number | null
  estimateStatus: string
  preferredDate: string
  preferredWindow: string
  customerName: string
  customerEmail: string
  customerPhone: string
  photoPathnames: string[]
  status: string
  createdAt: string
}

export default function BookingsPage() {
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState<Booking[]>([])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/bookings")
      if (!res.ok) throw new Error("Failed to load bookings")
      const data = await res.json()
      setBookings(data.bookings || [])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error fetching bookings")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  const statusStyle = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/50"
      case "contacted":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/50"
      case "completed":
        return "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/50"
      default:
        return "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/50"
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <RefreshCw className="size-8 animate-spin text-primary" />
          <p className="font-medium text-sm">Loading booking requests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/20 p-4 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
          <div>
            <div className="flex items-center gap-3">
              <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="size-3.5" /> Back to Site
              </Link>
              <span className="text-muted-foreground/40">•</span>
              <Link href="/admin/pricing" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                Pricing Hub
              </Link>
            </div>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Booking Requests
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              View recent customer submission requests.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-1.5 py-1">
              {bookings.length} {bookings.length === 1 ? "request" : "requests"}
            </Badge>
            <Button variant="outline" size="sm" onClick={fetchBookings} className="gap-1.5">
              <RefreshCw className="size-4" /> Refresh
            </Button>
          </div>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Eye className="size-5 text-primary" /> All Submissions
            </CardTitle>
            <CardDescription>
              Showing the most recent {bookings.length} booking request{bookings.length !== 1 ? "s" : ""}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <p className="text-sm">No booking requests yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/50 text-xs uppercase text-muted-foreground font-mono">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Service</th>
                      <th className="px-4 py-3">Home</th>
                      <th className="px-4 py-3">Schedule</th>
                      <th className="px-4 py-3">Estimate</th>
                      <th className="px-4 py-3">Photos</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card">
                    {bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-4 whitespace-nowrap text-muted-foreground text-xs">
                          {format(new Date(b.createdAt), "MMM d, yyyy")}
                        </td>
                        <td className="p-4">
                          <div className="font-medium">{b.customerName}</div>
                          <div className="mt-0.5 space-y-0.5">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Mail className="size-3 shrink-0" /> {b.customerEmail}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Phone className="size-3 shrink-0" /> {b.customerPhone}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 capitalize">{b.serviceType}</td>
                        <td className="p-4 whitespace-nowrap">
                          {b.bedrooms} bed / {b.bathrooms} bath
                          {b.addOns.length > 0 && (
                            <div className="text-xs text-muted-foreground mt-0.5">
                              +{b.addOns.length} add-on{b.addOns.length !== 1 ? "s" : ""}
                            </div>
                          )}
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <div>{b.preferredDate}</div>
                          <div className="text-xs text-muted-foreground capitalize">{b.preferredWindow}</div>
                        </td>
                        <td className="p-4 whitespace-nowrap font-mono text-xs">
                          {b.estimateCents !== null && b.estimateCents > 0
                            ? `$${(b.estimateCents / 100).toFixed(2)}`
                            : <span className="text-amber-600 dark:text-amber-400">Custom quote</span>
                          }
                        </td>
                        <td className="p-4 text-center text-xs">
                          {b.photoPathnames.length > 0
                            ? `${b.photoPathnames.length} photo${b.photoPathnames.length !== 1 ? "s" : ""}`
                            : <span className="text-muted-foreground">—</span>
                          }
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className={`text-xs ${statusStyle(b.status)}`}>
                            {b.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
