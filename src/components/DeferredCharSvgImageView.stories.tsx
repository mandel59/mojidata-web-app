import type { ReactNode } from 'react'
import DeferredCharSvgImageView from './DeferredCharSvgImageView'

function makeMockSvgDataUrl(label: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 110" width="110" height="110"><rect width="110" height="110" fill="white"/><rect x="5" y="5" width="100" height="100" fill="none" stroke="#222" stroke-width="2"/><text x="55" y="72" text-anchor="middle" font-size="72" font-family="serif" fill="#111">${label}</text></svg>`
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

const meta = {
  title: 'Mojidata/DeferredCharSvgImageView',
  component: DeferredCharSvgImageView,
  parameters: {
    layout: 'centered',
  },
  args: {
    char: '漢',
    size: 110,
    alt: '漢',
    source: 'glyphwiki',
    loaded: false,
    renderImage: false,
    imageSrc: makeMockSvgDataUrl('漢'),
  },
  decorators: [
    (Story: () => ReactNode) => (
      <div
        style={{
          background: '#fff',
          padding: '24px',
        }}
      >
        <div className="mojidata-char" lang="ja">
          <Story />
        </div>
      </div>
    ),
  ],
}

export default meta

export const GlyphWikiFallback = {
  args: {
    char: '漢',
    source: 'glyphwiki',
    loaded: false,
    renderImage: false,
    imageSrc: makeMockSvgDataUrl('漢'),
  },
}

export const GlyphWikiLoaded = {
  args: {
    char: '漢',
    source: 'glyphwiki',
    loaded: true,
    renderImage: true,
    imageSrc: makeMockSvgDataUrl('漢'),
  },
}

export const IpamjmFallback = {
  args: {
    char: '𪜈',
    alt: '𪜈',
    source: 'ipamjm',
    loaded: false,
    renderImage: false,
    imageSrc: makeMockSvgDataUrl('MJ'),
  },
}

export const IpamjmLoaded = {
  args: {
    char: '𪜈',
    alt: '𪜈',
    source: 'ipamjm',
    loaded: true,
    renderImage: true,
    imageSrc: makeMockSvgDataUrl('MJ'),
  },
}
