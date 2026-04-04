import MojiJohoDisplayModeControlView from './MojiJohoDisplayModeControlView'

const meta = {
  title: 'Mojidata/Pure Views/MojiJohoDisplayModeControlView',
  component: MojiJohoDisplayModeControlView,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Pure view for the Moji_Joho display-mode toggle. Labels and selection state are injected, so Storybook can verify the pill chrome without URL or history behavior.',
      },
    },
  },
  args: {
    label: 'Display',
    autoLabel: 'Auto',
    imageLabel: 'Image',
    forceImage: false,
  },
}

export default meta

export const AutoSelected = {}

export const ImageSelected = {
  args: {
    forceImage: true,
  },
}
