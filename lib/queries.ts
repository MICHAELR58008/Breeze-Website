import fs from "fs/promises"
import path from "path"
import { type Block, defaultBlocks } from "@/lib/page-sections"
import { navDefaults, type NavigationConfig } from "@/lib/navigation-config"

export interface TinaResult {
  data: any
  query: string
  variables: { relativePath: string }
}

export interface PageData {
  tina: TinaResult | null
  sections: Block[]
  navigation: NavigationConfig
}

/**
 * Fetch page data from TinaCMS.
 * Returns the raw GraphQL result (for useTina), extracted sections, and navigation config.
 * Falls back to defaults when Tina is unavailable.
 */
export async function fetchPageData(): Promise<PageData> {
  try {
    const { client } = await import("@/tina/__generated__/client")
    const result = await client.queries.page({ relativePath: "page.json" })
    const data = result.data as any
    return {
      tina: {
        data: result.data,
        query: result.query,
        variables: { relativePath: "page.json" },
      },
      sections: ((data.page?.sections as any[]) || []).map((s: any) => ({
        ...s,
        _template: s._template || s.__typename?.replace("PageSections", "").toLowerCase(),
      })) as Block[],
      navigation: (data.page?.navigation as NavigationConfig) || navDefaults,
    }
  } catch {
    try {
      const pagePath = path.join(process.cwd(), "content", "page", "page.json")
      const raw = await fs.readFile(pagePath, "utf-8")
      const data = JSON.parse(raw)
      return {
        tina: null,
        sections: (data.sections || []) as Block[],
        navigation: (data.navigation as NavigationConfig) || navDefaults,
      }
    } catch {
      return { tina: null, sections: defaultBlocks, navigation: navDefaults }
    }
  }
}
