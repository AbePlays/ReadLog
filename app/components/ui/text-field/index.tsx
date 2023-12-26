import React from 'react'

import { cn } from '~/utils/cn'
import { composeEventHandlers } from '~/utils/componse-event-handlers'

const TextFieldInput = React.forwardRef(function TextField(
  props: React.ComponentProps<'input'>,
  forwardedRef: React.Ref<HTMLInputElement>
) {
  const { className, ...rest } = props

  return (
    <>
      <input
        className={cn('peer z-10 outline-none relative bg-transparent block w-full py-2 first:pl-2 pr-2', className)}
        type="text"
        {...rest}
        ref={forwardedRef}
      />
      <div className="absolute pointer-events-none inset-0 group-hover:peer-enabled:bg-gray-100 peer-focus:ring-2 peer-focus:border-gray-50 ring-gray-500 border border-gray-300 rounded-lg bg-gray-50 transition duration-300 z-0 peer-disabled:bg-gray-200" />
    </>
  )
})

const TextFieldRoot = React.forwardRef(function TextFieldRoot(
  props: React.ComponentProps<'div'>,
  forwardedRef: React.Ref<HTMLDivElement>
) {
  const { className, ...rest } = props
  return (
    <div
      className={cn('group relative flex cursor-text rounded-lg', className)}
      {...rest}
      onPointerDown={composeEventHandlers(props.onPointerDown, (e) => {
        const target = e.target as HTMLElement
        if (target.closest('input, button, a')) return

        const input = e.currentTarget.querySelector('.peer') as HTMLInputElement | null
        if (!input) return

        requestAnimationFrame(() => input.focus())
      })}
      ref={forwardedRef}
    />
  )
})

const TextFieldSlot = React.forwardRef(function TextFieldSlot(
  props: React.ComponentProps<'div'>,
  forwardedRef: React.Ref<HTMLDivElement>
) {
  const { className, ...rest } = props
  return <div className={cn('shrink-0 flex items-center relative z-10 px-2', className)} {...rest} ref={forwardedRef} />
})

const TextField = {
  Input: TextFieldInput,
  Root: TextFieldRoot,
  Slot: TextFieldSlot
}

export { TextField }
