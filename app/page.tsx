import { BookingProvider } from "@/components/booking/booking-drawer"
import { BreezeSite } from "@/components/breeze-site"
import { HomePageClient } from "./page-client"
import { fetchPageData } from "@/lib/queries"

export default async function Home() {
  const { tina, sections } = await fetchPageData()

  return (
    <BookingProvider>
      <main className="min-h-screen overflow-x-hidden">
        {tina ? (
          <HomePageClient tina={tina} />
        ) : (
          <BreezeSite sections={sections} />
        )}
      </main>
    </BookingProvider>
  )
}
