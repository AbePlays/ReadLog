import { useNavigate } from '@remix-run/react'
import { ArrowLeft } from 'lucide-react'

import { cn } from '~/utils/cn'

export default function BackButton(props: React.ComponentProps<'button'>) {
  const { className, ...rest } = props
  const navigate = useNavigate()

  return (
    <button
      aria-label="Go Back"
      className={cn(
        'hover:bg-gray-100 rounded-full p-1 transition-[background-color,box-shadow] duration-300 focus-visible:ring-1 ring-black outline-none',
        className
      )}
      onClick={() => navigate(-1)}
      title="Go Back"
      type="button"
      {...rest}
    >
      <ArrowLeft aria-hidden="true" strokeWidth={1.5} />
    </button>
  )
}
