import * as RadixTabs from '@radix-ui/react-tabs'
import React from 'react'
import { cn } from '~/utils/cn'

function Tabs(props: RadixTabs.TabsProps) {
  return <RadixTabs.Root {...props} />
}

const TabsList = React.forwardRef(function TabsList(
  props: React.ComponentProps<typeof RadixTabs.List>,
  forwardedRef: React.Ref<HTMLDivElement>
) {
  const { className, ...rest } = props
  return (
    <RadixTabs.List
      className={cn('relative after:absolute after:w-full after:bottom-0 after:left-0 after:border-b-2', className)}
      {...rest}
      ref={forwardedRef}
    />
  )
})

const TabsTrigger = React.forwardRef(function TabsTrigger(
  props: React.ComponentProps<typeof RadixTabs.Trigger>,
  forwardedRef: React.Ref<HTMLButtonElement>
) {
  const { className, ...rest } = props
  return (
    <RadixTabs.Trigger
      className={cn(
        'relative z-10 after:absolute after:w-full after:left-0 after:bottom-0 after:border-transparent after:border-b-2 data-[state="active"]:after:border-gray-700 data-[state="inactive"]:text-gray-700 py-2 px-3',
        className
      )}
      {...rest}
      ref={forwardedRef}
    />
  )
})

const TabsContent = React.forwardRef(function TabsContent(
  props: React.ComponentProps<typeof RadixTabs.Content>,
  forwardedRef: React.Ref<HTMLDivElement>
) {
  const { className, ...rest } = props
  return (
    <RadixTabs.Content
      className={cn('outline-none focus-visible:ring-2 focus-visible:ring-gray-500', className)}
      {...rest}
      ref={forwardedRef}
    />
  )
})

Tabs.Content = TabsContent
Tabs.List = TabsList
Tabs.Trigger = TabsTrigger

export { Tabs }
