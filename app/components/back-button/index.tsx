import { useNavigate } from '@remix-run/react'
import { ArrowLeft } from 'lucide-react'
import React from 'react'

import { Button } from '../ui/button'

const BackButton = React.forwardRef(function BackButton(
  props: React.ComponentProps<'button'>,
  forwardedRef: React.Ref<HTMLButtonElement>
) {
  const navigate = useNavigate()

  return (
    <Button
      aria-label="Back"
      onClick={() => navigate(-1)}
      title="Go Back"
      variant="ghost"
      {...props}
      ref={forwardedRef}
    >
      <ArrowLeft aria-hidden="true" strokeWidth={1.5} />
    </Button>
  )
})

export { BackButton }
