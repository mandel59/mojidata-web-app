'use client'

import GetForm from './GetForm'
import { useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import './MojidataSearchForm.css'
import { Language, getText } from '@/getText'

export interface MojidataSearchFormProps {
  lang: Language
  action?: string
}
export default function MojidataSearchForm(props: MojidataSearchFormProps) {
  const { lang, action = '/search' } = props
  const pathname = usePathname()
  const pathIsIdsfind = pathname.endsWith('/search') || pathname.endsWith('/search-spa')
  const searchParams = useSearchParams()
  const initialQuery = pathIsIdsfind ? searchParams.get('query') ?? '' : ''
  const [query, setQuery] = useState<string>(initialQuery)
  return (
    <div className="mojidata-search">
      <GetForm action={action}>
        <article>
          <h2>{getText('mojidata-search.caption', lang)}</h2>
          <details>
            <summary>{getText('usage.summary', lang)}</summary>
            <table>
              <thead>
                <tr>
                  <th>{getText('query-type.th', lang)}</th>
                  <th>{getText('example.th', lang)}</th>
                  <th>{getText('description.th', lang)}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{getText('component-characters.query-type', lang)}</td>
                  <td>日　月</td>
                  <td>{getText('component-characters.description', lang)}</td>
                </tr>
                <tr>
                  <td>{getText('component-ids.query-type', lang)}</td>
                  <td>⿰日月</td>
                  <td>{getText('component-ids.description', lang)}</td>
                </tr>
                <tr>
                  <td>{getText('whole-ids.query-type', lang)}</td>
                  <td>＠⿰？月</td>
                  <td>{getText('whole-ids.description', lang)}</td>
                </tr>
                <tr>
                  <td>{getText('search-character.query-type', lang)}</td>
                  <td>：日</td>
                  <td>{getText('search-character.description', lang)}</td>
                </tr>
                <tr>
                  <td>{getText('search-character-kana.query-type', lang)}</td>
                  <td>：あ</td>
                  <td>{getText('search-character-kana.description', lang)}</td>
                </tr>
                <tr>
                  <td>{getText('code-point.query-type', lang)}</td>
                  <td>U+21234</td>
                  <td>{getText('code-point.description', lang)}</td>
                </tr>
                <tr>
                  <td>{getText('japanese-kun-reading.query-type', lang)}</td>
                  <td>あか</td>
                  <td>{getText('japanese-kun-reading.description', lang)}</td>
                </tr>
                <tr>
                  {/* <td>Japanese Kun reading (Prefix)</td> */}
                  <td>
                    {getText('japanese-kun-reading-prefix.query-type', lang)}
                  </td>
                  <td>あか＊</td>
                  <td>
                    {getText('japanese-kun-reading-prefix.description', lang)}
                  </td>
                </tr>
                <tr>
                  <td>{getText('japanese-on-reading.query-type', lang)}</td>
                  <td>セキ</td>
                  <td>{getText('japanese-on-reading.description', lang)}</td>
                </tr>
                <tr>
                  <td>{getText('total-strokes.query-type', lang)}</td>
                  <td>＝１０</td>
                  <td>{getText('total-strokes.description', lang)}</td>
                </tr>
                <tr>
                  <td>{getText('total-strokes-range.query-type', lang)}</td>
                  <td>＞＝１　＜＝３</td>
                  <td>{getText('total-strokes-range.description', lang)}</td>
                </tr>
                <tr>
                  <td>
                    {getText('mj-database-serial-number.query-type', lang)}
                  </td>
                  <td>MJ052285</td>
                  <td>
                    {getText('mj-database-serial-number.description', lang)}
                  </td>
                </tr>
              </tbody>
            </table>
          </details>
          <div key="query">
            <input
              name="query"
              value={query}
              placeholder={getText('mojidata-search.placeholder', lang)}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <footer>
            <button>{getText('search.button', lang)}</button>
          </footer>
        </article>
      </GetForm>
    </div>
  )
}
