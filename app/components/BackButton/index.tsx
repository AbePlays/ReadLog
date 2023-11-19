import { useNavigate } from '@remix-run/react'
import { ArrowLeft } from 'lucide-react'

export default function BackButton(props: React.ComponentProps<'button'>) {
  const navigate = useNavigate()

  return (
    <button aria-label="Go Back" onClick={() => navigate(-1)} type="button" title="Go Back" {...props}>
      <ArrowLeft aria-hidden="true" />
    </button>
  )
}
