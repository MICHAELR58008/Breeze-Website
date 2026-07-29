import { Suspense } from "react"
import { BookingProvider } from "@/components/booking/booking-drawer"
import { fetchBookingContent } from "@/lib/booking-content"
import ThankYouClient from "./thank-you-client"

export const dynamic = "force-dynamic"

export default async function ThankYouPage() {
  const bookingResult = await fetchBookingContent()
  return (
    <BookingProvider content={bookingResult.content} tina={bookingResult.tina}>
      <Suspense>
        <ThankYouClient />
      </Suspense>
    </BookingProvider>
  )
}
