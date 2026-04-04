import { useState } from 'react'
import { MojiJohoDisplayModeControl } from './MojiJohoChar'

const meta = {
  title: 'Mojidata/Interactive/MojiJohoDisplayModeControl',
  component: MojiJohoDisplayModeControl,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Interactive Moji_Joho display-mode control. This story keeps the toggle state live, so it sits in the Interactive category instead of Pure Views.',
      },
    },
  },
}

export default meta

export const Interactive = {
  render: function Render() {
    const [forceImage, setForceImage] = useState(false)
    return (
      <MojiJohoDisplayModeControl
        lang="en-US"
        forceImage={forceImage}
        onChangeForceImage={setForceImage}
      />
    )
  },
}
