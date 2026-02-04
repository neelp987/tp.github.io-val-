import React from "react"

import { useRef, useState, useEffect, useCallback } from "react"
import confetti from "canvas-confetti"

export default function ValentinePage() {
  const [accepted, setAccepted] = useState(false)
  const [yesScale, setYesScale] = useState(1)
  const [noPosition, setNoPosition] = useState({ left: 62, top: 50 })
  const zoneRef = useRef<HTMLDivElement>(null)
  const noBtnRef = useRef<HTMLButtonElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const confettiInstance = useRef<confetti.CreateTypes | null>(null)

  // Initialize confetti canvas
  useEffect(() => {
    if (canvasRef.current) {
      const resizeCanvas = () => {
        const canvas = canvasRef.current
        if (!canvas) return
        const dpr = Math.max(1, window.devicePixelRatio || 1)
        canvas.width = Math.floor(window.innerWidth * dpr)
        canvas.height = Math.floor(window.innerHeight * dpr)
      }

      resizeCanvas()
      window.addEventListener("resize", resizeCanvas)
      window.addEventListener("orientationchange", () => setTimeout(resizeCanvas, 150))

      confettiInstance.current = confetti.create(canvasRef.current, {
        resize: false,
        useWorker: true,
      })

      return () => {
        window.removeEventListener("resize", resizeCanvas)
      }
    }
  }, [])

  const fireConfetti = useCallback(() => {
    if (!confettiInstance.current) return

    const end = Date.now() + 1600

    const frame = () => {
      confettiInstance.current?.({
        particleCount: 12,
        spread: 90,
        startVelocity: 45,
        ticks: 180,
        origin: { x: Math.random(), y: Math.random() * 0.3 },
      })
      if (Date.now() < end) requestAnimationFrame(frame)
    }
    frame()

    setTimeout(() => {
      confettiInstance.current?.({
        particleCount: 300,
        spread: 140,
        startVelocity: 60,
        ticks: 220,
        origin: { x: 0.5, y: 0.55 },
      })
    }, 300)
  }, [])

  const handleYesClick = () => {
    setAccepted(true)
    fireConfetti()
  }

  const growYes = () => {
    setYesScale((prev) => Math.min(2.2, prev + 0.1))
  }

  const moveNo = useCallback(
    (px: number, py: number) => {
      const zone = zoneRef.current
      const noBtn = noBtnRef.current
      if (!zone || !noBtn) return

      const z = zone.getBoundingClientRect()
      const b = noBtn.getBoundingClientRect()

      let dx = b.left + b.width / 2 - px
      let dy = b.top + b.height / 2 - py
      const mag = Math.hypot(dx, dy) || 1
      dx /= mag
      dy /= mag

      let newLeft = b.left - z.left + dx * 150
      let newTop = b.top - z.top + dy * 150

      // Clamp to zone bounds
      newLeft = Math.max(0, Math.min(z.width - b.width, newLeft))
      newTop = Math.max(0, Math.min(z.height - b.height, newTop))

      // Convert to percentage
      setNoPosition({
        left: (newLeft / z.width) * 100,
        top: (newTop / z.height) * 100,
      })

      growYes()
    },
    []
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const noBtn = noBtnRef.current
      if (!noBtn) return

      const b = noBtn.getBoundingClientRect()
      const d = Math.hypot(b.left + b.width / 2 - e.clientX, b.top + b.height / 2 - e.clientY)

      if (d < 140) {
        moveNo(e.clientX, e.clientY)
      }
    },
    [moveNo]
  )

  return (
    <div className="min-h-svh grid place-items-center bg-[radial-gradient(circle_at_top,_#ffeef6,_#ffd6e7)] p-4 overflow-hidden font-sans">
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-screen h-screen pointer-events-none z-50"
      />

      <main className="w-full max-w-[720px] p-6 bg-white/80 backdrop-blur-md rounded-[22px] text-center shadow-[0_18px_60px_rgba(0,0,0,0.15)]">
        {/* Panda SVG */}
        <PandaHeart />

        <h1 className="text-[clamp(26px,4vw,44px)] font-bold my-3 text-gray-900 text-balance">
          Komal, will you be my Valentine?
        </h1>

        {!accepted && (
          <>
            <div
              ref={zoneRef}
              className="relative w-full max-w-[520px] h-[150px] mx-auto touch-none"
              onPointerMove={handlePointerMove}
            >
              <button
                onClick={handleYesClick}
                style={{ transform: `translateY(-50%) scale(${yesScale})` }}
                className="absolute top-1/2 left-[18%] px-6 py-4 text-lg font-extrabold rounded-full border-none cursor-pointer shadow-[0_10px_24px_rgba(0,0,0,0.14)] select-none bg-[#ff3b7a] hover:bg-[#ff1f68] text-white transition-all duration-100 ease-out"
              >
                Yes
              </button>

              <button
                ref={noBtnRef}
                onClick={(e) => e.preventDefault()}
                style={{
                  left: `${noPosition.left}%`,
                  top: `${noPosition.top}%`,
                  transform: noPosition.top !== 50 ? "none" : "translateY(-50%)",
                }}
                className="absolute px-6 py-4 text-lg font-extrabold rounded-full border-none cursor-pointer shadow-[0_10px_24px_rgba(0,0,0,0.14)] select-none bg-gray-200 text-gray-900 transition-all duration-100 ease-out"
              >
                No
              </button>
            </div>

            <p className="mt-2 text-sm text-gray-600/70">{'"No" seems a bit shy 😈'}</p>
          </>
        )}

        {accepted && (
          <div className="mt-4 animate-in zoom-in-95 fade-in duration-300">
            <h2 className="text-[clamp(30px,4.5vw,46px)] font-bold my-2 text-gray-900">
              YAY! 🎉
            </h2>
            <img
              src="https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif"
              alt="Fireworks celebration"
              className="w-full max-w-[380px] mx-auto block"
            />
          </div>
        )}
      </main>
    </div>
  )
}

function PandaHeart() {
  return (
    <svg
      className="w-full max-w-[260px] mx-auto mb-2 drop-shadow-[0_10px_14px_rgba(0,0,0,0.12)]"
      viewBox="0 0 240 220"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Panda holding a heart"
    >
      <defs>
        <linearGradient id="pWhite" x1="0" x2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#f3f4f6" />
        </linearGradient>
        <linearGradient id="heart" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff6b9d" />
          <stop offset="1" stopColor="#ff3b7a" />
        </linearGradient>
        <filter id="softGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Panda body - rounder and cuter */}
      <ellipse cx="120" cy="155" rx="70" ry="55" fill="url(#pWhite)" />
      
      {/* Panda feet */}
      <ellipse cx="85" cy="195" rx="22" ry="14" fill="#222" />
      <ellipse cx="155" cy="195" rx="22" ry="14" fill="#222" />
      <ellipse cx="85" cy="193" rx="10" ry="6" fill="#444" />
      <ellipse cx="155" cy="193" rx="10" ry="6" fill="#444" />
      
      {/* Arms hugging heart */}
      <ellipse cx="78" cy="140" rx="24" ry="16" fill="#222" transform="rotate(-20 78 140)" />
      <ellipse cx="162" cy="140" rx="24" ry="16" fill="#222" transform="rotate(20 162 140)" />

      {/* Panda head - bigger and rounder */}
      <circle cx="120" cy="75" r="52" fill="url(#pWhite)" />
      
      {/* Ears - rounder */}
      <circle cx="80" cy="35" r="20" fill="#222" />
      <circle cx="160" cy="35" r="20" fill="#222" />
      <circle cx="80" cy="35" r="10" fill="#444" />
      <circle cx="160" cy="35" r="10" fill="#444" />

      {/* Eye patches - softer shape */}
      <ellipse cx="98" cy="75" rx="18" ry="22" fill="#222" transform="rotate(-8 98 75)" />
      <ellipse cx="142" cy="75" rx="18" ry="22" fill="#222" transform="rotate(8 142 75)" />
      
      {/* Eyes - bigger and more sparkly */}
      <circle cx="98" cy="78" r="10" fill="#fff" />
      <circle cx="142" cy="78" r="10" fill="#fff" />
      <circle cx="100" cy="80" r="5" fill="#222" />
      <circle cx="144" cy="80" r="5" fill="#222" />
      {/* Eye sparkles */}
      <circle cx="102" cy="77" r="2.5" fill="#fff" />
      <circle cx="146" cy="77" r="2.5" fill="#fff" />
      <circle cx="98" cy="82" r="1.2" fill="#fff" />
      <circle cx="142" cy="82" r="1.2" fill="#fff" />

      {/* Nose - cute oval */}
      <ellipse cx="120" cy="98" rx="7" ry="5" fill="#222" />
      <ellipse cx="118" cy="96" rx="2" ry="1.5" fill="#444" />
      
      {/* Mouth - happy smile */}
      <path
        d="M108 106 Q120 118 132 106"
        stroke="#222"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />

      {/* Blush - more prominent and cute */}
      <ellipse cx="75" cy="95" rx="12" ry="7" fill="#ffb4c4" opacity="0.7" />
      <ellipse cx="165" cy="95" rx="12" ry="7" fill="#ffb4c4" opacity="0.7" />

      {/* Heart being hugged - with glow */}
      <g filter="url(#softGlow)">
        <path
          d="M120 125 c -22 -22 -55 5 -38 32 c 16 22 38 33 38 33 s 22 -11 38 -33 c 17 -27 -16 -54 -38 -32 Z"
          fill="url(#heart)"
        />
      </g>
      
      {/* Heart shine */}
      <ellipse cx="95" cy="142" rx="6" ry="8" fill="#fff" opacity="0.4" transform="rotate(-30 95 142)" />
    </svg>
  )
}
