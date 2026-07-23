"use client"

import React, { useState, useMemo } from "react"
import { createPortal } from "react-dom"
import { wrapFieldsWithMeta } from "tinacms"
import { ErrorBoundary } from "./ErrorBoundary"
import {
  Calculator,
  DollarSign,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  Sparkles,
  Layers,
  AlertCircle,
  X,
  SlidersHorizontal
} from "lucide-react"

interface ServiceItem {
  id: string
  name: string
  description?: string
  subtitle?: string
  features?: string[]
  basePriceCents?: number
  pricePerBedroomCents?: number
  pricePerBathroomCents?: number
}

interface AddOnItem {
  id: string
  name: string
  cents?: number
}

export const PricingManagerModalInner = (props: any) => {
  const { input, form, tinaForm } = props
  const activeForm = form || tinaForm
  const [isOpen, setIsOpen] = useState(false)

  // Read services and addOns from the form state
  const formValues = activeForm?.getState ? activeForm.getState().values : {}
  const rawServices: ServiceItem[] = formValues?.services || []
  const rawAddOns: AddOnItem[] = formValues?.addOns || []

  // Local draft state in USD ($)
  const [draftServices, setDraftServices] = useState<any[]>([])
  const [draftAddOns, setDraftAddOns] = useState<any[]>([])

  // Simulation state
  const [simServiceId, setSimServiceId] = useState<string>("")
  const [simBedrooms, setSimBedrooms] = useState<number>(1)
  const [simBathrooms, setSimBathrooms] = useState<number>(1)

  const handleOpen = () => {
    const servicesInUSD = rawServices.map((s) => ({
      id: s.id || "",
      name: s.name || "",
      description: s.description || "",
      subtitle: s.subtitle || "",
      features: s.features || [],
      basePrice: (s.basePriceCents || 0) / 100,
      pricePerBedroom: (s.pricePerBedroomCents || 0) / 100,
      pricePerBathroom: (s.pricePerBathroomCents || 0) / 100,
    }))

    const addOnsInUSD = rawAddOns.map((a) => ({
      id: a.id || "",
      name: a.name || "",
      price: (a.cents || 0) / 100,
    }))

    setDraftServices(servicesInUSD)
    setDraftAddOns(addOnsInUSD)
    if (servicesInUSD.length > 0) setSimServiceId(servicesInUSD[0].id)
    setIsOpen(true)
  }

  const handleSaveToTina = () => {
    const updatedServicesCents = draftServices.map((s) => ({
      ...s,
      basePriceCents: Math.round((s.basePrice || 0) * 100),
      pricePerBedroomCents: Math.round((s.pricePerBedroom || 0) * 100),
      pricePerBathroomCents: Math.round((s.pricePerBathroom || 0) * 100),
    }))

    const updatedAddOnsCents = draftAddOns.map((a) => ({
      ...a,
      cents: Math.round((a.price || 0) * 100),
    }))

    if (activeForm && activeForm.change) {
      activeForm.change("services", updatedServicesCents)
      activeForm.change("addOns", updatedAddOnsCents)
    }
    setIsOpen(false)
  }

  const updateService = (index: number, field: string, value: any) => {
    setDraftServices((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

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
        pricePerBathroom: 25,
      },
    ])
  }

  const removeService = (index: number) => {
    setDraftServices((prev) => prev.filter((_, i) => i !== index))
  }

  const updateAddOn = (index: number, field: string, value: any) => {
    setDraftAddOns((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const addAddOn = () => {
    setDraftAddOns((prev) => [
      ...prev,
      {
        id: `addon_${Date.now()}`,
        name: "New Add-on Service",
        price: 30,
      },
    ])
  }

  const removeAddOn = (index: number) => {
    setDraftAddOns((prev) => prev.filter((_, i) => i !== index))
  }

  // Simulator result calculation
  const simResult = useMemo(() => {
    const selectedSvc = draftServices.find((s) => s.id === simServiceId)
    if (!selectedSvc) return null
    if (selectedSvc.basePrice === 0) return "Custom Quote Required"

    const base = selectedSvc.basePrice
    const bedCost = (simBedrooms || 0) * selectedSvc.pricePerBedroom
    const bathCost = (simBathrooms || 0) * selectedSvc.pricePerBathroom
    return `$${(base + bedCost + bathCost).toFixed(2)}`
  }, [draftServices, simServiceId, simBedrooms, simBathrooms])

  return (
    <div className="py-2">
      <button
        type="button"
        onClick={handleOpen}
        className="w-full flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 transition-colors"
      >
        <SlidersHorizontal className="size-4" /> Open Central Pricing Table Hub
      </button>

      {isOpen && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[99999] flex flex-col bg-slate-900/95 p-4 sm:p-8 backdrop-blur-md overflow-y-auto text-slate-100 font-sans">
          <div className="mx-auto w-full max-w-6xl space-y-6 bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-700 pb-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  <SlidersHorizontal className="text-blue-400 size-6" /> Central Pricing Manager
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Edit rates in USD ($). Changes will sync directly into your Tina CMS form state.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
              >
                <X className="size-6" />
              </button>
            </div>

            {/* Live Quote Simulator */}
            <div className="rounded-lg border border-blue-500/30 bg-blue-950/40 p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono uppercase text-blue-400 font-semibold">
                <Calculator className="size-4" /> Live Calculator Test
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Service</label>
                  <select
                    value={simServiceId}
                    onChange={(e) => setSimServiceId(e.target.value)}
                    className="w-full rounded bg-slate-900 border border-slate-700 px-3 py-1.5 text-sm text-white"
                  >
                    {draftServices.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (${s.basePrice})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Bedrooms</label>
                  <input
                    type="number"
                    min={1}
                    value={simBedrooms}
                    onChange={(e) => setSimBedrooms(parseInt(e.target.value, 10) || 1)}
                    className="w-full rounded bg-slate-900 border border-slate-700 px-3 py-1.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Bathrooms</label>
                  <input
                    type="number"
                    min={1}
                    value={simBathrooms}
                    onChange={(e) => setSimBathrooms(parseInt(e.target.value, 10) || 1)}
                    className="w-full rounded bg-slate-900 border border-slate-700 px-3 py-1.5 text-sm text-white"
                  />
                </div>
                <div className="bg-slate-900 border border-slate-700 rounded p-2.5 text-right">
                  <div className="text-[10px] uppercase font-mono text-slate-400">Estimate Result</div>
                  <div className="text-xl font-bold text-blue-400">{simResult}</div>
                </div>
              </div>
            </div>

            {/* Services Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Layers className="size-5 text-blue-400" /> Services Table
                </h3>
                <button
                  type="button"
                  onClick={addService}
                  className="inline-flex items-center gap-1 text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded transition-colors"
                >
                  <Plus className="size-3.5" /> Add Service
                </button>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-700">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 uppercase font-mono">
                    <tr>
                      <th className="p-3">Service Name & Description</th>
                      <th className="p-3 w-36">Base Price ($)</th>
                      <th className="p-3 w-36">Price / Bed ($)</th>
                      <th className="p-3 w-36">Price / Bath ($)</th>
                      <th className="p-3 w-16 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700 bg-slate-800">
                    {draftServices.map((svc, idx) => (
                      <tr key={svc.id || idx}>
                        <td className="p-3 space-y-1.5">
                          <input
                            type="text"
                            value={svc.name}
                            onChange={(e) => updateService(idx, "name", e.target.value)}
                            className="w-full rounded bg-slate-900 border border-slate-700 px-2.5 py-1 text-white font-medium"
                            placeholder="Service Name"
                          />
                          <input
                            type="text"
                            value={svc.description}
                            onChange={(e) => updateService(idx, "description", e.target.value)}
                            className="w-full rounded bg-slate-900 border border-slate-700 px-2.5 py-1 text-slate-400 text-[11px]"
                            placeholder="Description"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            min={0}
                            value={svc.basePrice}
                            onChange={(e) => updateService(idx, "basePrice", parseFloat(e.target.value) || 0)}
                            className="w-full rounded bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-white font-mono"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            min={0}
                            value={svc.pricePerBedroom}
                            onChange={(e) => updateService(idx, "pricePerBedroom", parseFloat(e.target.value) || 0)}
                            className="w-full rounded bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-white font-mono"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            min={0}
                            value={svc.pricePerBathroom}
                            onChange={(e) => updateService(idx, "pricePerBathroom", parseFloat(e.target.value) || 0)}
                            className="w-full rounded bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-white font-mono"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => removeService(idx)}
                            className="text-slate-400 hover:text-red-400 p-1"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Add-Ons Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Sparkles className="size-5 text-blue-400" /> Add-On Extras Table
                </h3>
                <button
                  type="button"
                  onClick={addAddOn}
                  className="inline-flex items-center gap-1 text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded transition-colors"
                >
                  <Plus className="size-3.5" /> Add Extra
                </button>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-700">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 uppercase font-mono">
                    <tr>
                      <th className="p-3">Add-On Name</th>
                      <th className="p-3 w-48">Price ($ USD)</th>
                      <th className="p-3 w-16 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700 bg-slate-800">
                    {draftAddOns.map((addOn, idx) => (
                      <tr key={addOn.id || idx}>
                        <td className="p-3">
                          <input
                            type="text"
                            value={addOn.name}
                            onChange={(e) => updateAddOn(idx, "name", e.target.value)}
                            className="w-full rounded bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-white font-medium"
                            placeholder="Add-on Name"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            min={0}
                            value={addOn.price}
                            onChange={(e) => updateAddOn(idx, "price", parseFloat(e.target.value) || 0)}
                            className="w-full rounded bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-white font-mono"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => removeAddOn(idx)}
                            className="text-slate-400 hover:text-red-400 p-1"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-700 pt-4">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded text-sm text-slate-300 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveToTina}
                className="inline-flex items-center gap-2 px-5 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors shadow-lg"
              >
                <Save className="size-4" /> Apply Changes to CMS
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export const PricingManagerModal = wrapFieldsWithMeta((props: any) => (
  <ErrorBoundary>
    <PricingManagerModalInner {...props} />
  </ErrorBoundary>
))
