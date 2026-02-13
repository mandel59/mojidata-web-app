'use client'

export interface SpacerProps {
  width: number
  height: number
  border: number
  margin: number
}

export function Spacer(props: SpacerProps) {
  const { width, height, border, margin } = props
  return (
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,
        border: `${border}px solid transparent`,
        margin: `${margin}px`,
      }}
    />
  )
}
