import React from 'react'

import { cn } from '~/utils/cn'
import { composeEventHandlers } from '~/utils/componse-event-handlers'

const RadioItem = React.forwardRef(function RadioItem(
  props: React.ComponentProps<'input'>,
  forwardedRef: React.Ref<HTMLInputElement>
) {
  const { className, ...rest } = props

  return (
    <>
      <input className="peer sr-only" {...rest} ref={forwardedRef} type="radio" />
      <div
        className={cn(
          'relative w-5 h-5 border-2 border-gray-500 rounded-full transition duration-300 bg-gray-50 before:absolute before:transition-all group-hover:peer-enabled:bg-gray-200 peer-focus:bg-gray-50 before:duration-300 before:inset-0 before:peer-checked:inset-[3px] before:rounded-full before:peer-checked:bg-gray-700 peer-focus-visible:ring-1 peer-disabled:bg-gray-300 ring-gray-500',
          className
        )}
      />
    </>
  )
})

const RadioRoot = React.forwardRef(function RadioRoot(
  props: React.ComponentProps<'div'>,
  forwardedRef: React.Ref<HTMLDivElement>
) {
  const { className, ...rest } = props

  return (
    <div
      className={cn('group', className)}
      {...rest}
      ref={forwardedRef}
      onPointerDown={composeEventHandlers(props.onPointerDown, (e) => {
        const input = e.currentTarget.querySelector('.peer') as HTMLInputElement | null
        if (!input) return

        requestAnimationFrame(() => {
          if (input.disabled) return
          input.focus()
          input.checked = true
        })
      })}
    />
  )
})

const Radio = {
  Root: RadioRoot,
  Item: RadioItem
}

export { Radio }
