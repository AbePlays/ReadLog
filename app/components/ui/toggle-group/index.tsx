import * as RadixToggleGroup from '@radix-ui/react-toggle-group'
import React from 'react'

import { cn } from '~/utils/cn'

function ToggleGroup(props: React.ComponentProps<typeof RadixToggleGroup.Root>) {
  const { className, ...rest } = props
  return <RadixToggleGroup.Root className={cn('flex gap-2 flex-wrap', className)} {...rest} />
}

const ToggleGroupItem = React.forwardRef(function ToggleGroupItem(
  { className, ...props }: React.ComponentProps<typeof RadixToggleGroup.Item>,
  forwardedRef: React.Ref<HTMLButtonElement>
) {
  return (
    <RadixToggleGroup.Item
      className={cn(
        'data-[state=off]:hover:bg-gray-200 data-[state=on]:hover:bg-gray-700 data-[state=on]:bg-gray-600 data-[state=on]:text-gray-100 px-3 text-gray-700 bg-gray-100 font-medium transition-colors py-1 rounded-full border border-gray-200 text-sm outline-none focus-visible:ring-2 ring-offset-1 focus-visible:ring-gray-600',
        className
      )}
      {...props}
      ref={forwardedRef}
    />
  )
})

ToggleGroup.Item = ToggleGroupItem

export { ToggleGroup }
