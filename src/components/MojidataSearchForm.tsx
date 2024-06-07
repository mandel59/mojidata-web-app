'use client'

import GetForm from './GetForm'
import { useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import './MojidataSearchForm.css'

export default function MojidataSearchForm() {
  const pathname = usePathname()
  const pathIsIdsfind = pathname === '/search'
  const searchParams = useSearchParams()
  const initialQuery = pathIsIdsfind ? searchParams.get('query') ?? '' : ''
  const [query, setQuery] = useState<string>(initialQuery)
  return (
    <div className="mojidata-search">
      <GetForm action="/search">
        <article>
          <h2>Mojidata Search</h2>
          <details>
            <summary>Usage</summary>
            <table>
              <thead>
                <tr><th>Query type</th><th>Example</th><th>Description</th></tr>
              </thead>
              <tbody>
                <tr><td>Component Characters</td><td>日　月</td><td>Search characters having the specified characters as components</td></tr>
                <tr><td>Component IDS</td><td>⿰日月</td><td>Search characters having the specified IDS as components</td></tr>
                <tr><td>Whole IDS</td><td>＠⿰？月</td><td>Search characters having the specified IDS as whole structure</td></tr>
                <tr><td>Search the character</td><td>：日</td><td>Search the specified character</td></tr>
                <tr><td>Search the character (Kana)</td><td>：あ</td><td>Search the specified character</td></tr>
                <tr><td>Code point</td><td>U+21234</td><td>Specify scalar value by hexadecimal</td></tr>
                <tr><td>Japanese Kun reading</td><td>あか</td><td></td></tr>
                <tr><td>Japanese Kun reading (Prefix)</td><td>あか＊</td><td>Use an asterisk for prefix search</td></tr>
                <tr><td>Japanese On reading</td><td>セキ</td><td></td></tr>
                <tr><td>Total strokes</td><td>＝１０</td><td>Search for characters with 10 strokes.</td></tr>
                <tr><td>Total strokes (Range)</td><td>＞＝１　＜＝３</td><td>Search for characters with a stroke count between 1 and 3.</td></tr>
                <tr><td>MJ database serial number</td><td>MJ052285</td><td>Search for MJ characters by Moji Jōhō Kiban database serial numbers.</td></tr>
              </tbody>
            </table>
          </details>
          <div key="query">
            <input
              name="query"
              value={query}
              placeholder="Search by reading, total strokes, code point or a character."
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <footer>
            <button>Search</button>
          </footer>
        </article>
      </GetForm>
    </div>
  )
}
