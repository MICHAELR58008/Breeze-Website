/* ── Nav-link override provided by TinaCMS ── */

export interface NavLinkOverride {
  /** Must match a section _template name (e.g. "services", "about") */
  sectionId: string
  /** Override label – falls back to sectionLabels entry when empty */
  label: string
  /** Whether the link is shown in the nav bar (default true) */
  visible?: boolean
}

/* ── Full navigation configuration from CMS ── */

export interface NavigationConfig {
  /** Per-link overrides; null/undefined means no overrides applied */
  navLinks?: NavLinkOverride[]

  /* CTA button */
  ctaVisible?: boolean
  ctaText?: string

  /* Link typography */
  linkFontSize?: number
  linkColor?: string
  linkHoverColor?: string
  linkActiveColor?: string
  linkUppercase?: boolean

  /* Bar chrome */
  barBackground?: string
  barBorderColor?: string
  barHeight?: number
  barBlur?: boolean
}

/* ── Defaults matching the current hardcoded nav behaviour ── */

export const navDefaults: NavigationConfig = {
  ctaVisible: true,
  ctaText: "Get a free quote",
  linkFontSize: 11,
  linkColor: "",
  linkUppercase: true,
}
