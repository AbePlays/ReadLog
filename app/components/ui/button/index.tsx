import React from 'react'

import { cn } from '~/utils/cn'

export type ButtonProps = {
  variant: 'ghost' | 'outline' | 'soft' | 'solid'
}

const DEFAULT_BUTTON_VARIANT: ButtonProps['variant'] = 'solid'

export function getVariantClasses(variant = DEFAULT_BUTTON_VARIANT) {
  const variantClassMap: Record<ButtonProps['variant'], string> = {
    ghost: 'text-gray-900 hover:bg-gray-50 py-1 px-2',
    outline: 'border border-gray-900 hover:bg-gray-100 text-gray-900',
    soft: 'bg-gray-100 hover:bg-gray-200 text-gray-900',
    solid: 'bg-gray-900 hover:bg-gray-700 text-white'
  }

  return `rounded-lg text-sm font-medium py-2 px-4 inline-flex gap-2 items-center justify-center shrink-0 ${variantClassMap[variant]}`
}

const Button = React.forwardRef(function Button(
  props: React.ComponentProps<'button'> & ButtonProps,
  forwardedRef: React.Ref<HTMLButtonElement>
) {
  const { className, variant, ...rest } = props
  const variantClass = getVariantClasses(variant)

  return <button className={cn(variantClass, className)} ref={forwardedRef} type="button" {...rest} />
})

export { Button }
