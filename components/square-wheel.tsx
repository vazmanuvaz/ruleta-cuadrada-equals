"use client"

import { useRef, useEffect, useCallback } from "react"

export const SLICE_COLORS = [
  "#FFADAD",
  "#A8D8EA",
  "#B5EAD7",
  "#FFDAC1",
  "#C7CEEA",
  "#FFD6E7",
  "#D4F1BE",
  "#FFF1BA",
]

// Darker text-safe versions of each pastel for labels
const LABEL_COLORS = [
  "#7a2020",
  "#14506a",
  "#1a5c42",
  "#7a4010",
  "#3a3a6e",
  "#6e2050",
  "#2e6014",
  "#6e5800",
]

interface SquareWheelProps {
  options: string[]
  rotation: number
  isSpinning: boolean
  size?: number
}

export function SquareWheel({ options, rotation, isSpinning, size = 420 }: SquareWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const count = options.length

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || count === 0) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const s = canvas.width
    const cx = s / 2
    const cy = s / 2
    const r = s / 2

    ctx.clearRect(0, 0, s, s)

    // White background fill
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, s, s)

    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.translate(-cx, -cy)

    // Clip to square
    ctx.beginPath()
    ctx.rect(0, 0, s, s)
    ctx.clip()

    const anglePerSlice = (2 * Math.PI) / count

    for (let i = 0; i < count; i++) {
      const startAngle = i * anglePerSlice
      const endAngle = startAngle + anglePerSlice
      const color = SLICE_COLORS[i % SLICE_COLORS.length]
      const labelColor = LABEL_COLORS[i % LABEL_COLORS.length]

      // Pie slice
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, r * 1.5, startAngle, endAngle)
      ctx.closePath()
      ctx.fillStyle = color
      ctx.fill()

      // Divider lines — very subtle
      ctx.strokeStyle = "rgba(255,255,255,0.7)"
      ctx.lineWidth = 2
      ctx.stroke()

      // Label
      const labelAngle = startAngle + anglePerSlice / 2
      const labelR = r * 0.58
      const lx = cx + Math.cos(labelAngle) * labelR
      const ly = cy + Math.sin(labelAngle) * labelR

      ctx.save()
      ctx.translate(lx, ly)
      ctx.rotate(labelAngle + Math.PI / 2)
      ctx.fillStyle = labelColor
      const fontSize = Math.max(9, Math.min(14, s / (count * 1.6)))
      ctx.font = `600 ${fontSize}px -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      const label = options[i] || ""
      const maxLen = 13
      const displayLabel = label.length > maxLen ? label.slice(0, maxLen - 1) + "…" : label
      ctx.fillText(displayLabel, 0, 0)
      ctx.restore()
    }

    // Center circle
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 14)
    grad.addColorStop(0, "#ffffff")
    grad.addColorStop(1, "#e8eaf6")
    ctx.beginPath()
    ctx.arc(cx, cy, 14, 0, 2 * Math.PI)
    ctx.fillStyle = grad
    ctx.shadowColor = "rgba(0,0,0,0.12)"
    ctx.shadowBlur = 8
    ctx.fill()
    ctx.shadowBlur = 0
    ctx.strokeStyle = "rgba(100,100,160,0.2)"
    ctx.lineWidth = 1.5
    ctx.stroke()

    ctx.restore()

    // Pointer — soft teardrop at top center
    const pW = 14
    const pH = 22
    ctx.save()
    ctx.translate(cx, 0)
    ctx.beginPath()
    ctx.moveTo(-pW / 2, 0)
    ctx.lineTo(pW / 2, 0)
    ctx.lineTo(0, pH)
    ctx.closePath()
    ctx.fillStyle = "#7c86ff"
    ctx.shadowColor = "rgba(124,134,255,0.4)"
    ctx.shadowBlur = 10
    ctx.fill()
    ctx.shadowBlur = 0
    ctx.restore()
  }, [options, rotation, count])

  useEffect(() => {
    draw()
  }, [draw])

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="w-full h-full"
      style={{ imageRendering: "crisp-edges", borderRadius: "1rem" }}
      aria-label="Ruleta de decisiones"
    />
  )
}
