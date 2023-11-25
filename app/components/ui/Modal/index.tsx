import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '~/utils/cn'

export default function Modal(props: Dialog.DialogProps) {
  return <Dialog.Root {...props} />
}

function ModalContent({ children, className, title, ...rest }: { title: string } & Dialog.DialogContentProps) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="z-10 fixed inset-0 bg-black/50 backdrop-blur" />
      <Dialog.Content
        className={cn(
          'z-20 fixed left-1/2 top-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-md bg-white shadow',
          className
        )}
        {...rest}
      >
        <div className="flex items-center gap-4 p-4 border-b border-gray-200">
          <Dialog.Title className="text-lg font-medium">{title}</Dialog.Title>
          <Dialog.Close
            aria-label="Close"
            className="hover:text-gray-700 text-gray-500 focus-visible:ring-2 outline-none rounded-full ring-gray-700 ring-offset-2 ml-auto"
          >
            <X aria-hidden="true" size={18} />
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
