"use client"

import { useTina } from "tinacms/dist/react"
import { BreezeSite } from "@/components/breeze-site"
import type { TinaResult } from "@/lib/queries"
import type { Block } from "@/lib/page-sections"

interface HomePageClientProps {
  tina: TinaResult
}

export function HomePageClient({ tina }: HomePageClientProps) {
  const { data } = useTina({
    query: tina.query,
    variables: tina.variables,
    data: tina.data,
  })

  const sections = ((data as any)?.page?.sections as Block[]) || []

  return <BreezeSite sections={sections} />
}
