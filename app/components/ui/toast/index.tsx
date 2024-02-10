import * as RadixToast from '@radix-ui/react-toast'
import { useFetcher } from '@remix-run/react'
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import React from 'react'
import { type ToastMessage } from 'remix-toast'

import { cn } from '~/utils/cn'
import { IconButton } from '../icon-button'

export type ToastProps = {
  toast: ToastMessage | undefined
}

export const DEFAULT_TOAST_VARIANT: ToastMessage['type'] = 'info'

export function getVariantClasses(variant = DEFAULT_TOAST_VARIANT) {
  const variantClassMap: Record<ToastMessage['type'], string> = {
    error: 'text-rose-500 bg-rose-50/50 border-rose-200',
    info: 'text-blue-500 bg-blue-50/50 border-blue-200',
    success: 'text-emerald-500 bg-emerald-50/50 border-emerald-200',
    warning: 'text-amber-500 bg-amber-50/50 border-amber-200'
  }

  return variantClassMap[variant]
}

export function getVariantIcon(variant = DEFAULT_TOAST_VARIANT) {
  const variantIconMap: Record<ToastMessage['type'], React.ReactNode> = {
    error: <AlertTriangle className="flex-shrink-0 w-3.5 h-3.5" aria-hidden="true" />,
    info: <Info className="flex-shrink-0 w-3.5 h-3.5" aria-hidden="true" />,
    success: <CheckCircle2 className="flex-shrink-0 w-3.5 h-3.5" aria-hidden="true" />,
    warning: <AlertCircle className="flex-shrink-0 w-3.5 h-3.5" aria-hidden="true" />
  }

  return variantIconMap[variant]
}

function Toast(props: ToastProps) {
  const { toast } = props
  const fetcher = useFetcher()
  const formRef = React.useRef<HTMLFormElement | null>(null)
  const toastRef = React.useRef<ToastMessage | null>(null)

  if (toast) {
    toastRef.current = toast
  }

  const variantClass = getVariantClasses(toast ? toast.type : toastRef.current?.type)
  const variantIcon = getVariantIcon(toast ? toast.type : toastRef.current?.type)
  const message = toast ? toast.message : toastRef.current?.message

  return (
    <RadixToast.Provider swipeDirection="up" duration={100000}>
      <RadixToast.Root
        className="ml-2 sm:ml-0 mr-2 overflow-hidden outline-none rounded-lg focus-visible:ring ring-gray-500 motion-safe:data-[state=open]:animate-[toast-show_500ms] motion-safe:data-[state=closed]:animate-[toast-hide_500ms]"
        onOpenChange={() => fetcher.submit(formRef.current)}
        open={!!toast}
      >
        <div className={cn('rounded-lg text-sm border flex justify-center p-2 gap-2 sm:gap-4', variantClass)}>
          <div className="flex items-center gap-2">
            {variantIcon}
            <RadixToast.Description className="line-clamp-1" asChild>
              <p>{message}</p>
            </RadixToast.Description>
          </div>
          <div className="border-l border-inherit" />
          <fetcher.Form action="/" method="post" ref={formRef}>
            <IconButton
              aria-label="Close"
              className="enabled:hover:!bg-inherit text-inherit"
              type="submit"
              variant="ghost"
            >
              <X aria-hidden="true" size={14} />
            </IconButton>
          </fetcher.Form>
        </div>
      </RadixToast.Root>
      <RadixToast.Viewport />
    </RadixToast.Provider>
  )
}

export { Toast }
