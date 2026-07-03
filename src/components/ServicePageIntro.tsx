type ServicePageIntroProps = {
  eyebrow: string
  title: string
  description: string
}

export default function ServicePageIntro({ eyebrow, title, description }: ServicePageIntroProps) {
  return (
    <div className="mx-auto mb-6 max-w-3xl text-center md:mb-8">
      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">{eyebrow}</p>
      <h1 className="text-3xl font-black leading-tight md:text-5xl">{title}</h1>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
        {description}
      </p>
    </div>
  )
}
