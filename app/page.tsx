'use client'
import { useState, useEffect, useCallback, useRef, MouseEvent } from 'react'
import { MagicCursor } from './cursor'

type GameElement = {
  id: number
  x: number
  y: number
  type: 'bubble_b' | 'bubble_w' | 'bubble_r'
}

type Miss = {
  id: number
  x: number
  y: number
}

function Rules({ setShowRules }: { setShowRules: (show: boolean) => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-lg mx-auto text-center shadow-xl">
        <h2 className="text-2xl font-bold mb-4 text-amber-800">How to Play</h2>
        <ul className="text-left list-disc pl-5 mb-4 text-amber-700 space-y-4">
          <li>Click on black or white bubbles to gain points.</li>
          <li>Black bubble: +10 points</li>
          <li>White bubble: +20 points</li>
          <li>Red bubble: -10 seconds</li>
          <li>Clicking on empty space: -10 points and -10 seconds</li>
          <li>Game lasts 60 seconds or until timer hits 0.</li>
        </ul>
        <button
          onClick={() => setShowRules(false)}
          className="mt-4 bg-amber-600 text-white px-4 py-2 rounded-full hover:bg-amber-700 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  )
}

export default function GamePage() {
  const [score, setScore] = useState<number>(0)
  const [hasStarted, setHasStarted] = useState<boolean>(false)
  const [showRules, setShowRules] = useState<boolean>(false)
  const [timeLeft, setTimeLeft] = useState<number>(60)
  const [isGameOver, setIsGameOver] = useState<boolean>(false)
  const [elements, setElements] = useState<GameElement[]>([])
  const [misses, setMisses] = useState<Miss[]>([])
  const gameBoardRef = useRef<HTMLDivElement | null>(null)

  const reduceTime = (seconds: number) => {
    setTimeLeft((prev) => {
      const newTime = Math.max(prev - seconds, 0)
      if (newTime === 0) setIsGameOver(true)
      return newTime
    })
  }

  const spawnElement = useCallback(() => {
    const rand = Math.random()
    let type: GameElement['type']

    if (rand < 0.25) {
      type = 'bubble_r' // 25% chance
    } else if (rand < 0.75) {
      type = 'bubble_b' // 50% chance
    } else {
      type = 'bubble_w' // 25% chance
    }

    const id = Date.now()
    const newElement: GameElement = {
      id: Date.now(),
      x: Math.random() * 90,
      y: Math.random() * 90,
      type,
    }

    setElements((prev) => [...prev, newElement])
    setTimeout(() => {
      setElements((prev) => prev.filter((el) => el.id !== id))
    }, 2000)
  }, [])

  const handleClick = (id: number, type: GameElement['type']) => {
    setElements((prev) => prev.filter((el) => el.id !== id))
    setScore((prev) => {
      if (type === 'bubble_b') {
        return prev + 10
      } else if (type == 'bubble_w') {
        return prev + 20
      }
      return 0
    })
    if (type === 'bubble_r') {
      reduceTime(10)
    }
  }

  const handleMissClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (isGameOver || e.target !== gameBoardRef.current) return

      const rect = gameBoardRef.current!.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      reduceTime(10)

      setScore((prev) => prev - 10)
      const missId = Date.now()
      setMisses((prev) => [...prev, { id: missId, x, y }])

      setTimeout(() => {
        setMisses((prev) => prev.filter((miss) => miss.id !== missId))
      }, 1000)
    },
    [isGameOver]
  )

  // useEffect for spawning
  useEffect(() => {
    if (!hasStarted || isGameOver) return

    const spawnInterval = setInterval(spawnElement, 1000)
    return () => clearInterval(spawnInterval)
  }, [hasStarted, isGameOver, spawnElement])

  // useEffect for timer
  useEffect(() => {
    if (!hasStarted || isGameOver || timeLeft === 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsGameOver(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [hasStarted, isGameOver, timeLeft])

  return (
    <div className="h-screen w-full bg-amber-50 flex flex-col items-center justify-center">
      {!hasStarted && (
        <div className="absolute h-full w-full top-0 left-0 z-50 flex flex-col items-center justify-center">
          <div
            className="relative mx-auto w-2xl h-64"
            style={{
              backgroundImage: "url('/teas.png')",
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
            }}
          >
            <div className="flex flex-col w-full h-full p-16 bg-white/25 backdrop-blur-xs rounded-lg items-center justify-center">
              <div className="absolute"></div>
              <h1 className="text-2xl font-bold text-amber-800 mb-6">
                Bubble Catching Game
              </h1>
              <div className="flex gap-4">
                <button
                  onClick={() => setHasStarted(true)}
                  className="bg-amber-600 text-white px-6 py-3 rounded-full text-xl font-semibold hover:bg-amber-700 transition-colors cursor-none"
                >
                  Start
                </button>
                <button
                  onClick={() => setShowRules(true)}
                  className="bg-amber-600 text-white px-6 py-3 rounded-full text-xl font-semibold hover:bg-amber-700 transition-colors cursor-none"
                >
                  Game Rules
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div className="text-2xl font-bold text-amber-800">
            Score: {score}
          </div>
          <div className="text-xl font-semibold text-amber-700">
            Time: {timeLeft}s
          </div>
        </div>

        <div
          ref={gameBoardRef}
          className="relative w-full max-w-3xl mx-auto h-[80vh] bg-amber-100 rounded-lg shadow-lg overflow-hidden"
          onClick={handleMissClick}
        >
          {elements.map(({ id, x, y, type }) => (
            <button
              key={id}
              onClick={(e) => {
                e.stopPropagation()
                handleClick(id, type)
              }}
              className="absolute transition-transform duration-300 hover:scale-110"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: '48px',
                height: '48px',
              }}
              aria-label={type}
            >
              <img
                src={`/${type}.png`}
                alt={type}
                className="w-full h-full object-contain drop-shadow-md"
              />
            </button>
          ))}

          {misses.map(({ id, x, y }) => (
            <div
              key={id}
              className="absolute text-red-500 font-bold animate-fade"
              style={{
                left: `${x}px`,
                top: `${y}px`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              MISS -10
            </div>
          ))}
        </div>

        {isGameOver && (
          <div className="absolute h-full w-full top-0 left-0 z-50 flex flex-col items-center justify-center">
            <div
              className="relative mx-auto w-2xl h-64"
              style={{
                backgroundImage: "url('/teas.png')",
                backgroundSize: 'contain',
              }}
            >
              <div className="flex flex-col w-full h-full p-16 bg-white/25 backdrop-blur-xs rounded-lg items-center justify-center">
                <h2 className="text-3xl font-bold mb-4 text-amber-800">
                  Game Over!
                </h2>
                <p className="text-xl mb-4 text-amber-700">
                  Final Score: {score}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-amber-600 text-white px-6 py-3 rounded-full text-xl font-semibold hover:bg-amber-700 transition-colors cursor-none"
                >
                  Play Again
                </button>
              </div>
            </div>
          </div>
        )}
        {showRules && <Rules setShowRules={setShowRules} />}
      </div>
      <MagicCursor />
    </div>
  )
}
