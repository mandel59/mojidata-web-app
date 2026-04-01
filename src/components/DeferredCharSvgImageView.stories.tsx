import type { ReactNode } from 'react'
import DeferredCharSvgImageView from './DeferredCharSvgImageView'

const meta = {
  title: 'Mojidata/DeferredCharSvgImageView',
  component: DeferredCharSvgImageView,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Pure view for deferred SVG glyphs. Shared design tokens still come from app-level CSS variables, while fallback layering, image stacking, and IPAmj fallback font rules are local to the component.',
      },
    },
  },
  args: {
    char: '漢',
    size: 110,
    alt: '漢',
    source: 'glyphwiki',
    loaded: false,
    renderImage: false,
    imageSrc: '/storybook-fixtures/glyphwiki-u6f22.svg',
  },
  decorators: [
    (Story: () => ReactNode) => (
      <div
        style={{
          background: '#fff',
          padding: '24px',
        }}
      >
        <div
          lang="ja"
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexShrink: 0,
            fontSize: '100px',
            width: '120px',
            height: '120px',
            margin: '0.25rem 0 0',
            border: '1px solid hsl(var(--border))',
            borderRadius: '0.6rem',
            background: '#fff',
            color: '#000',
            textAlign: 'center',
            overflow: 'clip',
          }}
        >
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
    imageSrc: '/storybook-fixtures/glyphwiki-u6f22.svg',
  },
}

export const GlyphWikiLoaded = {
  args: {
    char: '漢',
    source: 'glyphwiki',
    loaded: true,
    renderImage: true,
    imageSrc: '/storybook-fixtures/glyphwiki-u6f22.svg',
  },
}

export const IpamjmFallback = {
  args: {
    char: '㐂',
    alt: '㐂',
    source: 'ipamjm',
    loaded: false,
    renderImage: false,
    imageSrc: '/storybook-fixtures/ipamjm-u3402.svg',
  },
}

export const IpamjmLoaded = {
  args: {
    char: '㐂',
    alt: '㐂',
    source: 'ipamjm',
    loaded: true,
    renderImage: true,
    imageSrc: '/storybook-fixtures/ipamjm-u3402.svg',
  },
}
