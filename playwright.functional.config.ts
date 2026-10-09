import { defineConfig } from '@playwright/test'
import config from './playwright.config'

// Functional coverage uses real app routes and databases. Screenshot baselines
// and Storybook have their own verification commands and server configuration.
export default defineConfig({
  ...config,
  workers: 2,
  projects: config.projects?.map((project) => project.name === 'setup' ? project : {
    ...project,
    testIgnore: ['setup.spec.ts', '**/*-visual.spec.ts', '**/storybook-*.spec.ts'],
  }),
})
