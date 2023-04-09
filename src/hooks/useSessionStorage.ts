import { useEffect, useState } from 'react'

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue }

export default function useSessionStorage<T extends JsonValue>(
  key: string,
  initialValue: T,
) {
  const [state, setState] = useState(initialValue)
  useEffect(() => {
    const value = sessionStorage.getItem(key)
    if (value) {
      setState(JSON.parse(value))
    }
  }, [key])
  const setSessionStorage = (value: T) => {
    sessionStorage.setItem(key, JSON.stringify(value))
    setState(value)
  }
  return [state, setSessionStorage] as const
}
