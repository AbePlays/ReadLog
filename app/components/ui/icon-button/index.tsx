import React from 'react'

import { cn } from '~/utils/cn'
import { Button } from '../button'

type Props = React.ComponentProps<typeof Button>

const IconButton = React.forwardRef(function IconButton(props: Props, forwardedRef: React.Ref<HTMLButtonElement>) {
  const { className, ...rest } = props

  return <Button className={cn('!h-auto p-1', className)} ref={forwardedRef} {...rest} />
})

export { IconButton }
