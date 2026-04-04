import type { ReactNode } from 'react'
import LoadingArticle from './LoadingArticle'
import LoadingMojidataArticle from './LoadingMojidataArticle'

function StoryFrame(props: {
  width: number
  padding?: string
  children: ReactNode
}) {
  const { width, padding = '24px', children } = props

  return (
    <div
      style={{
        width: `${width}px`,
        padding,
        background: 'hsl(var(--muted) / 0.2)',
      }}
    >
      {children}
    </div>
  )
}

const meta = {
  title: 'App/Pure Views/Loading States',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Loading skeletons used during server-data navigation. These stories lock the article-level loading chrome in isolation so structural CSS cleanup does not drift their spacing or frame metrics.',
      },
    },
  },
}

export default meta

export const SearchResultsPanel = {
  render: () => (
    <StoryFrame width={720}>
      <LoadingArticle />
    </StoryFrame>
  ),
}

export const MojidataArticle = {
  render: () => (
    <StoryFrame width={960}>
      <LoadingMojidataArticle />
    </StoryFrame>
  ),
}
