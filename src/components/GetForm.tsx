'use client'

import { useRouter } from 'next/navigation'
import { HTMLProps, forwardRef } from 'react'

type FormProps = HTMLProps<HTMLFormElement>
const GetForm = forwardRef<HTMLFormElement, FormProps>(function GetForm(
  props,
  ref,
) {
  const router = useRouter()
  return (
    <form
      ref={ref}
      {...{
        ...props,
        method: 'get',
        onSubmit: (e) => {
          const form = e.target as HTMLFormElement
          const submitter = (e.nativeEvent as SubmitEvent)
            .submitter as HTMLButtonElement | null
          const formMethod = submitter?.formMethod ?? form.method
          const formAction = submitter?.formAction ?? form.action
          if (formMethod === 'get') {
            e.preventDefault()
            e.stopPropagation()
            const url = new URL(formAction)
            const formData = new FormData(form)
            formData.forEach((value, key) => {
              if (typeof value === 'string') {
                url.searchParams.append(key, value)
              } else {
                throw new Error('unexpected value type')
              }
            })
            router.push(url.href)
            return
          }
        },
      }}
    />
  )
})

export default GetForm
