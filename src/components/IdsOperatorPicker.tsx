'use client'

import { useEffect, useRef } from 'react'
import { getText, Language } from '@/getText'
import type { Translation } from '@/translation/Translation'
import { Button } from './ui/button'
import styles from './IdsOperatorPicker.module.css'
import surfaceStyles from './Surface.module.css'
import textStyles from './Text.module.css'
import { cn } from '@/lib/utils'

export const operatorGroups: ReadonlyArray<{
  labelKey: keyof Translation
  operators: ReadonlyArray<{ char: string; nameKey: keyof Translation }>
}> = [
  {
    labelKey: 'ids-binary-operators.dt',
    operators: [
      { char: '⿰', nameKey: 'ids-operator.left-to-right' },
      { char: '⿱', nameKey: 'ids-operator.above-to-below' },
      { char: '⿴', nameKey: 'ids-operator.full-surround' },
      { char: '⿵', nameKey: 'ids-operator.surround-from-above' },
      { char: '⿶', nameKey: 'ids-operator.surround-from-below' },
      { char: '⿷', nameKey: 'ids-operator.surround-from-left' },
      { char: '⿸', nameKey: 'ids-operator.surround-from-upper-left' },
      { char: '⿹', nameKey: 'ids-operator.surround-from-upper-right' },
      { char: '⿺', nameKey: 'ids-operator.surround-from-lower-left' },
      { char: '⿻', nameKey: 'ids-operator.overlaid' },
      { char: '⿼', nameKey: 'ids-operator.surround-from-right' },
      { char: '⿽', nameKey: 'ids-operator.surround-from-lower-right' },
    ],
  },
  {
    labelKey: 'ids-ternary-operators.dt',
    operators: [
      { char: '⿲', nameKey: 'ids-operator.left-to-middle-and-right' },
      { char: '⿳', nameKey: 'ids-operator.above-to-middle-and-below' },
    ],
  },
  {
    labelKey: 'ids-unary-operators.dt',
    operators: [
      { char: '⿾', nameKey: 'ids-operator.horizontal-reflection' },
      { char: '⿿', nameKey: 'ids-operator.rotation' },
      { char: '㇯', nameKey: 'ids-operator.subtraction' },
    ],
  },
]

type TextSelection = {
  start: number
  end: number
}

function isEditableTextInput(
  target: EventTarget | null,
): target is HTMLInputElement {
  return (
    target instanceof HTMLInputElement &&
    !target.disabled &&
    !target.readOnly &&
    (target.type === 'text' || target.type === 'search')
  )
}

function readSelection(input: HTMLInputElement): TextSelection {
  const start = input.selectionStart ?? input.value.length
  const end = input.selectionEnd ?? start
  return { start, end }
}

function insertText(
  input: HTMLInputElement,
  text: string,
  selection: TextSelection,
) {
  const next =
    input.value.slice(0, selection.start) +
    text +
    input.value.slice(selection.end)
  const caret = selection.start + text.length
  const valueSetter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value',
  )?.set
  if (!valueSetter) return
  valueSetter.call(input, next)
  input.dispatchEvent(new Event('input', { bubbles: true }))
  const placeCaret = () => {
    if (!input.isConnected) return
    input.focus()
    input.setSelectionRange(caret, caret)
  }
  placeCaret()
  queueMicrotask(placeCaret)
}

export interface IdsOperatorPickerProps {
  lang: Language
  showCaption?: boolean
}

export default function IdsOperatorPicker(props: IdsOperatorPickerProps) {
  const { lang, showCaption = true } = props
  const rootRef = useRef<HTMLDivElement>(null)
  const lastInputRef = useRef<HTMLInputElement | null>(null)
  const selectionRef = useRef<TextSelection | null>(null)
  const composingRef = useRef(false)

  useEffect(() => {
    const form = rootRef.current?.closest('form')
    if (!form) return

    const rememberInput = (input: HTMLInputElement) => {
      lastInputRef.current = input
      selectionRef.current = readSelection(input)
    }
    const onFocusIn = (event: FocusEvent) => {
      if (!isEditableTextInput(event.target)) return
      rememberInput(event.target)
    }
    const onFocusOut = (event: FocusEvent) => {
      if (
        event.target !== lastInputRef.current ||
        !isEditableTextInput(event.target)
      )
        return
      selectionRef.current = readSelection(event.target)
    }
    const onSelectionChange = () => {
      const active = document.activeElement
      if (active !== lastInputRef.current || !isEditableTextInput(active))
        return
      selectionRef.current = readSelection(active)
    }
    const onCompositionStart = () => {
      composingRef.current = true
    }
    const onCompositionEnd = () => {
      composingRef.current = false
    }

    form.addEventListener('focusin', onFocusIn)
    form.addEventListener('focusout', onFocusOut)
    form.addEventListener('compositionstart', onCompositionStart)
    form.addEventListener('compositionend', onCompositionEnd)
    document.addEventListener('selectionchange', onSelectionChange)
    return () => {
      form.removeEventListener('focusin', onFocusIn)
      form.removeEventListener('focusout', onFocusOut)
      form.removeEventListener('compositionstart', onCompositionStart)
      form.removeEventListener('compositionend', onCompositionEnd)
      document.removeEventListener('selectionchange', onSelectionChange)
    }
  }, [])

  const insertOperator = (operator: string) => {
    if (composingRef.current) return
    const form = rootRef.current?.closest('form')
    if (!form) return
    const active = document.activeElement
    const input =
      isEditableTextInput(active) && form.contains(active)
        ? active
        : lastInputRef.current
    if (
      !input ||
      !input.isConnected ||
      !form.contains(input) ||
      !isEditableTextInput(input)
    )
      return
    const selection =
      input === active
        ? readSelection(input)
        : (selectionRef.current ?? readSelection(input))
    insertText(input, operator, selection)
    lastInputRef.current = input
    selectionRef.current = {
      start: selection.start + operator.length,
      end: selection.start + operator.length,
    }
  }

  return (
    <div
      ref={rootRef}
      className={cn(
        surfaceStyles.mutedSurface,
        surfaceStyles.radiusInset,
        surfaceStyles.paddingMd,
        styles.root,
      )}
    >
      {showCaption && (
        <p className={cn(textStyles.mutedBodySm, styles.examplesHelp)}>
          {getText('ids-operator-picker', lang)}
        </p>
      )}
      <div className={styles.operatorGroup}>
        {operatorGroups.map((group) => (
          <div key={group.labelKey}>
            {group.operators.map((operator) => {
              const name = getText(operator.nameKey, lang)
              return (
                <Button
                  key={operator.char}
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label={name}
                  title={name}
                  onMouseDown={(event) => {
                    event.preventDefault()
                    insertOperator(operator.char)
                  }}
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter' && event.key !== ' ') return
                    event.preventDefault()
                    insertOperator(operator.char)
                  }}
                >
                  {operator.char}
                </Button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
