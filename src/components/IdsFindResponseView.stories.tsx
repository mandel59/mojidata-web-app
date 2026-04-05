import IdsFindResponseView from './IdsFindResponseView'
import GlyphWikiCharImg from './GlyphWikiCharImg'

const results = ['漢', '漢', '字', '学', '水', '木']

const meta = {
  title: 'Search/Interactive/IdsFindResponseView',
  component: IdsFindResponseView,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Interactive result-list component shared by search and idsfind. Storybook injects fixture-backed glyph images so card spacing, glyph sizing, and pager layout can be checked without the live SVG API.',
      },
    },
  },
  args: {
    results,
    total: results.length,
    offset: 0,
    size: 50,
    pageNum: 1,
    totalPages: 3,
    prev: null,
    next: '/mojidata?page=2',
    wholeSearch: false,
    bot: false,
    disableExternalLinks: true,
    pagerPrefetch: false,
    resultPrefetchOnIntent: false,
    renderGlyph: (char: string) => (
      <GlyphWikiCharImg
        char={char}
        size={55}
        alt={char}
        debugSrc="/storybook-fixtures/glyphwiki-u6f22.svg"
      />
    ),
  },
}

export default meta

export const ResultsGrid = {}

export const EmptyResults = {
  args: {
    results: [],
    total: 0,
    totalPages: 1,
    next: null,
  },
}
