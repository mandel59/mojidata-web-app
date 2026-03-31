import type { ExecutionMode } from '@/deliveryPolicy'
import { castToArray } from '@/app/[lang]/searchParams'

const EXECUTION_MODES: readonly ExecutionMode[] = [
  'server-data',
  'client-data',
]

export function resolveExecutionModeOverride(
  searchParams: { [key: string]: string | string[] | undefined },
  fallbackMode: ExecutionMode,
): ExecutionMode {
  const value = castToArray(searchParams.executionMode).find(
    (candidate): candidate is ExecutionMode =>
      EXECUTION_MODES.some((allowed) => allowed === candidate),
  )
  return value ?? fallbackMode
}
