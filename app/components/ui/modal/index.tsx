import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'

import { cn } from '~/utils/cn'
import { IconButton } from '../icon-button'

function Modal(props: Dialog.DialogProps) {
  return <Dialog.Root {...props} />
}

function ModalContent({ children, className, title, ...rest }: { title: string } & Dialog.DialogContentProps) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="z-10 fixed inset-0 bg-black/50 backdrop-blur data-[state=open]:animate-[overlay-show_200ms] data-[state=closed]:animate-[overlay-hide_200ms]" />
      <Dialog.Content
        className={cn(
          'z-20 fixed sm:left-1/2 sm:top-1/2 w-full sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 bottom-0 sm:bottom-auto rounded-t-md sm:rounded-b-md bg-white shadow max-h-screen overflow-scroll motion-safe:data-[state=open]:animate-[dialog-show_200ms] motion-safe:data-[state=closed]:animate-[dialog-hide_200ms]',
          className
        )}
        {...rest}
      >
        <div className="flex items-center gap-4 p-4 bg-white border-b border-gray-200 sticky top-0">
          <Dialog.Title className="text-lg font-medium">{title}</Dialog.Title>
          <Dialog.Close aria-label="Close" asChild>
            <IconButton className="ml-auto rounded-full" variant="ghost">
              <X aria-hidden="true" size={18} />
            </IconButton>
          </Dialog.Close>
        </div>
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  )
}

Modal.Button = Dialog.Trigger
Modal.Close = Dialog.Close
Modal.Content = ModalContent

export { Modal }
