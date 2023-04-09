'use client'

import { useRef } from 'react'

interface MultiInputProps {
  /** values of the each input fields. the last empty input is not included. */
  values: string[]
  setValues: (values: string[]) => void
  name?: string
}

/**
 * Multiple input fields. The length of inputs is variable.
 * If the last input is not empty, a new empty input is added.
 * If the last filled input is erased, the last empty input is removed.
 * @param props
 */
export default function MultiInput(props: MultiInputProps) {
  const { values, setValues, name } = props
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
    <span ref={refMultiInput} className="multi-input">
      {[...values, ''].map((value, index) => {
        return (
          <input
            key={index}
            name={value === '' ? undefined : name}
            value={value}
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
