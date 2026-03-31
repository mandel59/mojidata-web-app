export interface MojidataVariantRelationLine {
  label: string
  values: string
}

export interface MojidataVariantEntry {
  key: string
  heading: string
  char: string
  href?: string
  className: string
  useGlyphImage: boolean
  relationLines: MojidataVariantRelationLine[]
}
