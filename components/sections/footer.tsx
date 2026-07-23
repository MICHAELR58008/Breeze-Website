import { Brand } from "@/components/sections/shared"
import { tinaField } from "tinacms/dist/tina-field"

export interface FooterProps {
  tagline?: string
  [key: string]: any
}

const defaults: FooterProps = {
  tagline: "Professional cleaning services in Ventura County, California.",
}

export function Footer(props: FooterProps) {
  const { tagline, bodySize, bodyColor } = { ...defaults, ...props }

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-8 px-5 py-10 sm:px-8 md:flex-row md:items-end md:justify-between lg:px-12">
        <div className="flex flex-col gap-3">
          <Brand />
          {tagline?.trim() && (
            <p data-tina-field={tinaField(props, "tagline")} className="max-w-sm text-sm text-muted-foreground" style={{ fontSize: bodySize ? `${bodySize}px` : undefined, color: bodyColor || undefined }}>{tagline}</p>
          )}
        </div>
        <div className="flex flex-col gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground md:text-right">
          <a href="#top" className="hover:text-foreground">
            To the top
          </a>
          <span>&copy; {new Date().getFullYear()} Breeze Cleaning</span>
        </div>
      </div>
    </footer>
  )
}
