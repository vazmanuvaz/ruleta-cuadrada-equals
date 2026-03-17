"use client"

import { useState, useRef } from "react"
import { SquareWheel } from "@/components/square-wheel"

const DEFAULT_OPTIONS = ["Opción 1", "Opción 2", "Opción 3", "Opción 4"]

export default function RuletaPage() {
  const [count, setCount] = useState(4)
  const [options, setOptions] = useState<string[]>(DEFAULT_OPTIONS)
  const [rotation, setRotation] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)
  const [winner, setWinner] = useState<string | null>(null)
  const animRef = useRef<number | null>(null)

  function handleCountChange(val: number) {
    const newCount = Math.max(2, Math.min(8, val))
    setCount(newCount)
    setOptions((prev) => {
      const updated = [...prev]
      while (updated.length < newCount) updated.push(`Opción ${updated.length + 1}`)
      return updated.slice(0, newCount)
    })
    setWinner(null)
  }

  function handleOptionChange(idx: number, val: string) {
    setOptions((prev) => {
      const updated = [...prev]
      updated[idx] = val
      return updated
    })
  }

  function spin() {
    if (isSpinning) return
    setWinner(null)
    setIsSpinning(true)

    const extraSpins = 5 + Math.floor(Math.random() * 5) // 5-9 full turns
    const randomOffset = Math.random() * 360
    const totalDeg = extraSpins * 360 + randomOffset

    const startRot = rotation
    const endRot = startRot + totalDeg
    const duration = 3000 + Math.random() * 1200

    let startTime: number | null = null

    function easeOut(t: number) {
      return 1 - Math.pow(1 - t, 3)
    }

    function animate(ts: number) {
      if (!startTime) startTime = ts
      const elapsed = ts - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeOut(progress)
      const current = startRot + eased * totalDeg

      setRotation(current)

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate)
      } else {
        setRotation(endRot)
        setIsSpinning(false)

        // Figure out winner: pointer is at top center = angle 270deg (or -90deg)
        // The slice that contains -90deg after rotation
        const anglePerSlice = 360 / count
        // Normalize: which slice is at the pointer (pointing down from top = 270deg)
        const pointerAngle = 270
        const normalizedRot = ((endRot % 360) + 360) % 360
        const adjusted = ((pointerAngle - normalizedRot) % 360 + 360) % 360
        const winnerIndex = Math.floor(adjusted / anglePerSlice) % count
        setWinner(options[winnerIndex] || `Opción ${winnerIndex + 1}`)
      }
    }

    animRef.current = requestAnimationFrame(animate)
  }

  return (
    <main className="min-h-screen bg-background text-foreground font-sans flex flex-col items-center py-10 px-4 gap-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-balance">
          RULETA CUADRADA
        </h1>
        <p className="text-muted-foreground mt-1 text-sm tracking-widest uppercase">
          Cargá opciones y girá
        </p>
      </div>

      {/* Main layout */}
      <div className="w-full max-w-3xl flex flex-col md:flex-row gap-8 items-start justify-center">

        {/* Left: controls */}
        <div className="flex flex-col gap-5 w-full md:w-64 shrink-0">

          {/* Cantidad */}
          <div className="bg-card border border-border rounded p-4 flex flex-col gap-3">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Cantidad de opciones
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleCountChange(count - 1)}
                disabled={count <= 2 || isSpinning}
                className="w-9 h-9 rounded bg-secondary text-foreground font-bold text-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-30"
                aria-label="Reducir opciones"
              >
                −
              </button>
              <span className="text-3xl font-bold tabular-nums w-8 text-center">{count}</span>
              <button
                onClick={() => handleCountChange(count + 1)}
                disabled={count >= 8 || isSpinning}
                className="w-9 h-9 rounded bg-secondary text-foreground font-bold text-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-30"
                aria-label="Agregar opción"
              >
                +
              </button>
            </div>
          </div>

          {/* Opciones */}
          <div className="bg-card border border-border rounded p-4 flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
              Títulos
            </label>
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-sm shrink-0"
                  style={{
                    background: [
                      "#f97316","#22c55e","#3b82f6","#ec4899",
                      "#eab308","#14b8a6","#f43f5e","#a855f7"
                    ][i % 8],
                  }}
                />
                <input
                  type="text"
                  value={opt}
                  disabled={isSpinning}
                  onChange={(e) => handleOptionChange(i, e.target.value)}
                  maxLength={20}
                  placeholder={`Opción ${i + 1}`}
                  className="flex-1 bg-input border border-border rounded px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
                />
              </div>
            ))}
          </div>

          {/* Spin button */}
          <button
            onClick={spin}
            disabled={isSpinning}
            className="w-full py-4 rounded bg-primary text-primary-foreground font-bold text-lg tracking-widest uppercase hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSpinning ? "GIRANDO…" : "GIRAR"}
          </button>
        </div>

        {/* Right: wheel + result */}
        <div className="flex flex-col items-center gap-5 flex-1">
          <div className="w-full max-w-[420px] aspect-square relative">
            <SquareWheel
              options={options.slice(0, count)}
              rotation={rotation}
              isSpinning={isSpinning}
            />
          </div>

          {/* Winner */}
          {winner && !isSpinning && (
            <div className="bg-card border border-primary rounded px-6 py-4 text-center animate-in fade-in slide-in-from-bottom-4 duration-300">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Resultado</p>
              <p className="text-2xl font-bold text-primary text-balance">{winner}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
