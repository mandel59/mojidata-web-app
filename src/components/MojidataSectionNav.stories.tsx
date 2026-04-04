import type { ReactNode } from 'react'
import MojidataSectionNav from './MojidataSectionNav'

const sections = [
  { id: 'Character_Data', label: 'Character Data' },
  { id: 'Moji_Joho', label: 'Moji_Joho' },
  { id: 'Variants', label: 'Variants' },
  { id: 'Regional_Variants', label: 'Regional Variants' },
]

function StoryFrame(props: {
  width: number
  minHeight: number
  children: ReactNode
}) {
  const { width, minHeight, children } = props

  return (
    <div
      style={{
        width: `${width}px`,
        minHeight: `${minHeight}px`,
        padding: '24px',
        background: 'hsl(var(--muted) / 0.25)',
      }}
    >
      {children}
      <div style={{ height: '720px' }}>
        {sections.map((section, index) => (
          <section
            key={section.id}
            id={section.id}
            style={{
              minHeight: '180px',
              paddingTop: index === 0 ? '24px' : '64px',
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: '1rem',
                fontWeight: 600,
              }}
            >
              {section.label}
            </h2>
          </section>
        ))}
      </div>
    </div>
  )
}

const meta = {
  title: 'Mojidata/MojidataSectionNav',
  component: MojidataSectionNav,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Client navigation for Mojidata sections. The Storybook stories provide a mock article structure so active-state styling and responsive mobile/sidebar layouts can be reviewed in isolation.',
      },
    },
  },
  args: {
    sections,
    anchorKey: 'storybook-nav',
  },
}

export default meta

export const Mobile = {
  decorators: [
    (Story: () => ReactNode) => (
      <StoryFrame width={390} minHeight={900}>
        <Story />
      </StoryFrame>
    ),
  ],
}

export const Desktop = {
  decorators: [
    (Story: () => ReactNode) => (
      <StoryFrame width={1280} minHeight={960}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '220px minmax(0, 1fr)',
            gap: '24px',
            alignItems: 'start',
          }}
        >
          <Story />
          <article
            style={{
              minHeight: '720px',
              border: '1px solid hsl(var(--border))',
              borderRadius: '1rem',
              background: '#fff',
            }}
          />
        </div>
      </StoryFrame>
    ),
  ],
}
