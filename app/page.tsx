import { BookingProvider } from "@/components/booking/booking-drawer"
import { BreezeSite } from "@/components/breeze-site"
import { HomePageClient } from "./page-client"
import { fetchPageData } from "@/lib/queries"
import { fetchBookingContent } from "@/lib/booking-content"

export const dynamic = "force-dynamic"

export default async function Home() {
  const { tina, sections, navigation } = await fetchPageData()
  const bookingResult = await fetchBookingContent()

  return (
    <BookingProvider
      content={bookingResult.content}
      tina={bookingResult.tina}
    >
      <main className="min-h-screen overflow-x-hidden">
        {tina ? (
          <HomePageClient tina={tina} navigation={navigation} />
        ) : (
          <BreezeSite sections={sections} navigation={navigation} />
        )}
      </main>
    </BookingProvider>
  )
}
