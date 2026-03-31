import { headers } from 'next/headers'
import type { DataRouteTarget, ExecutionMode } from '@/deliveryPolicy'
import { botFamily, isLikelyBotUserAgent } from '@/bot'
import { resolveExecutionModeForTarget } from '@/deliveryPolicy'

export async function resolveRequestExecutionMode(
  target: DataRouteTarget,
): Promise<ExecutionMode> {
  const requestHeaders = await headers()
  const ua = requestHeaders.get('user-agent') ?? ''
  const isLikelyBot = isLikelyBotUserAgent(ua)
  const family = botFamily(ua)
  const { mode } = resolveExecutionModeForTarget({
    target,
    ua,
    isBot: isLikelyBot,
    isLikelyBot,
    family,
  })
  return mode
}
