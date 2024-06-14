export function toDataUri(data: string, mediaType: string) {
  return `data:${mediaType},${encodeURIComponent(data)}`
}