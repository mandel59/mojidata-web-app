'use client'

import { ReactElement, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import type { Language } from '@/getText'
import { getText } from '@/getText'
import IpamjmCharImg from '@/components/IpamjmCharImg'

const IPAMJM_FONT_FAMILY = '"Mojidata-IPAmjMincho"'

function checkIpamjmFontAvailability(char: string) {
  if (typeof document === 'undefined' || !('fonts' in document)) {
    return false
  }
  return document.fonts.check(`16px ${IPAMJM_FONT_FAMILY}`, char)
}

function createDisplayModeHref(
  pathname: string,
  searchParams: URLSearchParams,
  forceMojiJohoImage: boolean,
) {
  const nextParams = new URLSearchParams(searchParams)
  if (forceMojiJohoImage) {
    nextParams.set('mojiJohoImage', '1')
  } else {
    nextParams.delete('mojiJohoImage')
  }
  const query = nextParams.toString()
  return query ? `${pathname}?${query}` : pathname
}

export interface MojiJohoCharProps {
  char: string
  size?: number
  forceImage: boolean
  bot: boolean
}

export function MojiJohoChar(props: MojiJohoCharProps): ReactElement {
  const { char, size = 110, forceImage, bot } = props
  const [hasIpamjmFont, setHasIpamjmFont] = useState(() =>
    forceImage ? false : checkIpamjmFontAvailability(char),
  )

  useEffect(() => {
    if (forceImage) {
      return
    }
    if (typeof document === 'undefined' || !('fonts' in document)) {
      return
    }
    document.fonts.ready.then(() => {
      setHasIpamjmFont(checkIpamjmFontAvailability(char))
    })
  }, [char, forceImage])

  if (bot || (!forceImage && hasIpamjmFont)) {
    return <span className="mojidata-raw-char mojidata-mojijoho">{char}</span>
  }

  return <IpamjmCharImg char={char} size={size} alt={char} />
}

export function MojiJohoDisplayModeControl(props: {
  lang: Language
  forceImage: boolean
}): ReactElement {
  const { lang, forceImage } = props
  const pathname = usePathname() ?? ''
  const searchParams = useSearchParams()
  const baseSearchParams = useMemo(
    () => new URLSearchParams(searchParams.toString()),
    [searchParams],
  )

  const autoHref = createDisplayModeHref(pathname, baseSearchParams, false)
  const imageHref = createDisplayModeHref(pathname, baseSearchParams, true)

  return (
    <div className="mojidata-display-mode-control">
      <span>{getText('moji-joho.display.label', lang)}</span>
      <Link
        href={autoHref}
        className={!forceImage ? 'is-active' : undefined}
        scroll={false}
      >
        {getText('moji-joho.display.auto', lang)}
      </Link>
      <Link
        href={imageHref}
        className={forceImage ? 'is-active' : undefined}
        scroll={false}
      >
        {getText('moji-joho.display.image', lang)}
      </Link>
    </div>
  )
}
