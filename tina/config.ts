import { defineConfig } from "tinacms"
import { PricingManagerModal } from "./components/PricingManagerModal"
import { FocalPointPicker } from "./components/FocalPointPicker"

const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  "main"

export default defineConfig({
  branch,
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID || "local-dev",
  token: process.env.TINA_TOKEN || "local-dev-token",

  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },

  media: {
    tina: {
      mediaRoot: "uploads",
      publicFolder: "public",
    },
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
            delete: false,
          },
        },
        fields: [
          {
            type: "object",
            name: "sections",
            label: "Page Sections",
            description: "Add, remove, and reorder page sections",
            list: true,
            ui: {
              visualSelector: true,
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
                      { value: "Free", label: "Personalized quote" },
                    ],
                    imageSrc: "/images/breeze-clean-home.png",
                    imageAlt: "A bright, professionally cleaned modern home",
                  },
                },
                fields: [
                  { type: "string", name: "location" },
                  { type: "string", name: "headingLine1" },
                  { type: "number", name: "headingLine1X", ui: { component: "hidden" } },
                  { type: "number", name: "headingLine1Y", ui: { component: "hidden" } },
                  { type: "string", name: "headingLine2" },
                  { type: "number", name: "headingLine2X", ui: { component: "hidden" } },
                  { type: "number", name: "headingLine2Y", ui: { component: "hidden" } },
                  { type: "string", name: "subheading" },
                  { type: "number", name: "subheadingX", ui: { component: "hidden" } },
                  { type: "number", name: "subheadingY", ui: { component: "hidden" } },
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
                      { type: "string", name: "label" },
                    ],
                  },
                  { type: "image", name: "imageSrc", label: "Hero Image" },
                  { type: "string", name: "imageAlt", label: "Image Alt Text" },
                ],
              },
              {
                name: "services",
                label: "Services",
                ui: {
                  defaultItem: {
                    eyebrow: "01 / Our services",
                    heading: "Clean, your way.",
                    copy: "Professional cleaning tailored to your home — because your time matters.",
                    disclaimer: "either through an in-person visit or by sending 3–5 photos/videos. This ensures you receive a fair and accurate price.",
                  },
                },
                fields: [
                  { type: "string", name: "eyebrow" },
                  { type: "string", name: "heading" },
                  { type: "string", name: "copy" },
                  { type: "string", name: "disclaimer" },
                ],
              },
              {
                name: "process",
                label: "Process",
                ui: {
                  defaultItem: {
                    eyebrow: "02 / How it works",
                    heading: "Simple from start to shine.",
                    copy: "A compact quote flow designed around your home—not a generic one-price-fits-all form.",
                    steps: [
                      { number: "01", title: "Choose your clean", description: "Select deep or regular cleaning, then tell us about your bedrooms and bathrooms." },
                      { number: "02", title: "Share the details", description: "Add extras and, if you would like, securely upload photos for a more accurate quote." },
                      { number: "03", title: "Request a time", description: "Pick your preferred date and a morning, afternoon, or flexible time window." },
                      { number: "04", title: "We confirm", description: "Breeze reviews your request and gets back to you within 24 hours with availability and final pricing." },
                    ],
                  },
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
                      { type: "string", name: "description" },
                      { type: "image", name: "image", label: "Image / Icon Photo" },
                    ],
                  },
                ],
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
                    bioParagraph1: "Evelyn started Breeze because she believes a clean home shouldn't feel like a luxury. Based in Ventura County, she and her team treat every home like their own — with care, attention to detail, and a genuine pride in making spaces shine.",
                    bioParagraph2: "When you book with Breeze, you're not just getting a clean home — you're getting someone who truly cares about getting it right.",
                  },
                },
                fields: [
                  { type: "string", name: "eyebrow" },
                  { type: "string", name: "ownerName" },
                  { type: "string", name: "nameInitial" },
                  { type: "string", name: "tagline" },
                  { type: "string", name: "bioParagraph1" },
                  { type: "string", name: "bioParagraph2" },
                  { type: "image", name: "image", label: "Owner Photo" },
                  {
                    type: "string",
                    name: "focalPoint",
                    label: "Photo Crop Focal Point",
                    ui: {
                      component: FocalPointPicker,
                    },
                  },
                ],
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
                      { quote: "The house felt completely refreshed, and every detail was handled with care.", byline: "Sample review · Replace with customer name" },
                      { quote: "Clear communication, thoughtful service, and a result we were proud to come home to.", byline: "Sample review · Replace with customer name" },
                      { quote: "Breeze made the whole process feel easy from the first quote to the final walkthrough.", byline: "Sample review · Replace with customer name" },
                    ],
                  },
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
                      { type: "string", name: "byline" },
                    ],
                  },
                ],
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
                    hours: "We reply within 24 hours",
                  },
                },
                fields: [
                  { type: "string", name: "eyebrow" },
                  { type: "string", name: "heading" },
                  { type: "string", name: "address" },
                  { type: "string", name: "phone" },
                  { type: "string", name: "phoneHref" },
                  { type: "string", name: "email" },
                  { type: "string", name: "emailHref" },
                  { type: "string", name: "hours" },
                ],
              },
              {
                name: "footer",
                label: "Footer",
                ui: {
                  defaultItem: {
                    tagline: "Professional cleaning services in Ventura County, California.",
                  },
                },
                fields: [
                  { type: "string", name: "tagline" },
                ],
              },
            ],
          },
        ],
      },
      {
        name: "booking",
        label: "Booking & Pricing",
        path: "content/booking",
        format: "json",
        ui: {
          router: () => "/preview/booking",
          allowedActions: {
            create: false,
            delete: false,
          },
        },
        fields: [
          {
            type: "string",
            name: "pricingHub",
            label: "Central Pricing Hub (Table & Calculator)",
            ui: {
              component: PricingManagerModal as any,
            },
          },
          {
            type: "boolean",
            name: "previewOpen",
            label: "Preview Drawer Open in Editor (turn on to visually edit)",
          },
          {
            type: "object",
            name: "services",
            label: "Services",
            description: "Add, remove, and reorder services. (Tip: Use /admin/pricing for a dedicated table editor)",
            list: true,
            ui: {
              itemProps: (item) => ({
                label: item?.name || "New Service",
              }),
            },
            fields: [
              { type: "string", name: "id", required: true },
              { type: "string", name: "name", required: true },
              { type: "string", name: "description" },
              { type: "string", name: "subtitle" },
              { type: "string", name: "features", list: true },
              { type: "number", name: "basePriceCents", label: "Base Price in Cents (e.g. 13000 = $130)" },
              { type: "number", name: "pricePerBedroomCents", label: "Price per Bedroom in Cents (e.g. 3000 = $30)" },
              { type: "number", name: "pricePerBathroomCents", label: "Price per Bathroom in Cents (e.g. 3000 = $30)" },
            ],
          },
          {
            type: "object",
            name: "addOns",
            label: "Add-ons",
            description: "Manage optional extras. (Tip: Use /admin/pricing for a dedicated table editor)",
            list: true,
            fields: [
              { type: "string", name: "id" },
              { type: "string", name: "name" },
              { type: "number", name: "cents", label: "Price in Cents (e.g. 3000 = $30)" },
            ],
          },
          {
            type: "object",
            name: "theme",
            label: "Theme & Styling Customizer",
            fields: [
              { type: "string", name: "fontFamily", label: "Font Family", options: ["sans-serif", "serif", "monospace", "Instrument Sans", "Outfit", "Inter"] },
              { type: "string", name: "primaryColor", label: "Primary Accent Color (Hex or CSS color)", ui: { component: "color" } },
              { type: "string", name: "backgroundColor", label: "Drawer Background Color", ui: { component: "color" } },
              { type: "string", name: "textColor", label: "Text Color", ui: { component: "color" } },
              { type: "string", name: "borderRadius", label: "Border Radius", options: ["0px", "4px", "8px", "12px", "9999px"] },
            ],
          },
          {
            type: "object",
            name: "steps",
            label: "Form Steps & Custom Fields Builder",
            list: true,
            ui: {
              itemProps: (item) => ({ label: item?.title || "New Step" }),
            },
            fields: [
              { type: "string", name: "title", label: "Step Title", required: true },
              { type: "string", name: "description", label: "Step Subtitle / Description" },
              { type: "boolean", name: "disabled", label: "Disable / Hide this Step" },
              { type: "string", name: "showIfField", label: "Conditional Visibility: Dependent Field Name (optional)" },
              { type: "string", name: "showIfOperator", label: "Operator", options: ["equals", "not_equals", "contains"] },
              { type: "string", name: "showIfValue", label: "Value to match" },
              {
                type: "object",
                name: "fields",
                label: "Step Inputs & Elements",
                list: true,
                templates: [
                  {
                    name: "textInput",
                    label: "Text Field",
                    fields: [
                      { type: "string", name: "name", label: "Field ID Key" },
                      { type: "string", name: "label", label: "Label Text" },
                      { type: "string", name: "placeholder", label: "Placeholder Text" },
                      { type: "boolean", name: "required", label: "Required Field?" },
                      { type: "string", name: "validationType", label: "Validation Rule", options: ["none", "email", "phone"] },
                    ],
                  },
                  {
                    name: "numberInput",
                    label: "Number Field",
                    fields: [
                      { type: "string", name: "name", label: "Field ID Key" },
                      { type: "string", name: "label", label: "Label Text" },
                      { type: "number", name: "min", label: "Min Value" },
                      { type: "number", name: "max", label: "Max Value" },
                    ],
                  },
                  {
                    name: "choiceInput",
                    label: "Choice Selection",
                    fields: [
                      { type: "string", name: "name", label: "Field ID Key" },
                      { type: "string", name: "label", label: "Label Text" },
                      {
                        type: "object",
                        name: "options",
                        label: "Options",
                        list: true,
                        fields: [
                          { type: "string", name: "id", label: "Option ID" },
                          { type: "string", name: "label", label: "Option Label" },
                        ],
                      },
                    ],
                  },
                  {
                    name: "dateInput",
                    label: "Date Picker",
                    fields: [
                      { type: "string", name: "name", label: "Field ID Key" },
                      { type: "string", name: "label", label: "Label Text" },
                    ],
                  },
                  {
                    name: "photoUpload",
                    label: "Photo Dropzone",
                    fields: [
                      { type: "string", name: "label", label: "Prompt Label" },
                      { type: "string", name: "prompt", label: "Upload Button Text" },
                      { type: "string", name: "hint", label: "Hint Text" },
                      { type: "string", name: "selectedText", label: 'Selected Count Template (use {count} and {s})' },
                      { type: "string", name: "emptyText", label: "Empty State Message" },
                    ],
                  },
                  {
                    name: "richTextHeading",
                    label: "Rich Callout / Note",
                    fields: [
                      { type: "string", name: "text", label: "Text Message" },
                    ],
                  },
                  {
                    name: "servicesSelector",
                    label: "[Special] Services Cards",
                    fields: [
                      { type: "string", name: "question", label: "Question Label" },
                    ],
                  },
                  {
                    name: "addonsSelector",
                    label: "[Special] Add-ons Toggles",
                    fields: [
                      { type: "string", name: "question", label: "Question Label" },
                    ],
                  },
                  {
                    name: "estimateSummary",
                    label: "[Special] Estimate & Review Summary",
                    fields: [
                      { type: "string", name: "disclaimer", label: "Disclaimer Note" },
                    ],
                  },
                  {
                    name: "imageBlock",
                    label: "Image Block",
                    ui: {
                      itemProps: (item) => ({ label: item?.alt || item?.caption || "Image Block" }),
                      defaultItem: { src: "", alt: "", caption: "", aspect: "auto" },
                    },
                    fields: [
                      { type: "image", name: "src", label: "Image Source" },
                      { type: "string", name: "alt", label: "Alt Text" },
                      { type: "string", name: "caption", label: "Caption" },
                      { type: "string", name: "aspect", label: "Aspect Ratio", options: ["auto", "16/9", "4/3", "1/1", "square", "video"] },
                    ],
                  },
                  {
                    name: "infoCard",
                    label: "Info Card",
                    ui: {
                      itemProps: (item) => ({ label: item?.title || "Info Card" }),
                      defaultItem: { title: "", description: "", icon: "info", variant: "default" },
                    },
                    fields: [
                      { type: "string", name: "title", label: "Title" },
                      { type: "string", name: "description", label: "Description", ui: { component: "textarea" } },
                      { type: "string", name: "icon", label: "Icon", options: ["info", "sparkles", "shield", "star", "check", "help"] },
                      { type: "string", name: "variant", label: "Variant", options: ["default", "highlight", "outline"] },
                    ],
                  },
                  {
                    name: "infoBanner",
                    label: "Info Banner",
                    ui: {
                      itemProps: (item) => ({ label: item?.text ? (item.text.length > 30 ? item.text.substring(0, 30) + "..." : item.text) : "Info Banner" }),
                      defaultItem: { text: "", type: "info", dismissible: false },
                    },
                    fields: [
                      { type: "string", name: "text", label: "Banner Text", ui: { component: "textarea" } },
                      { type: "string", name: "type", label: "Banner Type", options: ["info", "warning", "success"] },
                      { type: "boolean", name: "dismissible", label: "Dismissible?" },
                    ],
                  },
                  {
                    name: "textareaInput",
                    label: "Textarea Field",
                    ui: {
                      itemProps: (item) => ({ label: item?.label || item?.name || "Textarea Field" }),
                      defaultItem: { name: "", label: "", placeholder: "", required: false, rows: 3 },
                    },
                    fields: [
                      { type: "string", name: "name", label: "Field ID Key" },
                      { type: "string", name: "label", label: "Label Text" },
                      { type: "string", name: "placeholder", label: "Placeholder Text" },
                      { type: "boolean", name: "required", label: "Required Field?" },
                      { type: "number", name: "rows", label: "Rows" },
                    ],
                  },
                  {
                    name: "selectInput",
                    label: "Select Field",
                    ui: {
                      itemProps: (item) => ({ label: item?.label || item?.name || "Select Field" }),
                      defaultItem: { name: "", label: "", options: [], required: false, defaultValue: "" },
                    },
                    fields: [
                      { type: "string", name: "name", label: "Field ID Key" },
                      { type: "string", name: "label", label: "Label Text" },
                      {
                        type: "object",
                        name: "options",
                        label: "Select Options",
                        list: true,
                        ui: {
                          itemProps: (item) => ({ label: item?.label || item?.value || "Option" }),
                        },
                        fields: [
                          { type: "string", name: "value", label: "Value" },
                          { type: "string", name: "label", label: "Label" },
                        ],
                      },
                      { type: "boolean", name: "required", label: "Required Field?" },
                      { type: "string", name: "defaultValue", label: "Default Value" },
                    ],
                  },
                  {
                    name: "checkboxGroup",
                    label: "Checkbox Group",
                    ui: {
                      itemProps: (item) => ({ label: item?.label || item?.name || "Checkbox Group" }),
                      defaultItem: { name: "", label: "", options: [], required: false },
                    },
                    fields: [
                      { type: "string", name: "name", label: "Field ID Key" },
                      { type: "string", name: "label", label: "Label Text" },
                      {
                        type: "object",
                        name: "options",
                        label: "Checkbox Options",
                        list: true,
                        ui: {
                          itemProps: (item) => ({ label: item?.label ? `${item.label}${item.priceCents ? ' (+$' + (item.priceCents/100) + ')' : ''}` : item?.value || "Option" }),
                        },
                        fields: [
                          { type: "string", name: "value", label: "Value" },
                          { type: "string", name: "label", label: "Label" },
                          { type: "number", name: "priceCents", label: "Price (in Cents, optional)" },
                        ],
                      },
                      { type: "boolean", name: "required", label: "Required Field?" },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: "object",
            name: "header",
            label: "Sheet Header",
            fields: [
              { type: "string", name: "badge", label: "Badge Text" },
              { type: "string", name: "title", label: "Sheet Title" },
              { type: "string", name: "description", label: "Sheet Description" },
            ],
          },
          {
            type: "string",
            name: "stepNames",
            label: "Step Names (7 items — one per step)",
            list: true,
          },

          {
            type: "object",
            name: "timeWindows",
            label: "Time Window Options",
            list: true,
            fields: [
              { type: "string", name: "id", label: "ID (morning/afternoon/flexible)" },
              { type: "string", name: "label", label: "Display Label" },
            ],
          },
          {
            type: "object",
            name: "reviewLabels",
            label: "Review Step Labels",
            fields: [
              { type: "string", name: "heading", label: "Section Heading" },
              { type: "string", name: "rowHome", label: "Home Row Label" },
              { type: "string", name: "rowDate", label: "Date Row Label" },
              { type: "string", name: "rowWindow", label: "Window Row Label" },
              { type: "string", name: "rowPhotos", label: "Photos Row Label" },
              { type: "string", name: "disclaimer", label: "Disclaimer Paragraph" },
            ],
          },
          {
            type: "object",
            name: "navigation",
            label: "Navigation Buttons",
            fields: [
              { type: "string", name: "back", label: "Back Button" },
              { type: "string", name: "continue", label: "Continue Button" },
              { type: "string", name: "submit", label: "Submit Button" },
            ],
          },
          {
            type: "object",
            name: "success",
            label: "Success Screen",
            fields: [
              { type: "string", name: "title", label: "Title" },
              { type: "string", name: "message", label: "Message (use {name} for customer name)" },
              { type: "string", name: "buttonText", label: "Button Text" },
            ],
          },
          {
            type: "object",
            name: "estimate",
            label: "Estimate Callout",
            fields: [
              { type: "string", name: "label", label: "Heading" },
              { type: "string", name: "customQuote", label: "Text when no estimate available" },
              { type: "string", name: "disclaimer", label: "Footer disclaimer" },
            ],
          },
        ],
      },
    ],
  },
})
