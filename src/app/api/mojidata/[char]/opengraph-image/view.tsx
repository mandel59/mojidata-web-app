/* eslint-disable jsx-a11y/alt-text */
import { toDataUri } from '@/utils/toDataUri'

export function renderMojidataOgImage(params: {
  codePoint?: string
  ucs: string
  svgImage: string | null
}) {
  const { codePoint, ucs, svgImage } = params
  return (
    <div
      style={{
        backgroundColor: 'white',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: '32px',
      }}
    >
      <div style={{ display: 'flex', fontSize: '128px' }}>U+{codePoint}</div>
      {svgImage ? (
        <img width={512} height={512} src={toDataUri(svgImage, 'image/svg+xml')} />
      ) : (
        <div
          style={{
            display: 'flex',
            fontSize: '512px',
          }}
        >
          {ucs}
        </div>
      )}
    </div>
  )
}

