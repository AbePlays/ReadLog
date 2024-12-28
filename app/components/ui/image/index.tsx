import React from 'react'

import { cn } from '~/utils/cn'

const Image = React.forwardRef(function Image(
  props: React.ComponentProps<'img'>,
  forwardedRef: React.Ref<HTMLImageElement>
) {
  const [isLoading, setIsLoading] = React.useState(true)

  const alt = props.alt ?? ''

  return (
    <div className="relative">
      <div
        className={cn('absolute bg-gray-200 inset-0 transition-opacity duration-300 opacity-0', {
          'opacity-100': isLoading
        })}
      />

      <img onLoad={() => setIsLoading(false)} {...props} alt={alt} ref={forwardedRef} />
    </div>
  )
})

export { Image }
