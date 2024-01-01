import { Link as RemixLink, type LinkProps as RemixLinkProps } from '@remix-run/react'
import React from 'react'

import { cn } from '~/utils/cn'

export type LinkProps =
  | ({ disabled?: false } & RemixLinkProps)
  // ✨
  | ({ disabled: true } & Partial<RemixLinkProps>)

function removeRemixLinkProps(props: { disabled: true } & Partial<RemixLinkProps>) {
  const {
    disabled,
    prefetch,
    preventScrollReset,
    relative,
    reloadDocument,
    replace,
    state,
    to,
    unstable_viewTransition,
    ...rest
  } = props

  return rest
}

const Link = React.forwardRef(function Link(props: LinkProps, forwardedRef: React.Ref<HTMLAnchorElement>) {
  const { className, ...rest } = props
  const anchorClasses = cn(
    'outline-none rounded transition duration-300 focus-visible:ring-2 ring-offset-2 ring-gray-500',
    className
  )

  if (rest.disabled) {
    return (
      <a
        className={anchorClasses}
        {...removeRemixLinkProps(rest)}
        aria-disabled="true"
        ref={forwardedRef}
        role="link"
      />
    )
  }

  return <RemixLink className={anchorClasses} {...rest} ref={forwardedRef} />
})

export { Link }
