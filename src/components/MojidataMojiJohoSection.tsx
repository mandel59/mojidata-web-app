'use client'

import { startTransition, useEffect, useState } from 'react'
import type { Language } from '@/getText'
import { getText } from '@/getText'
import { toCodePoint } from '@/mojidata/mojidataShared'
import { MojiJohoChar, MojiJohoDisplayModeControl } from '@/components/MojiJohoChar'
import mojiJohoStyles from '@/components/MojiJohoChar.module.css'
import charFrameStyles from '@/components/MojidataCharFrame.module.css'

function toCodePoints(s: string) {
  return [...s].map((c) => toCodePoint(c)).join(' ')
}

export interface MojidataMojiJohoRecord {
  code: string
  char: string
  ucs: string | null
  compat: boolean
  x0213: boolean
  x0212: boolean
  href: string
}

export interface MojidataMjihRecord {
  MJ文字図形名: string
  UCS符号位置: string | null
  文字?: string | null
}

export interface MojidataMojiJohoSectionProps {
  lang: Language
  ucs: string
  bot: boolean
  initialForceImage: boolean
  isJISX0213char: boolean
  mji: MojidataMojiJohoRecord[]
  mjih: MojidataMjihRecord[]
}

export default function MojidataMojiJohoSection(
  props: MojidataMojiJohoSectionProps,
) {
  const { lang, ucs, bot, initialForceImage, isJISX0213char, mji, mjih } = props
  const [forceImage, setForceImage] = useState(initialForceImage)

  useEffect(() => {
    setForceImage(initialForceImage)
  }, [initialForceImage])

  const setDisplayMode = (nextForceImage: boolean) => {
    startTransition(() => {
      setForceImage(nextForceImage)
    })

    if (typeof window === 'undefined') return

    const nextUrl = new URL(window.location.href)
    if (nextForceImage) {
      nextUrl.searchParams.set('mojiJohoImage', '1')
    } else {
      nextUrl.searchParams.delete('mojiJohoImage')
    }
    window.history.replaceState(window.history.state, '', nextUrl)
  }

  return (
    <>
      <h3 id="Moji_Joho">{getText('moji-joho.h4', lang)}</h3>
      <MojiJohoDisplayModeControl
        lang={lang}
        forceImage={forceImage}
        onChangeForceImage={setDisplayMode}
      />
      {mji.length > 0 && (
        <div className="mojidata-chars-comparison">
          {mji.map((record) => (
            <figure key={record.code}>
              <figcaption>
                <a href={record.href}>{record.code}</a>
                {record.ucs === ucs && !record.compat && (
                  <small title={getText('default-glyph.title', lang)}>
                    {' '}
                    {getText('default-glyph.small', lang)}
                  </small>
                )}
                {isJISX0213char &&
                  !record.x0213 &&
                  record.ucs === ucs &&
                  !record.compat && (
                    <small title={getText('not-jp04-glyph.title', lang)}>
                      {' '}
                      {getText('not-jp04-glyph.small', lang)}
                    </small>
                  )}
                {record.x0213 && !record.compat && (
                  <small title={getText('jp04-glyph.title', lang)}>
                    {' '}
                    {getText('jp04-glyph.small', lang)}
                  </small>
                )}
                {!(record.ucs === ucs) && !record.compat && record.x0212 && (
                  <small title={getText('hojo-glyph.title', lang)}>
                    {' '}
                    {getText('hojo-glyph.small', lang)}
                  </small>
                )}
                {record.compat && record.ucs && (
                  <small
                    title={`${getText('compatibility-variant.title', lang)} ${toCodePoint(record.ucs)}`}
                  >
                    {' '}
                    {getText('compatibility-variant.small', lang)}
                  </small>
                )}
                <br />
                <small>{toCodePoints(record.char)}</small>
              </figcaption>
              <div
                className={`mojidata-char ${charFrameStyles.char}`}
                lang="ja"
              >
                <MojiJohoChar
                  char={record.char}
                  forceImage={forceImage}
                  bot={bot}
                />
              </div>
            </figure>
          ))}
        </div>
      )}
      {mjih.length > 0 && (
        <div className="mojidata-chars-comparison">
          {mjih.map((record) => (
            <figure key={record.MJ文字図形名}>
              <figcaption>
                {record.MJ文字図形名}
                <br />
                <small>{record.UCS符号位置}</small>
              </figcaption>
              <div
                className={`mojidata-char ${charFrameStyles.char}`}
                lang="ja"
              >
                {record.文字 ? (
                  <MojiJohoChar
                    char={record.文字}
                    forceImage={forceImage}
                    bot={bot}
                  />
                ) : (
                  <span
                    className={`mojidata-raw-char mojidata-mojijoho ${charFrameStyles.rawChar} ${mojiJohoStyles.mojiJoho}`}
                  >
                    {record.UCS符号位置}
                  </span>
                )}
              </div>
            </figure>
          ))}
        </div>
      )}
    </>
  )
}
