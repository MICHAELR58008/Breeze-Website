"use client"

export interface AboutProps {
  eyebrow?: string
  ownerName?: string
  nameInitial?: string
  tagline?: string
  bioParagraph1?: string
  bioParagraph2?: string
}

const defaults: AboutProps = {
  eyebrow: "03 / Meet the owner",
  ownerName: "Evelyn Rivas",
  nameInitial: "E",
  tagline: "Owner-led care in Ventura County.",
  bioParagraph1:
    "Evelyn started Breeze because she believes a clean home shouldn't feel like a luxury. Based in Ventura County, she and her team treat every home like their own — with care, attention to detail, and a genuine pride in making spaces shine.",
  bioParagraph2:
    "When you book with Breeze, you're not just getting a clean home — you're getting someone who truly cares about getting it right.",
}

export function About(props: AboutProps) {
  const { eyebrow, ownerName, nameInitial, tagline, bioParagraph1, bioParagraph2 } = {
    ...defaults,
    ...props,
  }

  return (
    <section id="about" className="mx-auto grid max-w-[1400px] border-x border-border lg:grid-cols-12">
      <div className="relative min-h-[440px] overflow-hidden border-b border-border bg-primary p-8 text-primary-foreground lg:col-span-5 lg:border-b-0 lg:border-r">
        <div className="grid-surface absolute inset-0 opacity-15" />
        <div className="relative flex h-full flex-col justify-between">
          <p className="font-mono text-xs uppercase tracking-widest">{eyebrow}</p>
          <div>
            <p className="font-display text-[9rem] leading-none">{nameInitial}</p>
            <p className="text-sm">{tagline}</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-center gap-7 p-6 sm:p-10 lg:col-span-7 lg:p-16">
        <h2 className="font-display text-6xl sm:text-8xl">{ownerName}</h2>
        <p className="text-pretty text-lg leading-relaxed text-muted-foreground">{bioParagraph1}</p>
        <p className="text-pretty text-lg leading-relaxed">{bioParagraph2}</p>
      </div>
    </section>
  )
}
