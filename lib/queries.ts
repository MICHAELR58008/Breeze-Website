import { client } from "@/tina/__generated__/client"
import { type Block, defaultBlocks } from "@/lib/page-sections"

export interface TinaResult {
  data: any
  query: string
  variables: { relativePath: string }
}

export interface PageData {
  tina: TinaResult | null
  sections: Block[]
}

/**
 * Fetch page data from TinaCMS.
 * Returns the raw GraphQL result (for useTina) and extracted sections.
 * Falls back to defaultBlocks when Tina is unavailable.
 */
export async function fetchPageData(): Promise<PageData> {
  try {
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
    }
  } catch {
    return {
      tina: null,
      sections: defaultBlocks,
    }
  }
}
