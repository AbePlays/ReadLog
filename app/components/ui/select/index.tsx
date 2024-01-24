import * as RadixSelect from '@radix-ui/react-select'
import { CheckIcon, ChevronsUpDown } from 'lucide-react'
import React from 'react'

import { cn } from '~/utils/cn'

function Select(props: RadixSelect.SelectProps) {
  return <RadixSelect.Root {...props} />
}

function SelectContent({ children, className, ...props }: React.ComponentProps<typeof RadixSelect.Content>) {
  return (
    <RadixSelect.Portal>
      <RadixSelect.Content
        className={cn('p-1 bg-white z-10 rounded-md shadow-sm border border-gray-200', className)}
        // https://github.com/radix-ui/primitives/issues/1658
        ref={(ref) => {
          if (!ref) return
          ref.ontouchstart = (e) => {
            e.preventDefault()
          }
        }}
        {...props}
      >
        <RadixSelect.Viewport>{children}</RadixSelect.Viewport>
      </RadixSelect.Content>
    </RadixSelect.Portal>
  )
}

const SelectTrigger = React.forwardRef(function SelectTrigger(
  {
    children,
    className,
    placeholder,
    ...props
  }: React.ComponentProps<typeof RadixSelect.Trigger> & { placeholder?: string },
  forwardedRef: React.Ref<HTMLButtonElement>
) {
  return (
    <RadixSelect.Trigger
      className={cn(
        'flex items-center justify-between rounded-lg border-gray-300 bg-gray-50 transition duration-300 h-base px-2 gap-2 enabled:hover:bg-gray-100 border outline-none focus-visible:ring-2 focus-visible:ring-gray-500 disabled:bg-gray-200 focus-visible:border-gray-50',
        className
      )}
      {...props}
      ref={forwardedRef}
    >
      <RadixSelect.Value placeholder={placeholder} />
      <RadixSelect.Icon>
        <ChevronsUpDown size={16} />
      </RadixSelect.Icon>
    </RadixSelect.Trigger>
  )
})

const SelectOption = React.forwardRef(function SelectOption(
  { children, className, ...props }: React.ComponentProps<typeof RadixSelect.Item>,
  forwardedRef: React.Ref<HTMLDivElement>
) {
  return (
    <RadixSelect.Item
      className={cn(
        'rounded flex justify-between items-center gap-4 py-1.5 px-4 relative select-none data-[highlighted]:bg-gray-200 outline-none',
        className
      )}
      {...props}
      ref={forwardedRef}
    >
      <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
      <RadixSelect.ItemIndicator className="ml-auto">
        <CheckIcon size={14} />
      </RadixSelect.ItemIndicator>
    </RadixSelect.Item>
  )
})

Select.Content = SelectContent
Select.Option = SelectOption
Select.Trigger = SelectTrigger

export { Select }
