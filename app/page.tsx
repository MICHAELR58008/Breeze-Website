import { BookingProvider } from "@/components/booking/booking-drawer"
import { BreezeSite } from "@/components/breeze-site"
import { fetchPageSections } from "@/lib/queries"

export default async function Home() {
  const sections = await fetchPageSections()

  return (
    <BookingProvider>
      <main className="min-h-screen overflow-x-hidden">
        <BreezeSite sections={sections} />
      </main>
    </BookingProvider>
  )
}
