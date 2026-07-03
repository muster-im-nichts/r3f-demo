import { useCallback, useEffect, useState } from 'react'
import { blip } from '../audio/sfx'

const CHAR_MS = 22

/**
 * Zeichenweiser Text-Reveal mit 8-Bit-Blip. Cleanup-fest (StrictMode) und
 * per skip() abkürzbar.
 */
export function useTypewriter(text: string): { shown: string; done: boolean; skip: () => void } {
  const [count, setCount] = useState(0)

  useEffect(() => {
    setCount(0)
    const interval = setInterval(() => {
      setCount(c => {
        if (c >= text.length) {
          clearInterval(interval)
          return c
        }
        blip()
        return c + 1
      })
    }, CHAR_MS)
    return () => clearInterval(interval)
  }, [text])

  const skip = useCallback(() => setCount(text.length), [text])

  return { shown: text.slice(0, count), done: count >= text.length, skip }
}
