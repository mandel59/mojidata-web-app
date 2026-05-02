'use client'

import { useEffect } from 'react'
import { mojidataApiAssets } from './mojidataApiAssets'
import { prefetchSpaAsset } from './spaAssetCache'

type AssetKind = 'idsfind' | 'mojidata'

const prefetched = new Set<string>()

function prefetchUrl(url: string) {
  if (prefetched.has(url)) return
  prefetched.add(url)
  void prefetchSpaAsset(url).catch(() => {})
}

export default function SpaAssetsPrefetcher(props: { kind: AssetKind }) {
  const { kind } = props
  useEffect(() => {
    prefetchUrl(mojidataApiAssets.sqlWasmUrl)
    if (kind === 'idsfind') {
      prefetchUrl(mojidataApiAssets.idsfindDbUrl)
    } else {
      prefetchUrl(mojidataApiAssets.mojidataDbUrl)
    }
  }, [kind])
  return null
}
