import { BookingProvider } from "@/components/booking/booking-drawer"
import { fetchBookingContent } from "@/lib/booking-content"
import { Sparkles } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function BookingPreviewPage() {
  const bookingResult = await fetchBookingContent()

  return (
    <BookingProvider
      content={bookingResult.content}
      tina={bookingResult.tina}
    >
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="inline-flex size-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 mb-4 shadow-sm">
            <Sparkles className="size-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Booking Sheet Editor</h1>
          <p className="text-slate-500 max-w-md mx-auto">
            You are currently in the dedicated preview environment for the booking sheet. The drawer should automatically open for editing.
          </p>
          <div className="pt-4">
             {/* We use a hidden button or just let the drawer open natively via the previewOpen toggle */}
          </div>
        </div>
      </main>
    </BookingProvider>
  )
}
