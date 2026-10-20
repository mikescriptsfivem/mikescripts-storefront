/** URL-safe slug, e.g. "MS_FlightSim | Aviation" → "ms-flightsim-aviation". */
export function slugify(value: string, maxLength = 80): string {
  const slug = value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  if (slug.length <= maxLength) return slug
  const cut = slug.slice(0, maxLength)
  const lastDash = cut.lastIndexOf('-')
  return (lastDash > maxLength / 2 ? cut.slice(0, lastDash) : cut).replace(/-+$/, '')
}

/** Assigns unique slugs: preferred slug, else the name, else the id; duplicates get "-<id>". */
export function uniqueSlugs<T>(items: T[], pick: (item: T) => { preferred: string | null | undefined; name: string; id: number }) {
  const used = new Set<string>()
  const result = new Map<T, string>()
  for (const item of items) {
    const { preferred, name, id } = pick(item)
    let slug = slugify(preferred ?? '') || slugify(name) || String(id)
    if (used.has(slug)) slug = `${slug}-${id}`
    used.add(slug)
    result.set(item, slug)
  }
  return result
}
