import React from 'react'

import { cn } from '~/utils/cn'

export function Spinner(props: React.ComponentProps<'svg'>) {
  const { className, ...rest } = props

  return (
    <svg
      className={cn('animate-spin h-4 w-4 text-white', className)}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <title>Loading...</title>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path
        className="opacity-75"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        fill="currentColor"
      />
    </svg>
  )
}
