import { useState, useEffect } from 'react'

export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  )
  useEffect(() => {
    function handle() { setIsMobile(window.innerWidth < breakpoint) }
    window.addEventListener('resize', handle)
    return () => window.removeEventListener('resize', handle)
  }, [breakpoint])
  return isMobile
}
