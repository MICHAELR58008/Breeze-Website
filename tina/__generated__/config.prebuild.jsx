// tina/config.ts
import { defineConfig } from "tinacms";
var branch = process.env.GITHUB_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || process.env.HEAD || "main";
var config_default = defineConfig({
  branch,
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID || "local-dev",
  token: process.env.TINA_TOKEN || "local-dev-token",
  build: {
    outputFolder: "admin",
    publicFolder: "public"
  },
  media: {
    tina: {
      mediaRoot: "uploads",
      publicFolder: "public"
    }
  },
  schema: {
    collections: [
      {
        name: "page",
        label: "Page",
        path: "content/page",
        format: "json",
        ui: {
          router: () => "/",
          allowedActions: {
            create: false,
            delete: false
          }
        },
        fields: [
          {
            type: "object",
            name: "sections",
            label: "Page Sections",
            description: "Add, remove, and reorder page sections",
            list: true,
            ui: {
              visualSelector: true
            },
            templates: [
              {
                name: "hero",
                label: "Hero",
                ui: {
                  previewSrc: "",
                  defaultItem: {
                    location: "Ventura County, CA",
                    headingLine1: "A cleaner home.",
                    headingLine2: "A lighter life.",
                    subheading: "Professional Cleaning Services",
                    phoneNumber: "(805) 760-8765",
                    calloutTitle: "Care you can feel",
                    calloutText: "Every surface considered. Every room treated like our own.",
                    proofs: [
                      { value: "24 hr", label: "Response time" },
                      { value: "Local", label: "Owner-led team" },
                      { value: "Free", label: "Personalized quote" }
                    ],
                    heroImage: "/images/breeze-clean-home.png"
                  }
                },
                fields: [
                  { type: "string", name: "location" },
                  { type: "string", name: "headingLine1" },
                  { type: "string", name: "headingLine2" },
                  { type: "string", name: "subheading" },
                  { type: "string", name: "phoneNumber" },
                  { type: "string", name: "calloutTitle" },
                  { type: "string", name: "calloutText" },
                  {
                    type: "object",
                    name: "proofs",
                    label: "Proof Badges",
                    list: true,
                    fields: [
                      { type: "string", name: "value" },
                      { type: "string", name: "label" }
                    ]
                  },
                  { type: "image", name: "heroImage", label: "Hero Image" }
                ]
              },
              {
                name: "services",
                label: "Services",
                ui: {
                  defaultItem: {
                    eyebrow: "01 / Our services",
                    heading: "Clean, your way.",
                    copy: "Professional cleaning tailored to your home \u2014 because your time matters.",
                    disclaimer: "either through an in-person visit or by sending 3\u20135 photos/videos. This ensures you receive a fair and accurate price."
                  }
                },
                fields: [
                  { type: "string", name: "eyebrow" },
                  { type: "string", name: "heading" },
                  { type: "string", name: "copy" },
                  { type: "string", name: "disclaimer" }
                ]
              },
              {
                name: "process",
                label: "Process",
                ui: {
                  defaultItem: {
                    eyebrow: "02 / How it works",
                    heading: "Simple from start to shine.",
                    copy: "A compact quote flow designed around your home\u2014not a generic one-price-fits-all form.",
                    steps: [
                      { number: "01", title: "Choose your clean", description: "Select deep or regular cleaning, then tell us about your bedrooms and bathrooms." },
                      { number: "02", title: "Share the details", description: "Add extras and, if you would like, securely upload photos for a more accurate quote." },
                      { number: "03", title: "Request a time", description: "Pick your preferred date and a morning, afternoon, or flexible time window." },
                      { number: "04", title: "We confirm", description: "Breeze reviews your request and gets back to you within 24 hours with availability and final pricing." }
                    ]
                  }
                },
                fields: [
                  { type: "string", name: "eyebrow" },
                  { type: "string", name: "heading" },
                  { type: "string", name: "copy" },
                  {
                    type: "object",
                    name: "steps",
                    label: "Steps",
                    list: true,
                    fields: [
                      { type: "string", name: "number" },
                      { type: "string", name: "title" },
                      { type: "string", name: "description" }
                    ]
                  }
                ]
              },
              {
                name: "about",
                label: "About",
                ui: {
                  defaultItem: {
                    eyebrow: "03 / Meet the owner",
                    ownerName: "Evelyn Rivas",
                    nameInitial: "E",
                    tagline: "Owner-led care in Ventura County.",
                    bioParagraph1: "Evelyn started Breeze because she believes a clean home shouldn't feel like a luxury. Based in Ventura County, she and her team treat every home like their own \u2014 with care, attention to detail, and a genuine pride in making spaces shine.",
                    bioParagraph2: "When you book with Breeze, you're not just getting a clean home \u2014 you're getting someone who truly cares about getting it right."
                  }
                },
                fields: [
                  { type: "string", name: "eyebrow" },
                  { type: "string", name: "ownerName" },
                  { type: "string", name: "nameInitial" },
                  { type: "string", name: "tagline" },
                  { type: "string", name: "bioParagraph1" },
                  { type: "string", name: "bioParagraph2" }
                ]
              },
              {
                name: "testimonials",
                label: "Testimonials",
                ui: {
                  defaultItem: {
                    eyebrow: "04 / Testimonials",
                    heading: "Care that shows.",
                    copy: "This section is ready for your real customer feedback. The reviews below are clearly labeled sample content.",
                    reviews: [
                      { quote: "The house felt completely refreshed, and every detail was handled with care.", byline: "Sample review \xB7 Replace with customer name" },
                      { quote: "Clear communication, thoughtful service, and a result we were proud to come home to.", byline: "Sample review \xB7 Replace with customer name" },
                      { quote: "Breeze made the whole process feel easy from the first quote to the final walkthrough.", byline: "Sample review \xB7 Replace with customer name" }
                    ]
                  }
                },
                fields: [
                  { type: "string", name: "eyebrow" },
                  { type: "string", name: "heading" },
                  { type: "string", name: "copy" },
                  {
                    type: "object",
                    name: "reviews",
                    label: "Reviews",
                    list: true,
                    fields: [
                      { type: "string", name: "quote" },
                      { type: "string", name: "byline" }
                    ]
                  }
                ]
              },
              {
                name: "contact",
                label: "Contact",
                ui: {
                  defaultItem: {
                    eyebrow: "05 / Get in touch",
                    heading: "We'd love to hear from you.",
                    address: "Ventura County, CA",
                    phone: "(805) 760-8765",
                    phoneHref: "tel:+18057608765",
                    email: "sacrementado27@gmail.com",
                    emailHref: "mailto:sacrementado27@gmail.com",
                    hours: "We reply within 24 hours"
                  }
                },
                fields: [
                  { type: "string", name: "eyebrow" },
                  { type: "string", name: "heading" },
                  { type: "string", name: "address" },
                  { type: "string", name: "phone" },
                  { type: "string", name: "phoneHref" },
                  { type: "string", name: "email" },
                  { type: "string", name: "emailHref" },
                  { type: "string", name: "hours" }
                ]
              },
              {
                name: "footer",
                label: "Footer",
                ui: {
                  defaultItem: {
                    tagline: "Professional cleaning services in Ventura County, California."
                  }
                },
                fields: [
                  { type: "string", name: "tagline" }
                ]
              }
            ]
          }
        ]
      },
      {
        name: "pricing",
        label: "Pricing",
        path: "content/pricing",
        format: "json",
        ui: {
          allowedActions: {
            create: false,
            delete: false
          }
        },
        fields: [
          {
            type: "object",
            name: "deep",
            label: "Deep Cleaning",
            fields: [
              { type: "string", name: "name" },
              { type: "string", name: "description" },
              { type: "string", name: "subtitle" },
              { type: "string", name: "features", list: true },
              {
                type: "object",
                name: "prices",
                label: "Prices",
                list: true,
                fields: [
                  { type: "string", name: "key" },
                  { type: "string", name: "bedrooms" },
                  { type: "string", name: "bathrooms" },
                  { type: "number", name: "cents" }
                ]
              }
            ]
          },
          {
            type: "object",
            name: "regular",
            label: "Regular Cleaning",
            fields: [
              { type: "string", name: "name" },
              { type: "string", name: "description" },
              { type: "string", name: "subtitle" },
              { type: "string", name: "features", list: true },
              {
                type: "object",
                name: "prices",
                label: "Prices",
                list: true,
                fields: [
                  { type: "string", name: "key" },
                  { type: "string", name: "bedrooms" },
                  { type: "string", name: "bathrooms" },
                  { type: "number", name: "cents" }
                ]
              }
            ]
          },
          {
            type: "object",
            name: "addOns",
            label: "Add-ons",
            list: true,
            fields: [
              { type: "string", name: "id" },
              { type: "string", name: "name" },
              { type: "number", name: "cents" }
            ]
          }
        ]
      }
    ]
  }
});
export {
  config_default as default
};
