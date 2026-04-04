'use client'

import { ReactElement, useEffect, useState } from 'react'
import type { Language } from '@/getText'
import { getText } from '@/getText'
import IpamjmCharImg from '@/components/IpamjmCharImg'
import styles from './MojiJohoChar.module.css'
import charFrameStyles from './MojidataCharFrame.module.css'
import MojiJohoDisplayModeControlView from './MojiJohoDisplayModeControlView'

const IPAMJM_FONT_FAMILY = '"Mojidata-IPAmjMincho"'

function checkIpamjmFontAvailability(char: string) {
  if (typeof document === 'undefined' || !('fonts' in document)) {
    return false
  }
  return document.fonts.check(`16px ${IPAMJM_FONT_FAMILY}`, char)
}

export interface MojiJohoCharProps {
  char: string
  size?: number
  forceImage: boolean
  bot: boolean
}

export function MojiJohoChar(props: MojiJohoCharProps): ReactElement {
  const { char, size = 110, forceImage, bot } = props
  const [hasIpamjmFont, setHasIpamjmFont] = useState(false)

  useEffect(() => {
    let cancelled = false
    if (forceImage) {
      return
    }
    if (typeof document === 'undefined' || !('fonts' in document)) {
      return
    }

    const update = () => {
      if (cancelled) return
      setHasIpamjmFont(checkIpamjmFontAvailability(char))
    }

    update()
    document.fonts.ready.then(update)

    return () => {
      cancelled = true
    }
  }, [char, forceImage])

  if (bot || (!forceImage && hasIpamjmFont)) {
    return (
      <span className={`${charFrameStyles.rawChar} ${styles.mojiJoho}`}>
        {char}
      </span>
    )
  }

  return (
    <IpamjmCharImg
      char={char}
      size={size}
      alt={char}
      loading="eager"
      fetchPriority="high"
    />
  )
}

export function MojiJohoDisplayModeControl(props: {
  lang: Language
  forceImage: boolean
  onChangeForceImage: (forceImage: boolean) => void
}): ReactElement {
  const { lang, forceImage, onChangeForceImage } = props

  return (
    <MojiJohoDisplayModeControlView
      label={getText('moji-joho.display.label', lang)}
      autoLabel={getText('moji-joho.display.auto', lang)}
      imageLabel={getText('moji-joho.display.image', lang)}
      forceImage={forceImage}
      onSelectAuto={() => onChangeForceImage(false)}
      onSelectImage={() => onChangeForceImage(true)}
    />
  )
}
