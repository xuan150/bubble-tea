'use client'
import React, { useEffect, useState } from 'react'

export function MagicCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 }) // For custom cursor

  useEffect(() => {
    const move = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
    }
    // @ts-ignore
    window.addEventListener('mousemove', move)
    // @ts-ignore
    return () => window.removeEventListener('mousemove', move)
  }, [])

  return (
    <div>
      <div
        style={{
          position: 'fixed',
          left: position.x - 20,
          top: position.y - 20,
          width: 50,
          height: 50,
          backgroundImage: "url('/straw.png')",
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          pointerEvents: 'none',
          zIndex: 9999,
        }}
      />
      <style jsx global>{`
        body {
          cursor: none;
        }
      `}</style>
    </div>
  )
}
