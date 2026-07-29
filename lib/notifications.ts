import { Resend } from "resend"
import { formatPrice } from "@/lib/pricing"

interface BookingData {
  requestId: string
  serviceType: string
  bedrooms: number
  bathrooms: number
  addOns: string[]
  customFields: Record<string, any>
  estimateCents: number | null
  estimateStatus: string
  preferredDate: string
  preferredWindow: string
  customerName: string
  customerEmail: string
  customerPhone: string
  photoPathnames: string[]
}

const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null

const notificationEmail = process.env.NOTIFICATION_EMAIL || ""
const fromAddress = process.env.RESEND_FROM || "onboarding@resend.dev"

const airtableApiKey = process.env.AIRTABLE_API_KEY
const airtableBaseId = process.env.AIRTABLE_BASE_ID
const airtableTableName = process.env.AIRTABLE_TABLE_NAME || "Bookings"

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
    })
  } catch {
    return dateStr
  }
}

function addOnsList(addOns: string[]): string {
  if (!addOns || addOns.length === 0) return "None"
  return addOns.map((a) => `• ${a}`).join("<br>")
}

export async function sendBookingEmail(data: BookingData): Promise<void> {
  if (!resend) return
  if (!notificationEmail) return

  const estimateDisplay = data.estimateCents !== null
    ? formatPrice(data.estimateCents)
    : "Custom quote required"

  try {
    await resend.emails.send({
      from: `Breeze Website <${fromAddress}>`,
      to: [notificationEmail],
      subject: `New Booking Lead — ${data.customerName}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <h2 style="margin-bottom:4px;">New Booking Request</h2>
          <p style="color:#666;margin-top:0;">${formatDate(data.preferredDate)}</p>
          <hr>

          <h3>Customer</h3>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:4px 0;color:#666;">Name</td><td><strong>${data.customerName}</strong></td></tr>
            <tr><td style="padding:4px 0;color:#666;">Email</td><td><strong>${data.customerEmail}</strong></td></tr>
            <tr><td style="padding:4px 0;color:#666;">Phone</td><td><strong>${data.customerPhone}</strong></td></tr>
          </table>
          <hr>

          <h3>Service Details</h3>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:4px 0;color:#666;">Service</td><td><strong>${data.serviceType}</strong></td></tr>
            <tr><td style="padding:4px 0;color:#666;">Bedrooms</td><td><strong>${data.bedrooms}</strong></td></tr>
            <tr><td style="padding:4px 0;color:#666;">Bathrooms</td><td><strong>${data.bathrooms}</strong></td></tr>
            <tr><td style="padding:4px 0;color:#666;">Estimate</td><td><strong>${estimateDisplay}</strong></td></tr>
            <tr><td style="padding:4px 0;color:#666;">Add-ons</td><td>${addOnsList(data.addOns)}</td></tr>
          </table>
          <hr>

          <h3>Schedule</h3>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:4px 0;color:#666;">Preferred Date</td><td><strong>${formatDate(data.preferredDate)}</strong></td></tr>
            <tr><td style="padding:4px 0;color:#666;">Time Window</td><td><strong>${data.preferredWindow}</strong></td></tr>
          </table>
          <hr>

          <p style="color:#999;font-size:12px;">
            Request ID: ${data.requestId}<br>
            Photos: ${data.photoPathnames.length} uploaded
          </p>
        </div>
      `,
    })
  } catch (error) {
    console.error("Failed to send booking email notification:", error)
  }
}

export async function syncToAirtable(data: BookingData): Promise<void> {
  if (!airtableApiKey || !airtableBaseId) return

  const estimateDisplay = data.estimateCents !== null
    ? formatPrice(data.estimateCents)
    : "Custom quote"

  try {
    await fetch(
      `https://api.airtable.com/v0/${airtableBaseId}/${encodeURIComponent(airtableTableName)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${airtableApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          records: [
            {
              fields: {
                "Request ID": data.requestId,
                "Date": new Date().toISOString().split("T")[0],
                "Customer Name": data.customerName,
                "Email": data.customerEmail,
                "Phone": data.customerPhone,
                "Service": data.serviceType,
                "Bedrooms": data.bedrooms,
                "Bathrooms": data.bathrooms,
                "Add-ons": data.addOns.join(", "),
                "Estimate": estimateDisplay,
                "Status": "New",
                "Preferred Date": data.preferredDate,
                "Time Window": data.preferredWindow,
              },
            },
          ],
        }),
      }
    )
  } catch (error) {
    console.error("Failed to sync booking to Airtable:", error)
  }
}
