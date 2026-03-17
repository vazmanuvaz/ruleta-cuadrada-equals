"use client"

import { useRef, useEffect, useCallback } from "react"

const SLICE_COLORS = [
  "#f97316",
  "#22c55e",
  "#3b82f6",
  "#ec4899",
  "#eab308",
  "#14b8a6",
  "#f43f5e",
  "#a855f7",
]

interface SquareWheelProps {
  options: string[]
  rotation: number
  isSpinning: boolean
}

export function SquareWheel({ options, rotation, isSpinning }: SquareWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const count = options.length

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || count === 0) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const size = canvas.width
    const cx = size / 2
    const cy = size / 2
    const r = size / 2

    ctx.clearRect(0, 0, size, size)

    // Save and rotate the whole wheel
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.translate(-cx, -cy)

    // clip to square
    ctx.beginPath()
    ctx.rect(0, 0, size, size)
    ctx.clip()

    const anglePerSlice = (2 * Math.PI) / count

    for (let i = 0; i < count; i++) {
      const startAngle = i * anglePerSlice
      const endAngle = startAngle + anglePerSlice
      const color = SLICE_COLORS[i % SLICE_COLORS.length]

      // Draw pie slice clipped to square
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, r * 1.5, startAngle, endAngle)
      ctx.closePath()
      ctx.fillStyle = color
      ctx.fill()

      // Draw label
      const labelAngle = startAngle + anglePerSlice / 2
      const labelR = r * 0.58
      const lx = cx + Math.cos(labelAngle) * labelR
      const ly = cy + Math.sin(labelAngle) * labelR

      ctx.save()
      ctx.translate(lx, ly)
      ctx.rotate(labelAngle + Math.PI / 2)
      ctx.fillStyle = "rgba(0,0,0,0.85)"
      ctx.font = `bold ${Math.max(10, Math.min(16, size / (count * 1.4)))}px sans-serif`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      const label = options[i] || ""
      const maxLen = 14
      const displayLabel = label.length > maxLen ? label.slice(0, maxLen - 1) + "…" : label
      ctx.fillText(displayLabel, 0, 0)
      ctx.restore()
    }

    // Center dot
    ctx.beginPath()
    ctx.arc(cx, cy, 10, 0, 2 * Math.PI)
    ctx.fillStyle = "#0f0f0f"
    ctx.fill()
    ctx.strokeStyle = "#ffffff30"
    ctx.lineWidth = 2
    ctx.stroke()

    // Grid lines between slices
    ctx.strokeStyle = "rgba(0,0,0,0.25)"
    ctx.lineWidth = 1
    for (let i = 0; i < count; i++) {
      const angle = i * anglePerSlice
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + Math.cos(angle) * r * 1.5, cy + Math.sin(angle) * r * 1.5)
      ctx.stroke()
    }

    ctx.restore()

    // Pointer - triangle on top edge center pointing down
    const pSize = 18
    ctx.save()
    ctx.translate(cx, 0)
    ctx.beginPath()
    ctx.moveTo(-pSize / 2, 0)
    ctx.lineTo(pSize / 2, 0)
    ctx.lineTo(0, pSize)
    ctx.closePath()
    ctx.fillStyle = "#ffffff"
    ctx.shadowColor = "#000"
    ctx.shadowBlur = 8
    ctx.fill()
    ctx.restore()
  }, [options, rotation, count])

  useEffect(() => {
    draw()
  }, [draw])

  return (
    <canvas
      ref={canvasRef}
      width={420}
      height={420}
      className="w-full max-w-[420px] aspect-square"
      style={{ imageRendering: "crisp-edges" }}
    />
  )
}
