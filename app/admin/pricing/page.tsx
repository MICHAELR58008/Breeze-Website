"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Calculator,
  Check,
  DollarSign,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertCircle
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface EditableService {
  id: string
  name: string
  description: string
  subtitle: string
  features: string[]
  basePrice: number // in USD dollars
  pricePerBedroom: number // in USD dollars
  pricePerBathroom: number // in USD dollars
}

interface EditableAddOn {
  id: string
  name: string
  price: number // in USD dollars
}

export default function PricingHubPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [services, setServices] = useState<EditableService[]>([])
  const [addOns, setAddOns] = useState<EditableAddOn[]>([])
  const [initialData, setInitialData] = useState<{ services: EditableService[]; addOns: EditableAddOn[] } | null>(null)

  // Simulation Sandbox State
  const [simServiceId, setSimServiceId] = useState<string>("")
  const [simBedrooms, setSimBedrooms] = useState<number>(1)
  const [simBathrooms, setSimBathrooms] = useState<number>(1)
  const [simSelectedAddOns, setSimSelectedAddOns] = useState<string[]>([])

  const fetchPricing = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/pricing")
      if (!res.ok) throw new Error("Failed to load pricing")
      const data = await res.json()

      const loadedServices: EditableService[] = (data.services || []).map((s: any) => ({
        id: s.id || "",
        name: s.name || "",
        description: s.description || "",
        subtitle: s.subtitle || "",
        features: s.features || [],
        basePrice: (s.basePriceCents || 0) / 100,
        pricePerBedroom: (s.pricePerBedroomCents || 0) / 100,
        pricePerBathroom: (s.pricePerBathroomCents || 0) / 100,
      }))

      const loadedAddOns: EditableAddOn[] = (data.addOns || []).map((a: any) => ({
        id: a.id || "",
        name: a.name || "",
        price: (a.cents || 0) / 100,
      }))

      setServices(loadedServices)
      setAddOns(loadedAddOns)
      setInitialData({ services: loadedServices, addOns: loadedAddOns })

      if (loadedServices.length > 0 && !simServiceId) {
        setSimServiceId(loadedServices[0].id)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error fetching pricing data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPricing()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const hasChanges = useMemo(() => {
    if (!initialData) return false
    return JSON.stringify({ services, addOns }) !== JSON.stringify(initialData)
  }, [services, addOns, initialData])

  const updateService = (index: number, field: keyof EditableService, value: any) => {
    setServices((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const addService = () => {
    const newId = `service_${Date.now()}`
    setServices((prev) => [
      ...prev,
      {
        id: newId,
        name: "New Service Clean",
        description: "Custom service package",
        subtitle: "",
        features: ["Standard cleaning feature"],
        basePrice: 100,
        pricePerBedroom: 25,
        pricePerBathroom: 25,
      },
    ])
    if (!simServiceId) setSimServiceId(newId)
  }

  const removeService = (index: number) => {
    setServices((prev) => prev.filter((_, i) => i !== index))
  }

  const updateAddOn = (index: number, field: keyof EditableAddOn, value: any) => {
    setAddOns((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const addAddOn = () => {
    setAddOns((prev) => [
      ...prev,
      {
        id: `addon_${Date.now()}`,
        name: "New Add-on Service",
        price: 30,
      },
    ])
  }

  const removeAddOn = (index: number) => {
    setAddOns((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        services: services.map((s) => ({
          ...s,
          basePriceCents: Math.round((s.basePrice || 0) * 100),
          pricePerBedroomCents: Math.round((s.pricePerBedroom || 0) * 100),
          pricePerBathroomCents: Math.round((s.pricePerBathroom || 0) * 100),
        })),
        addOns: addOns.map((a) => ({
          ...a,
          cents: Math.round((a.price || 0) * 100),
        })),
      }

      const res = await fetch("/api/admin/pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to update pricing")
      }

      toast.success("Pricing updated successfully! Booking sheet and CMS synced.")
      setInitialData({ services, addOns })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (initialData) {
      setServices(initialData.services)
      setAddOns(initialData.addOns)
      toast.info("Reverted all unsaved changes.")
    }
  }

  // Simulation Calculation
  const simResult = useMemo(() => {
    const selectedSvc = services.find((s) => s.id === simServiceId)
    if (!selectedSvc) return null
    if (selectedSvc.basePrice === 0) return "Custom Quote Required"

    const base = selectedSvc.basePrice
    const bedCost = (simBedrooms || 0) * selectedSvc.pricePerBedroom
    const bathCost = (simBathrooms || 0) * selectedSvc.pricePerBathroom

    const addOnTotal = simSelectedAddOns.reduce((sum, addOnId) => {
      const item = addOns.find((a) => a.id === addOnId)
      return sum + (item?.price || 0)
    }, 0)

    const total = base + bedCost + bathCost + addOnTotal
    return `$${total.toFixed(2)}`
  }, [services, addOns, simServiceId, simBedrooms, simBathrooms, simSelectedAddOns])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <RefreshCw className="size-8 animate-spin text-primary" />
          <p className="font-medium text-sm">Loading Central Pricing Hub...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/20 p-4 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Top Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
          <div>
            <div className="flex items-center gap-3">
              <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="size-3.5" /> Back to Site
              </Link>
              <span className="text-muted-foreground/40">•</span>
              <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                Tina CMS Dashboard
              </Link>
            </div>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Central Pricing Hub
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage base rates, bedroom/bathroom surcharges, and add-on pricing across your website in real-time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {hasChanges && (
              <Badge variant="outline" className="border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400 gap-1.5 py-1">
                <AlertCircle className="size-3.5" /> Unsaved Changes
              </Badge>
            )}
            <Button variant="outline" onClick={handleReset} disabled={!hasChanges || saving}>
              <RefreshCw className="size-4" /> Reset
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges || saving} className="gap-2">
              {saving ? <RefreshCw className="size-4 animate-spin" /> : <Save className="size-4" />}
              Save Changes
            </Button>
          </div>
        </div>

        {/* Live Calculation Sandbox Header Banner */}
        <Card className="border-primary/30 bg-primary/5 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-primary font-semibold">
                <Calculator className="size-4" /> Real-time Quote Simulator
              </div>
              <Badge variant="secondary" className="font-mono text-xs">
                Live Formula Test
              </Badge>
            </div>
            <CardTitle className="text-xl">Test Rates & Pricing Scenarios</CardTitle>
            <CardDescription>
              Test how changes affect customer quotes instantly before saving.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Select Service</label>
              <select
                value={simServiceId}
                onChange={(e) => setSimServiceId(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} (${s.basePrice})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Bedrooms</label>
              <Input
                type="number"
                min={1}
                max={10}
                value={simBedrooms}
                onChange={(e) => setSimBedrooms(parseInt(e.target.value, 10) || 1)}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Bathrooms</label>
              <Input
                type="number"
                min={1}
                max={10}
                value={simBathrooms}
                onChange={(e) => setSimBathrooms(parseInt(e.target.value, 10) || 1)}
              />
            </div>

            <div className="flex flex-col justify-end rounded-lg bg-background border p-4">
              <span className="text-xs text-muted-foreground font-mono uppercase">Calculated Estimate</span>
              <span className="text-2xl font-bold font-display text-primary mt-1">{simResult}</span>
            </div>
          </CardContent>
        </Card>

        {/* Services Table Card */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Layers className="size-5 text-primary" /> Service Packages
              </CardTitle>
              <CardDescription className="mt-1">
                Configure base pricing and room surcharges (in USD) for primary clean packages.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={addService} className="gap-1.5">
              <Plus className="size-4" /> Add Service
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground font-mono">
                  <tr>
                    <th className="px-4 py-3">Service Details</th>
                    <th className="px-4 py-3 w-40">Base Price ($)</th>
                    <th className="px-4 py-3 w-44">Price / Bedroom ($)</th>
                    <th className="px-4 py-3 w-44">Price / Bathroom ($)</th>
                    <th className="px-4 py-3 w-20 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {services.map((svc, idx) => (
                    <tr key={svc.id || idx} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 align-top space-y-2">
                        <div className="space-y-1">
                          <label className="text-xs font-mono text-muted-foreground">ID: {svc.id}</label>
                          <Input
                            value={svc.name}
                            placeholder="Service Name"
                            onChange={(e) => updateService(idx, "name", e.target.value)}
                            className="font-medium"
                          />
                        </div>
                        <Input
                          value={svc.description}
                          placeholder="Brief Description"
                          onChange={(e) => updateService(idx, "description", e.target.value)}
                          className="text-xs text-muted-foreground"
                        />
                      </td>

                      <td className="p-4 align-top">
                        <div className="relative">
                          <DollarSign className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                          <Input
                            type="number"
                            min={0}
                            step={5}
                            value={svc.basePrice}
                            onChange={(e) => updateService(idx, "basePrice", parseFloat(e.target.value) || 0)}
                            className="pl-8 font-mono"
                          />
                        </div>
                        {svc.basePrice === 0 && (
                          <span className="mt-1 block text-[11px] text-amber-600 dark:text-amber-400 font-mono">
                            Triggers Custom Quote
                          </span>
                        )}
                      </td>

                      <td className="p-4 align-top">
                        <div className="relative">
                          <DollarSign className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                          <Input
                            type="number"
                            min={0}
                            step={5}
                            value={svc.pricePerBedroom}
                            onChange={(e) => updateService(idx, "pricePerBedroom", parseFloat(e.target.value) || 0)}
                            className="pl-8 font-mono"
                          />
                        </div>
                      </td>

                      <td className="p-4 align-top">
                        <div className="relative">
                          <DollarSign className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                          <Input
                            type="number"
                            min={0}
                            step={5}
                            value={svc.pricePerBathroom}
                            onChange={(e) => updateService(idx, "pricePerBathroom", parseFloat(e.target.value) || 0)}
                            className="pl-8 font-mono"
                          />
                        </div>
                      </td>

                      <td className="p-4 align-top text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeService(idx)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                          title="Delete Service"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {services.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">
                        No services defined. Click &quot;Add Service&quot; to create one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Add-Ons Table Card */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Sparkles className="size-5 text-primary" /> Add-On Extras
              </CardTitle>
              <CardDescription className="mt-1">
                Configure fixed extra charges for optional add-ons like Oven Clean or Garage Clean.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={addAddOn} className="gap-1.5">
              <Plus className="size-4" /> Add Extra
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground font-mono">
                  <tr>
                    <th className="px-4 py-3">Add-On Details</th>
                    <th className="px-4 py-3 w-56">Price ($ USD)</th>
                    <th className="px-4 py-3 w-20 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {addOns.map((addOn, idx) => (
                    <tr key={addOn.id || idx} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 align-top space-y-1">
                        <label className="text-xs font-mono text-muted-foreground">ID: {addOn.id}</label>
                        <Input
                          value={addOn.name}
                          placeholder="Add-on Name"
                          onChange={(e) => updateAddOn(idx, "name", e.target.value)}
                          className="font-medium"
                        />
                      </td>

                      <td className="p-4 align-top">
                        <div className="relative">
                          <DollarSign className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                          <Input
                            type="number"
                            min={0}
                            step={5}
                            value={addOn.price}
                            onChange={(e) => updateAddOn(idx, "price", parseFloat(e.target.value) || 0)}
                            className="pl-8 font-mono"
                          />
                        </div>
                      </td>

                      <td className="p-4 align-top text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeAddOn(idx)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                          title="Delete Add-On"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {addOns.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-muted-foreground">
                        No add-ons defined. Click &quot;Add Extra&quot; to create one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
