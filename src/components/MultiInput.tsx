'use client'

import { useRef } from 'react'

interface MultiInputProps {
  /** values of the each input fields. the last empty input is not included. */
  values: string[]
  setValues: (values: string[]) => void
  name?: string
  placeholder?: (index: number) => string
}

/**
 * Multiple input fields. The length of inputs is variable.
 * If the last input is not empty, a new empty input is added.
 * If the last filled input is erased, the last empty input is removed.
 * @param props
 */
export default function MultiInput(props: MultiInputProps) {
  const { values, setValues, name, placeholder } = props
  const refMultiInput = useRef<HTMLDivElement>(null)
  function removeSpaces(values: string[]) {
    // remove empty input fields
    while (values[values.length - 1] === '') {
      values.pop()
    }
    return values
  }
  function restoreSpaces(values: string[]) {
    const focusedIndex = Array.from(
      refMultiInput.current?.children ?? [],
    ).findIndex((x) => x === document.activeElement)
    // restore empty strings to retain the focused input field
    while (values.length < focusedIndex) {
      values.push('')
    }
    return values
  }
  return (
    <span ref={refMultiInput} className="grid gap-2">
      {[...values, ''].map((value, index) => {
        return (
          <input
            key={index}
            className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-sm"
            name={value === '' ? undefined : name}
            value={value}
            placeholder={placeholder?.(index)}
            onChange={(e) => {
              const newValues = [...values]
              newValues[index] = e.target.value
              setValues(restoreSpaces(removeSpaces(newValues)))
            }}
            onBlur={(e) => {
              if (
                index > 0 &&
                index === values.length &&
                value === '' &&
                values[index - 1] === ''
              ) {
                const newValues = [...values]
                newValues.pop()
                setValues(newValues)
              }
            }}
            type="text"
          />
        )
      })}
    </span>
  )
}
