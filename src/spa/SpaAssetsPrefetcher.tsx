'use client'

import { useEffect } from 'react'
import { mojidataApiAssets } from './mojidataApiAssets'

type AssetKind = 'idsfind' | 'mojidata'

const prefetched = new Set<string>()

function prefetchUrl(url: string) {
  if (prefetched.has(url)) return
  prefetched.add(url)
  void fetch(url, { cache: 'force-cache' }).catch(() => {})
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

