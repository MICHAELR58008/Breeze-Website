import { client } from "@/tina/__generated__/client"
import { type Block, defaultBlocks } from "@/lib/page-sections"

/**
 * Fetch page sections from TinaCMS.
 * Returns default blocks if TinaCloud is not configured.
 */
export async function fetchPageSections(): Promise<Block[]> {
  try {
    // Always try the Tina client — works locally with `tinacms dev`
    // and in production with real TinaCloud credentials
    const result = await client.queries.page({ relativePath: "page.json" })
    const data = result.data as any
    return data.page.sections as Block[]
  } catch {
    // No CMS available — return hardcoded defaults
    return defaultBlocks
  }
}
