import React from 'react'

function ClientOnly({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = React.useState(false)

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsClient(true)
    }
  }, [setIsClient])

  return isClient ? children : null
}

export { ClientOnly }
