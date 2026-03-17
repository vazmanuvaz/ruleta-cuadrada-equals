"use client"

import { useState, useRef } from "react"
import { SquareWheel, SLICE_COLORS } from "@/components/square-wheel"

const DEFAULT_OPTIONS = ["PIP", "Laucha", "Toto", "Larri", "Bala"]

export default function RuletaPage() {
  const [count, setCount] = useState(5)
  const [options, setOptions] = useState<string[]>(DEFAULT_OPTIONS)
  const [rotation, setRotation] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)
  const [winner, setWinner] = useState<string | null>(null)
  const animRef = useRef<number | null>(null)

  function handleReset() {
    if (animRef.current) cancelAnimationFrame(animRef.current)
    setCount(5)
    setOptions(DEFAULT_OPTIONS)
    setRotation(0)
    setIsSpinning(false)
    setWinner(null)
  }

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

    const extraSpins = 5 + Math.floor(Math.random() * 5)
    const randomOffset = Math.random() * 360
    const totalDeg = extraSpins * 360 + randomOffset

    const startRot = rotation
    const endRot = startRot + totalDeg
    const duration = 3200 + Math.random() * 1200

    let startTime: number | null = null

    function easeOut(t: number) {
      return 1 - Math.pow(1 - t, 4)
    }

    function animate(ts: number) {
      if (!startTime) startTime = ts
      const elapsed = ts - startTime
      const progress = Math.min(elapsed / duration, 1)
      const current = startRot + easeOut(progress) * totalDeg
      setRotation(current)

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate)
      } else {
        setRotation(endRot)
        setIsSpinning(false)
        const anglePerSlice = 360 / count
        const normalizedRot = ((endRot % 360) + 360) % 360
        const adjusted = ((270 - normalizedRot) % 360 + 360) % 360
        const winnerIndex = Math.floor(adjusted / anglePerSlice) % count
        setWinner(options[winnerIndex] || `Opción ${winnerIndex + 1}`)
      }
    }

    animRef.current = requestAnimationFrame(animate)
  }

  return (
    <main className="min-h-screen bg-background font-sans flex flex-col items-center px-4 py-8 sm:py-12 gap-6 sm:gap-10">

      {/* Header */}
      <header className="text-center">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground text-balance">
          Ruleta cuadrada
        </h1>
        <p className="text-muted-foreground mt-1 text-xs font-medium tracking-wide text-pretty">
          by Equals
        </p>
      </header>

      {/* Layout: mobile = column, desktop = row */}
      <div className="w-full max-w-4xl flex flex-col md:flex-row-reverse gap-6 items-start justify-center">

        {/* Wheel — sin contenedor, flota directo */}
        <div className="w-full md:flex-1 flex flex-col items-center gap-5">
          {/* El canvas es √2× más grande que la ruleta para que las esquinas no se corten */}
          <div className="w-full max-w-[360px] sm:max-w-[420px] aspect-square flex items-center justify-center overflow-visible">
            <SquareWheel
              options={options.slice(0, count)}
              rotation={rotation}
              isSpinning={isSpinning}
            />
          </div>

          {/* Winner banner */}
          {winner && !isSpinning && (
            <div
              className="w-full max-w-[260px] sm:max-w-[300px] bg-card rounded-2xl px-6 py-4 text-center animate-in fade-in slide-in-from-bottom-3 duration-400"
              style={{
                boxShadow: "0 2px 16px rgba(124,134,255,0.15), 0 0 0 1px rgba(124,134,255,0.12)",
              }}
            >
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1">
                Resultado
              </p>
              <p className="text-2xl font-semibold text-foreground text-balance">{winner}</p>
            </div>
          )}

          {/* Botones — móvil */}
          <div className="md:hidden w-full max-w-[260px] sm:max-w-[300px] flex gap-3">
            <button
              onClick={spin}
              disabled={isSpinning}
              className="flex-1 py-4 rounded-2xl font-semibold text-base tracking-wide transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              style={{
                background: isSpinning ? "#d0d4ff" : "linear-gradient(135deg, #a5b4fc 0%, #7c86ff 100%)",
                color: "#fff",
                boxShadow: isSpinning ? "none" : "0 4px 20px rgba(124,134,255,0.35)",
              }}
              aria-label="Girar la ruleta"
            >
              {isSpinning ? "Girando…" : "Girar"}
            </button>
            <button
              onClick={handleReset}
              disabled={isSpinning}
              className="py-4 px-5 rounded-2xl font-semibold text-sm tracking-wide transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] bg-secondary text-secondary-foreground hover:bg-accent"
              aria-label="Reiniciar ruleta"
            >
              Reiniciar
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-4 w-full md:w-72 shrink-0">

          {/* Cantidad */}
          <div
            className="bg-card rounded-2xl p-5"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)" }}
          >
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">
              Opciones
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleCountChange(count - 1)}
                disabled={count <= 2 || isSpinning}
                className="w-10 h-10 rounded-xl bg-secondary text-foreground font-semibold text-xl flex items-center justify-center transition-all hover:bg-accent disabled:opacity-30 active:scale-95"
                aria-label="Reducir cantidad"
              >
                −
              </button>
              <span className="text-4xl font-semibold tabular-nums flex-1 text-center text-foreground">
                {count}
              </span>
              <button
                onClick={() => handleCountChange(count + 1)}
                disabled={count >= 8 || isSpinning}
                className="w-10 h-10 rounded-xl bg-secondary text-foreground font-semibold text-xl flex items-center justify-center transition-all hover:bg-accent disabled:opacity-30 active:scale-95"
                aria-label="Agregar opción"
              >
                +
              </button>
            </div>
          </div>

          {/* Títulos */}
          <div
            className="bg-card rounded-2xl p-5"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)" }}
          >
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">
              Títulos
            </p>
            <div className="flex flex-col gap-2.5">
              {options.slice(0, count).map((opt, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span
                    className="w-3 h-3 rounded-full shrink-0 ring-1 ring-black/10"
                    style={{ background: SLICE_COLORS[i % SLICE_COLORS.length] }}
                    aria-hidden="true"
                  />
                  <input
                    type="text"
                    value={opt}
                    disabled={isSpinning}
                    onChange={(e) => handleOptionChange(i, e.target.value)}
                    maxLength={20}
                    placeholder={`Opción ${i + 1}`}
                    className="flex-1 bg-input rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:opacity-50 transition-all"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Botones — desktop */}
          <div className="hidden md:flex gap-3 w-full">
            <button
              onClick={spin}
              disabled={isSpinning}
              className="flex-1 py-4 rounded-2xl font-semibold text-base tracking-wide transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              style={{
                background: isSpinning ? "#d0d4ff" : "linear-gradient(135deg, #a5b4fc 0%, #7c86ff 100%)",
                color: "#fff",
                boxShadow: isSpinning ? "none" : "0 4px 20px rgba(124,134,255,0.35)",
              }}
              aria-label="Girar la ruleta"
            >
              {isSpinning ? "Girando…" : "Girar"}
            </button>
            <button
              onClick={handleReset}
              disabled={isSpinning}
              className="py-4 px-5 rounded-2xl font-semibold text-sm tracking-wide transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] bg-secondary text-secondary-foreground hover:bg-accent"
              aria-label="Reiniciar ruleta"
            >
              Reiniciar
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
