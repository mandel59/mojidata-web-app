import type { Preview } from '@storybook/nextjs'
import '@/app/[lang]/fonts.css'
import '@/app/[lang]/theme.css'
import '@/app/[lang]/base.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    nextjs: {
      appDirectory: true,
    },
  },
};

export default preview;
