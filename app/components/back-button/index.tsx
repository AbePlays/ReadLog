import { useNavigate } from '@remix-run/react'
import { ArrowLeft } from 'lucide-react'
import React from 'react'

import { IconButton } from '../ui/icon-button'

const BackButton = React.forwardRef(function BackButton(
  props: React.ComponentProps<'button'>,
  forwardedRef: React.Ref<HTMLButtonElement>
) {
  const navigate = useNavigate()

  return (
    <IconButton
      aria-label="Back"
      onClick={() => navigate(-1)}
      title="Go Back"
      variant="ghost"
      {...props}
      ref={forwardedRef}
    >
      <ArrowLeft aria-hidden="true" strokeWidth={1.5} />
    </IconButton>
  )
})

export { BackButton }
