"use client"

import { useTina } from "tinacms/dist/react"
import { BreezeSite } from "@/components/breeze-site"
import type { TinaResult } from "@/lib/queries"
import type { Block } from "@/lib/page-sections"
import type { NavigationConfig } from "@/lib/navigation-config"

interface HomePageClientProps {
  tina: TinaResult
  navigation?: NavigationConfig
}

export function HomePageClient({ tina, navigation }: HomePageClientProps) {
  const { data } = useTina({
    query: tina.query,
    variables: tina.variables,
    data: tina.data,
  })

  // Normalize __typename → _template so renderBlock works with both
  const rawSections = ((data as any)?.page?.sections as any[]) || []
  const sections: Block[] = rawSections.map((s: any) => ({
    ...s,
    _template: s._template || s.__typename?.replace("PageSections", "").toLowerCase(),
  }))

  // Use navigation from Tina if available, else the passed prop
  const navFromTina = (data as any)?.page?.navigation as NavigationConfig | undefined
  const navConfig = navFromTina || navigation

  return <BreezeSite sections={sections} navigation={navConfig} />
}
