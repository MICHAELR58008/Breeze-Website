// tina/config.ts
import { defineConfig } from "tinacms";

// tina/components/PricingManagerModal.tsx
import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { wrapFieldsWithMeta } from "tinacms";

// tina/components/ErrorBoundary.tsx
import { Component } from "react";
import { AlertCircle } from "lucide-react";
import { jsx, jsxs } from "react/jsx-runtime";
var ErrorBoundary = class extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("TinaCMS Custom Component Error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || jsxs("div", { className: "flex flex-col gap-2 p-4 my-2 border border-red-500/50 bg-red-500/10 rounded-md text-slate-800 dark:text-slate-200", children: [
        jsxs("div", { className: "flex items-center gap-2 text-red-600 dark:text-red-400 font-semibold", children: [
          jsx(AlertCircle, { className: "size-5" }),
          jsx("span", { children: "Error loading field" })
        ] }),
        jsx("div", { className: "text-xs font-mono opacity-80 break-words", children: this.state.error?.message || "An unexpected error occurred." })
      ] });
    }
    return this.props.children;
  }
};

// tina/components/PricingManagerModal.tsx
import {
  Calculator,
  Plus,
  Save,
  Trash2,
  Sparkles,
  Layers,
  X,
  SlidersHorizontal
} from "lucide-react";
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
var PricingManagerModalInner = (props) => {
  const { input, form, tinaForm } = props;
  const activeForm = form || tinaForm;
  const [isOpen, setIsOpen] = useState(false);
  const formValues = activeForm?.getState ? activeForm.getState().values : {};
  const rawServices = formValues?.services || [];
  const rawAddOns = formValues?.addOns || [];
  const [draftServices, setDraftServices] = useState([]);
  const [draftAddOns, setDraftAddOns] = useState([]);
  const [simServiceId, setSimServiceId] = useState("");
  const [simBedrooms, setSimBedrooms] = useState(1);
  const [simBathrooms, setSimBathrooms] = useState(1);
  const handleOpen = () => {
    const servicesInUSD = rawServices.map((s) => ({
      id: s.id || "",
      name: s.name || "",
      description: s.description || "",
      subtitle: s.subtitle || "",
      features: s.features || [],
      basePrice: (s.basePriceCents || 0) / 100,
      pricePerBedroom: (s.pricePerBedroomCents || 0) / 100,
      pricePerBathroom: (s.pricePerBathroomCents || 0) / 100
    }));
    const addOnsInUSD = rawAddOns.map((a) => ({
      id: a.id || "",
      name: a.name || "",
      price: (a.cents || 0) / 100
    }));
    setDraftServices(servicesInUSD);
    setDraftAddOns(addOnsInUSD);
    if (servicesInUSD.length > 0) setSimServiceId(servicesInUSD[0].id);
    setIsOpen(true);
  };
  const handleSaveToTina = () => {
    const updatedServicesCents = draftServices.map((s) => ({
      ...s,
      basePriceCents: Math.round((s.basePrice || 0) * 100),
      pricePerBedroomCents: Math.round((s.pricePerBedroom || 0) * 100),
      pricePerBathroomCents: Math.round((s.pricePerBathroom || 0) * 100)
    }));
    const updatedAddOnsCents = draftAddOns.map((a) => ({
      ...a,
      cents: Math.round((a.price || 0) * 100)
    }));
    if (activeForm && activeForm.change) {
      activeForm.change("services", updatedServicesCents);
      activeForm.change("addOns", updatedAddOnsCents);
    }
    setIsOpen(false);
  };
  const updateService = (index, field, value) => {
    setDraftServices((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };
  const addService = () => {
    setDraftServices((prev) => [
      ...prev,
      {
        id: `service_${Date.now()}`,
        name: "New Service Clean",
        description: "Custom service package",
        subtitle: "",
        features: ["Standard feature"],
        basePrice: 100,
        pricePerBedroom: 25,
        pricePerBathroom: 25
      }
    ]);
  };
  const removeService = (index) => {
    setDraftServices((prev) => prev.filter((_, i) => i !== index));
  };
  const updateAddOn = (index, field, value) => {
    setDraftAddOns((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };
  const addAddOn = () => {
    setDraftAddOns((prev) => [
      ...prev,
      {
        id: `addon_${Date.now()}`,
        name: "New Add-on Service",
        price: 30
      }
    ]);
  };
  const removeAddOn = (index) => {
    setDraftAddOns((prev) => prev.filter((_, i) => i !== index));
  };
  const simResult = useMemo(() => {
    const selectedSvc = draftServices.find((s) => s.id === simServiceId);
    if (!selectedSvc) return null;
    if (selectedSvc.basePrice === 0) return "Custom Quote Required";
    const base = selectedSvc.basePrice;
    const bedCost = (simBedrooms || 0) * selectedSvc.pricePerBedroom;
    const bathCost = (simBathrooms || 0) * selectedSvc.pricePerBathroom;
    return `$${(base + bedCost + bathCost).toFixed(2)}`;
  }, [draftServices, simServiceId, simBedrooms, simBathrooms]);
  return jsxs2("div", { className: "py-2", children: [
    jsxs2(
      "button",
      {
        type: "button",
        onClick: handleOpen,
        className: "w-full flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 transition-colors",
        children: [
          jsx2(SlidersHorizontal, { className: "size-4" }),
          " Open Central Pricing Table Hub"
        ]
      }
    ),
    isOpen && typeof document !== "undefined" && createPortal(
      jsx2("div", { className: "fixed inset-0 z-[99999] flex flex-col bg-slate-900/95 p-4 sm:p-8 backdrop-blur-md overflow-y-auto text-slate-100 font-sans", children: jsxs2("div", { className: "mx-auto w-full max-w-6xl space-y-6 bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-2xl", children: [
        jsxs2("div", { className: "flex items-center justify-between border-b border-slate-700 pb-4", children: [
          jsxs2("div", { children: [
            jsxs2("h2", { className: "text-2xl font-bold tracking-tight text-white flex items-center gap-2", children: [
              jsx2(SlidersHorizontal, { className: "text-blue-400 size-6" }),
              " Central Pricing Manager"
            ] }),
            jsx2("p", { className: "text-xs text-slate-400 mt-1", children: "Edit rates in USD ($). Changes will sync directly into your Tina CMS form state." })
          ] }),
          jsx2(
            "button",
            {
              type: "button",
              onClick: () => setIsOpen(false),
              className: "rounded-lg p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors",
              children: jsx2(X, { className: "size-6" })
            }
          )
        ] }),
        jsxs2("div", { className: "rounded-lg border border-blue-500/30 bg-blue-950/40 p-4 space-y-3", children: [
          jsxs2("div", { className: "flex items-center gap-2 text-xs font-mono uppercase text-blue-400 font-semibold", children: [
            jsx2(Calculator, { className: "size-4" }),
            " Live Calculator Test"
          ] }),
          jsxs2("div", { className: "grid grid-cols-1 sm:grid-cols-4 gap-4 items-end", children: [
            jsxs2("div", { children: [
              jsx2("label", { className: "text-xs text-slate-300 block mb-1", children: "Service" }),
              jsx2(
                "select",
                {
                  value: simServiceId,
                  onChange: (e) => setSimServiceId(e.target.value),
                  className: "w-full rounded bg-slate-900 border border-slate-700 px-3 py-1.5 text-sm text-white",
                  children: draftServices.map((s) => jsxs2("option", { value: s.id, children: [
                    s.name,
                    " ($",
                    s.basePrice,
                    ")"
                  ] }, s.id))
                }
              )
            ] }),
            jsxs2("div", { children: [
              jsx2("label", { className: "text-xs text-slate-300 block mb-1", children: "Bedrooms" }),
              jsx2(
                "input",
                {
                  type: "number",
                  min: 1,
                  value: simBedrooms,
                  onChange: (e) => setSimBedrooms(parseInt(e.target.value, 10) || 1),
                  className: "w-full rounded bg-slate-900 border border-slate-700 px-3 py-1.5 text-sm text-white"
                }
              )
            ] }),
            jsxs2("div", { children: [
              jsx2("label", { className: "text-xs text-slate-300 block mb-1", children: "Bathrooms" }),
              jsx2(
                "input",
                {
                  type: "number",
                  min: 1,
                  value: simBathrooms,
                  onChange: (e) => setSimBathrooms(parseInt(e.target.value, 10) || 1),
                  className: "w-full rounded bg-slate-900 border border-slate-700 px-3 py-1.5 text-sm text-white"
                }
              )
            ] }),
            jsxs2("div", { className: "bg-slate-900 border border-slate-700 rounded p-2.5 text-right", children: [
              jsx2("div", { className: "text-[10px] uppercase font-mono text-slate-400", children: "Estimate Result" }),
              jsx2("div", { className: "text-xl font-bold text-blue-400", children: simResult })
            ] })
          ] })
        ] }),
        jsxs2("div", { className: "space-y-3", children: [
          jsxs2("div", { className: "flex items-center justify-between", children: [
            jsxs2("h3", { className: "text-lg font-semibold text-white flex items-center gap-2", children: [
              jsx2(Layers, { className: "size-5 text-blue-400" }),
              " Services Table"
            ] }),
            jsxs2(
              "button",
              {
                type: "button",
                onClick: addService,
                className: "inline-flex items-center gap-1 text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded transition-colors",
                children: [
                  jsx2(Plus, { className: "size-3.5" }),
                  " Add Service"
                ]
              }
            )
          ] }),
          jsx2("div", { className: "overflow-x-auto rounded-lg border border-slate-700", children: jsxs2("table", { className: "w-full text-left text-xs", children: [
            jsx2("thead", { className: "bg-slate-900 text-slate-400 uppercase font-mono", children: jsxs2("tr", { children: [
              jsx2("th", { className: "p-3", children: "Service Name & Description" }),
              jsx2("th", { className: "p-3 w-36", children: "Base Price ($)" }),
              jsx2("th", { className: "p-3 w-36", children: "Price / Bed ($)" }),
              jsx2("th", { className: "p-3 w-36", children: "Price / Bath ($)" }),
              jsx2("th", { className: "p-3 w-16 text-center", children: "Action" })
            ] }) }),
            jsx2("tbody", { className: "divide-y divide-slate-700 bg-slate-800", children: draftServices.map((svc, idx) => jsxs2("tr", { children: [
              jsxs2("td", { className: "p-3 space-y-1.5", children: [
                jsx2(
                  "input",
                  {
                    type: "text",
                    value: svc.name,
                    onChange: (e) => updateService(idx, "name", e.target.value),
                    className: "w-full rounded bg-slate-900 border border-slate-700 px-2.5 py-1 text-white font-medium",
                    placeholder: "Service Name"
                  }
                ),
                jsx2(
                  "input",
                  {
                    type: "text",
                    value: svc.description,
                    onChange: (e) => updateService(idx, "description", e.target.value),
                    className: "w-full rounded bg-slate-900 border border-slate-700 px-2.5 py-1 text-slate-400 text-[11px]",
                    placeholder: "Description"
                  }
                )
              ] }),
              jsx2("td", { className: "p-3", children: jsx2(
                "input",
                {
                  type: "number",
                  min: 0,
                  value: svc.basePrice,
                  onChange: (e) => updateService(idx, "basePrice", parseFloat(e.target.value) || 0),
                  className: "w-full rounded bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-white font-mono"
                }
              ) }),
              jsx2("td", { className: "p-3", children: jsx2(
                "input",
                {
                  type: "number",
                  min: 0,
                  value: svc.pricePerBedroom,
                  onChange: (e) => updateService(idx, "pricePerBedroom", parseFloat(e.target.value) || 0),
                  className: "w-full rounded bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-white font-mono"
                }
              ) }),
              jsx2("td", { className: "p-3", children: jsx2(
                "input",
                {
                  type: "number",
                  min: 0,
                  value: svc.pricePerBathroom,
                  onChange: (e) => updateService(idx, "pricePerBathroom", parseFloat(e.target.value) || 0),
                  className: "w-full rounded bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-white font-mono"
                }
              ) }),
              jsx2("td", { className: "p-3 text-center", children: jsx2(
                "button",
                {
                  type: "button",
                  onClick: () => removeService(idx),
                  className: "text-slate-400 hover:text-red-400 p-1",
                  children: jsx2(Trash2, { className: "size-4" })
                }
              ) })
            ] }, svc.id || idx)) })
          ] }) })
        ] }),
        jsxs2("div", { className: "space-y-3", children: [
          jsxs2("div", { className: "flex items-center justify-between", children: [
            jsxs2("h3", { className: "text-lg font-semibold text-white flex items-center gap-2", children: [
              jsx2(Sparkles, { className: "size-5 text-blue-400" }),
              " Add-On Extras Table"
            ] }),
            jsxs2(
              "button",
              {
                type: "button",
                onClick: addAddOn,
                className: "inline-flex items-center gap-1 text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded transition-colors",
                children: [
                  jsx2(Plus, { className: "size-3.5" }),
                  " Add Extra"
                ]
              }
            )
          ] }),
          jsx2("div", { className: "overflow-x-auto rounded-lg border border-slate-700", children: jsxs2("table", { className: "w-full text-left text-xs", children: [
            jsx2("thead", { className: "bg-slate-900 text-slate-400 uppercase font-mono", children: jsxs2("tr", { children: [
              jsx2("th", { className: "p-3", children: "Add-On Name" }),
              jsx2("th", { className: "p-3 w-48", children: "Price ($ USD)" }),
              jsx2("th", { className: "p-3 w-16 text-center", children: "Action" })
            ] }) }),
            jsx2("tbody", { className: "divide-y divide-slate-700 bg-slate-800", children: draftAddOns.map((addOn, idx) => jsxs2("tr", { children: [
              jsx2("td", { className: "p-3", children: jsx2(
                "input",
                {
                  type: "text",
                  value: addOn.name,
                  onChange: (e) => updateAddOn(idx, "name", e.target.value),
                  className: "w-full rounded bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-white font-medium",
                  placeholder: "Add-on Name"
                }
              ) }),
              jsx2("td", { className: "p-3", children: jsx2(
                "input",
                {
                  type: "number",
                  min: 0,
                  value: addOn.price,
                  onChange: (e) => updateAddOn(idx, "price", parseFloat(e.target.value) || 0),
                  className: "w-full rounded bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-white font-mono"
                }
              ) }),
              jsx2("td", { className: "p-3 text-center", children: jsx2(
                "button",
                {
                  type: "button",
                  onClick: () => removeAddOn(idx),
                  className: "text-slate-400 hover:text-red-400 p-1",
                  children: jsx2(Trash2, { className: "size-4" })
                }
              ) })
            ] }, addOn.id || idx)) })
          ] }) })
        ] }),
        jsxs2("div", { className: "flex items-center justify-end gap-3 border-t border-slate-700 pt-4", children: [
          jsx2(
            "button",
            {
              type: "button",
              onClick: () => setIsOpen(false),
              className: "px-4 py-2 rounded text-sm text-slate-300 hover:bg-slate-700 transition-colors",
              children: "Cancel"
            }
          ),
          jsxs2(
            "button",
            {
              type: "button",
              onClick: handleSaveToTina,
              className: "inline-flex items-center gap-2 px-5 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors shadow-lg",
              children: [
                jsx2(Save, { className: "size-4" }),
                " Apply Changes to CMS"
              ]
            }
          )
        ] })
      ] }) }),
      document.body
    )
  ] });
};
var PricingManagerModal = wrapFieldsWithMeta((props) => jsx2(ErrorBoundary, { children: jsx2(PricingManagerModalInner, { ...props }) }));

// tina/components/FocalPointPicker.tsx
import { useRef } from "react";
import { wrapFieldsWithMeta as wrapFieldsWithMeta2 } from "tinacms";
import { jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
var FocalPointPickerInner = (props) => {
  const { input, form } = props;
  const imageRef = useRef(null);
  const fieldName = input.name || "";
  const imagePath = fieldName.includes(".") ? fieldName.substring(0, fieldName.lastIndexOf(".")) + ".image" : "image";
  const imageUrl = form?.getFieldState?.(imagePath)?.value || form?.getFieldState?.("image")?.value || "";
  const rawValue = input.value || "50% 0%";
  const value = typeof rawValue === "string" ? rawValue : "50% 0%";
  const [posX, posY] = value.split(" ").map((v) => parseFloat(v) || 0);
  const handlePointerDown = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const xPct = Math.max(0, Math.min(100, Math.round((e.clientX - rect.left) / rect.width * 100)));
    const yPct = Math.max(0, Math.min(100, Math.round((e.clientY - rect.top) / rect.height * 100)));
    const newValue = `${xPct}% ${yPct}%`;
    input.onChange(newValue);
  };
  if (!imageUrl) {
    return jsx3("div", { className: "p-3 text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 rounded border border-dashed text-center", children: "Upload an owner photo above to select a crop focal point." });
  }
  return jsxs3("div", { className: "flex flex-col gap-2", children: [
    jsxs3(
      "div",
      {
        className: "relative cursor-crosshair overflow-hidden rounded border border-gray-300 dark:border-gray-700 bg-slate-900 group select-none",
        onPointerDown: handlePointerDown,
        children: [
          jsx3(
            "img",
            {
              ref: imageRef,
              src: imageUrl,
              alt: "Focal point preview",
              className: "w-full h-auto max-h-48 object-contain pointer-events-none"
            }
          ),
          jsx3(
            "div",
            {
              className: "absolute w-6 h-6 border-2 border-white bg-primary/70 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-md pointer-events-none transition-all flex items-center justify-center",
              style: { left: `${posX}%`, top: `${posY}%` },
              children: jsx3("div", { className: "w-1.5 h-1.5 bg-white rounded-full" })
            }
          )
        ]
      }
    ),
    jsxs3("div", { className: "flex items-center justify-between text-[11px] text-gray-500 font-mono", children: [
      jsx3("span", { children: "Click image to set crop center" }),
      jsx3("span", { className: "font-semibold text-primary", children: value })
    ] })
  ] });
};
var FocalPointPicker = wrapFieldsWithMeta2((props) => jsx3(ErrorBoundary, { children: jsx3(FocalPointPickerInner, { ...props }) }));

// tina/config.ts
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
                    imageSrc: "/images/breeze-clean-home.png",
                    imageAlt: "A bright, professionally cleaned modern home"
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
                  { type: "image", name: "imageSrc", label: "Hero Image" },
                  { type: "string", name: "imageAlt", label: "Image Alt Text" }
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
                      { type: "string", name: "description" },
                      { type: "image", name: "image", label: "Image / Icon Photo" }
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
                  { type: "string", name: "bioParagraph2" },
                  { type: "image", name: "image", label: "Owner Photo" },
                  {
                    type: "string",
                    name: "focalPoint",
                    label: "Photo Crop Focal Point",
                    ui: {
                      component: FocalPointPicker
                    }
                  }
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
        name: "booking",
        label: "Booking & Pricing",
        path: "content/booking",
        format: "json",
        ui: {
          router: () => "/preview/booking",
          allowedActions: {
            create: false,
            delete: false
          }
        },
        fields: [
          {
            type: "string",
            name: "pricingHub",
            label: "Central Pricing Hub (Table & Calculator)",
            ui: {
              component: PricingManagerModal
            }
          },
          {
            type: "boolean",
            name: "previewOpen",
            label: "Preview Drawer Open in Editor (turn on to visually edit)"
          },
          {
            type: "object",
            name: "services",
            label: "Services",
            description: "Add, remove, and reorder services. (Tip: Use /admin/pricing for a dedicated table editor)",
            list: true,
            ui: {
              itemProps: (item) => ({
                label: item?.name || "New Service"
              })
            },
            fields: [
              { type: "string", name: "id", required: true },
              { type: "string", name: "name", required: true },
              { type: "string", name: "description" },
              { type: "string", name: "subtitle" },
              { type: "string", name: "features", list: true },
              { type: "number", name: "basePriceCents", label: "Base Price in Cents (e.g. 13000 = $130)" },
              { type: "number", name: "pricePerBedroomCents", label: "Price per Bedroom in Cents (e.g. 3000 = $30)" },
              { type: "number", name: "pricePerBathroomCents", label: "Price per Bathroom in Cents (e.g. 3000 = $30)" }
            ]
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
              { type: "number", name: "cents", label: "Price in Cents (e.g. 3000 = $30)" }
            ]
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
              { type: "string", name: "borderRadius", label: "Border Radius", options: ["0px", "4px", "8px", "12px", "9999px"] }
            ]
          },
          {
            type: "object",
            name: "steps",
            label: "Form Steps & Custom Fields Builder",
            list: true,
            ui: {
              itemProps: (item) => ({ label: item?.title || "New Step" })
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
                      { type: "string", name: "validationType", label: "Validation Rule", options: ["none", "email", "phone"] }
                    ]
                  },
                  {
                    name: "numberInput",
                    label: "Number Field",
                    fields: [
                      { type: "string", name: "name", label: "Field ID Key" },
                      { type: "string", name: "label", label: "Label Text" },
                      { type: "number", name: "min", label: "Min Value" },
                      { type: "number", name: "max", label: "Max Value" }
                    ]
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
                          { type: "string", name: "label", label: "Option Label" }
                        ]
                      }
                    ]
                  },
                  {
                    name: "dateInput",
                    label: "Date Picker",
                    fields: [
                      { type: "string", name: "name", label: "Field ID Key" },
                      { type: "string", name: "label", label: "Label Text" }
                    ]
                  },
                  {
                    name: "photoUpload",
                    label: "Photo Dropzone",
                    fields: [
                      { type: "string", name: "label", label: "Prompt Label" },
                      { type: "string", name: "prompt", label: "Upload Button Text" },
                      { type: "string", name: "hint", label: "Hint Text" },
                      { type: "string", name: "selectedText", label: "Selected Count Template (use {count} and {s})" },
                      { type: "string", name: "emptyText", label: "Empty State Message" }
                    ]
                  },
                  {
                    name: "richTextHeading",
                    label: "Rich Callout / Note",
                    fields: [
                      { type: "string", name: "text", label: "Text Message" }
                    ]
                  },
                  {
                    name: "servicesSelector",
                    label: "[Special] Services Cards",
                    fields: [
                      { type: "string", name: "question", label: "Question Label" }
                    ]
                  },
                  {
                    name: "addonsSelector",
                    label: "[Special] Add-ons Toggles",
                    fields: [
                      { type: "string", name: "question", label: "Question Label" }
                    ]
                  },
                  {
                    name: "estimateSummary",
                    label: "[Special] Estimate & Review Summary",
                    fields: [
                      { type: "string", name: "disclaimer", label: "Disclaimer Note" }
                    ]
                  },
                  {
                    name: "imageBlock",
                    label: "Image Block",
                    ui: {
                      itemProps: (item) => ({ label: item?.alt || item?.caption || "Image Block" }),
                      defaultItem: { src: "", alt: "", caption: "", aspect: "auto" }
                    },
                    fields: [
                      { type: "image", name: "src", label: "Image Source" },
                      { type: "string", name: "alt", label: "Alt Text" },
                      { type: "string", name: "caption", label: "Caption" },
                      { type: "string", name: "aspect", label: "Aspect Ratio", options: ["auto", "16/9", "4/3", "1/1", "square", "video"] }
                    ]
                  },
                  {
                    name: "infoCard",
                    label: "Info Card",
                    ui: {
                      itemProps: (item) => ({ label: item?.title || "Info Card" }),
                      defaultItem: { title: "", description: "", icon: "info", variant: "default" }
                    },
                    fields: [
                      { type: "string", name: "title", label: "Title" },
                      { type: "string", name: "description", label: "Description", ui: { component: "textarea" } },
                      { type: "string", name: "icon", label: "Icon", options: ["info", "sparkles", "shield", "star", "check", "help"] },
                      { type: "string", name: "variant", label: "Variant", options: ["default", "highlight", "outline"] }
                    ]
                  },
                  {
                    name: "infoBanner",
                    label: "Info Banner",
                    ui: {
                      itemProps: (item) => ({ label: item?.text ? item.text.length > 30 ? item.text.substring(0, 30) + "..." : item.text : "Info Banner" }),
                      defaultItem: { text: "", type: "info", dismissible: false }
                    },
                    fields: [
                      { type: "string", name: "text", label: "Banner Text", ui: { component: "textarea" } },
                      { type: "string", name: "type", label: "Banner Type", options: ["info", "warning", "success"] },
                      { type: "boolean", name: "dismissible", label: "Dismissible?" }
                    ]
                  },
                  {
                    name: "textareaInput",
                    label: "Textarea Field",
                    ui: {
                      itemProps: (item) => ({ label: item?.label || item?.name || "Textarea Field" }),
                      defaultItem: { name: "", label: "", placeholder: "", required: false, rows: 3 }
                    },
                    fields: [
                      { type: "string", name: "name", label: "Field ID Key" },
                      { type: "string", name: "label", label: "Label Text" },
                      { type: "string", name: "placeholder", label: "Placeholder Text" },
                      { type: "boolean", name: "required", label: "Required Field?" },
                      { type: "number", name: "rows", label: "Rows" }
                    ]
                  },
                  {
                    name: "selectInput",
                    label: "Select Field",
                    ui: {
                      itemProps: (item) => ({ label: item?.label || item?.name || "Select Field" }),
                      defaultItem: { name: "", label: "", options: [], required: false, defaultValue: "" }
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
                          itemProps: (item) => ({ label: item?.label || item?.value || "Option" })
                        },
                        fields: [
                          { type: "string", name: "value", label: "Value" },
                          { type: "string", name: "label", label: "Label" }
                        ]
                      },
                      { type: "boolean", name: "required", label: "Required Field?" },
                      { type: "string", name: "defaultValue", label: "Default Value" }
                    ]
                  },
                  {
                    name: "checkboxGroup",
                    label: "Checkbox Group",
                    ui: {
                      itemProps: (item) => ({ label: item?.label || item?.name || "Checkbox Group" }),
                      defaultItem: { name: "", label: "", options: [], required: false }
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
                          itemProps: (item) => ({ label: item?.label ? `${item.label}${item.priceCents ? " (+$" + item.priceCents / 100 + ")" : ""}` : item?.value || "Option" })
                        },
                        fields: [
                          { type: "string", name: "value", label: "Value" },
                          { type: "string", name: "label", label: "Label" },
                          { type: "number", name: "priceCents", label: "Price (in Cents, optional)" }
                        ]
                      },
                      { type: "boolean", name: "required", label: "Required Field?" }
                    ]
                  }
                ]
              }
            ]
          },
          {
            type: "object",
            name: "header",
            label: "Sheet Header",
            fields: [
              { type: "string", name: "badge", label: "Badge Text" },
              { type: "string", name: "title", label: "Sheet Title" },
              { type: "string", name: "description", label: "Sheet Description" }
            ]
          },
          {
            type: "string",
            name: "stepNames",
            label: "Step Names (7 items \u2014 one per step)",
            list: true
          },
          {
            type: "object",
            name: "timeWindows",
            label: "Time Window Options",
            list: true,
            fields: [
              { type: "string", name: "id", label: "ID (morning/afternoon/flexible)" },
              { type: "string", name: "label", label: "Display Label" }
            ]
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
              { type: "string", name: "disclaimer", label: "Disclaimer Paragraph" }
            ]
          },
          {
            type: "object",
            name: "navigation",
            label: "Navigation Buttons",
            fields: [
              { type: "string", name: "back", label: "Back Button" },
              { type: "string", name: "continue", label: "Continue Button" },
              { type: "string", name: "submit", label: "Submit Button" }
            ]
          },
          {
            type: "object",
            name: "success",
            label: "Success Screen",
            fields: [
              { type: "string", name: "title", label: "Title" },
              { type: "string", name: "message", label: "Message (use {name} for customer name)" },
              { type: "string", name: "buttonText", label: "Button Text" }
            ]
          },
          {
            type: "object",
            name: "estimate",
            label: "Estimate Callout",
            fields: [
              { type: "string", name: "label", label: "Heading" },
              { type: "string", name: "customQuote", label: "Text when no estimate available" },
              { type: "string", name: "disclaimer", label: "Footer disclaimer" }
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
