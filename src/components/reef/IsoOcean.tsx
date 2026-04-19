'use client'
import { useRef, useState, useCallback, useEffect, useMemo } from 'react'
import type { GridTile } from '@/types'

interface IsoOceanProps {
  gridTiles: GridTile[]
  progressScore: number
  healthScore: number
  streakDays?: number
}

// ─── Isometric constants ───────────────────────────────────────────────────
const TW = 62, TH = 25, DEPTH = 46
const SVG_W = 556, SVG_H = 295
const MAX_FISH = 12
const MIN_SCALE = 0.25
const MAX_SCALE = 4

function isoX(col: number, row: number) { return (col - row) * (TW / 2) }
function isoY(col: number, row: number) { return (col + row) * (TH / 2) }

// ─── Decoration types ─────────────────────────────────────────────────────
const DECO = ['rock', 'sanddollar', 'seaweed', 'coral'] as const
type Deco = typeof DECO[number]

function tileDeco(col: number, row: number): Deco {
  // Previous formula always produced even numbers (only rock/seaweed appeared).
  // Adding (col+row+1)*3 breaks the parity lock and gives all 4 types.
  const h = Math.abs(col * 31 + row * 17 + (col ^ row) * 7 + (col + row + 1) * 3)
  return DECO[h % 4]
}

// ─── Decoration sub-components ────────────────────────────────────────────
function DecoRock({ x, y }: { x: number; y: number }) {
  const s = 10
  return (
    <g>
      <ellipse cx={x} cy={y + s * 0.44} rx={s * 1.1} ry={s * 0.42} fill="#04101a" opacity={0.38} />
      <path d={`M ${x - s} ${y} L ${x} ${y + s * 0.52} L ${x} ${y + s * 0.94} L ${x - s} ${y + s * 0.42}`} fill="#101e2c" />
      <ellipse cx={x} cy={y} rx={s} ry={s * 0.52} fill="#1c3848" />
      <ellipse cx={x - s * 0.22} cy={y - s * 0.06} rx={s * 0.44} ry={s * 0.24} fill="#264e62" opacity={0.7} />
    </g>
  )
}

function DecoSandDollar({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <ellipse cx={x} cy={y + 3.5} rx={9} ry={4} fill="#05121a" opacity={0.4} />
      <ellipse cx={x} cy={y} rx={9} ry={5} fill="#9e6f38" />
      <ellipse cx={x} cy={y} rx={6.5} ry={3.5} fill="#c8904a" />
      <path d={`M ${x - 6} ${y} Q ${x} ${y - 6} ${x + 6} ${y}`} fill="none" stroke="#daa050" strokeWidth={1.1} opacity={0.8} />
    </g>
  )
}

function DecoSeaweed({ x, y, col, row }: { x: number; y: number; col: number; row: number }) {
  const h = 44
  const b = 10
  const dur = (2.1 + (Math.abs(col + row) % 5) * 0.28).toFixed(2)
  return (
    <g>
      <ellipse cx={x} cy={y + 2} rx={4.5} ry={2} fill="#040e08" opacity={0.45} />
      <g>
        <animateTransform attributeName="transform" type="rotate"
          values={`-5 ${x} ${y};5 ${x} ${y};-5 ${x} ${y}`}
          dur={`${dur}s`} repeatCount="indefinite" calcMode="spline"
          keyTimes="0;0.5;1" keySplines="0.45 0 0.55 1;0.45 0 0.55 1" />
        <path d={`M ${x} ${y} C ${x + b} ${y - h * 0.3} ${x - b} ${y - h * 0.65} ${x + 4} ${y - h}`}
          fill="none" stroke="#1a5c30" strokeWidth={5} strokeLinecap="round" />
        <path d={`M ${x} ${y} C ${x + b} ${y - h * 0.3} ${x - b} ${y - h * 0.65} ${x + 4} ${y - h}`}
          fill="none" stroke="#2e9450" strokeWidth={2.8} strokeLinecap="round" />
        <path d={`M ${x + 3} ${y - 2} C ${x - b} ${y - h * 0.4} ${x + b} ${y - h * 0.72} ${x - 3} ${y - h - 4}`}
          fill="none" stroke="#1a5c30" strokeWidth={4} strokeLinecap="round" />
        <path d={`M ${x + 3} ${y - 2} C ${x - b} ${y - h * 0.4} ${x + b} ${y - h * 0.72} ${x - 3} ${y - h - 4}`}
          fill="none" stroke="#2e9450" strokeWidth={2.2} strokeLinecap="round" />
      </g>
    </g>
  )
}

function DecoCoral({ x, y, col, row }: { x: number; y: number; col: number; row: number }) {
  const COLORS = ['#e05060', '#c040a8', '#e04848', '#d06520']
  const color = COLORS[(Math.abs(col) * 3 + Math.abs(row) * 7) % 4]
  const h = 42, r = 5.5
  return (
    <g>
      <ellipse cx={x} cy={y + 3} rx={7.5} ry={3} fill={color} opacity={0.15} />
      <line x1={x} y1={y} x2={x} y2={y - h} stroke={color} strokeWidth={4} strokeLinecap="round" />
      <line x1={x} y1={y - h * 0.31} x2={x + 15} y2={y - h * 0.49} stroke={color} strokeWidth={2.8} strokeLinecap="round" />
      <circle cx={x + 15} cy={y - h * 0.49} r={r} fill={color} />
      <circle cx={x + 15 - r * 0.35} cy={y - h * 0.49 - r * 0.22} r={r * 0.28} fill="white" opacity={0.28} />
      <line x1={x} y1={y - h * 0.52} x2={x - 14} y2={y - h * 0.67} stroke={color} strokeWidth={2.8} strokeLinecap="round" />
      <circle cx={x - 14} cy={y - h * 0.67} r={r} fill={color} />
      <circle cx={x - 14 - r * 0.3} cy={y - h * 0.67 - r * 0.22} r={r * 0.28} fill="white" opacity={0.28} />
      <circle cx={x} cy={y - h} r={r} fill={color} />
      <circle cx={x - r * 0.3} cy={y - h - r * 0.25} r={r * 0.3} fill="white" opacity={0.3} />
    </g>
  )
}

// ─── Fish ─────────────────────────────────────────────────────────────────
interface FishCfg { yPos: number; dur: number; delay: number; rtl: boolean; small: boolean }
const FISH_POOL: FishCfg[] = [
  { yPos: 180, dur: 15, delay: 3,  rtl: false, small: false },
  { yPos: 205, dur: 11, delay: 8,  rtl: true,  small: true  },
  { yPos: 155, dur: 17, delay: 1,  rtl: false, small: true  },
  { yPos: 225, dur: 13, delay: 5,  rtl: true,  small: false },
  { yPos: 140, dur: 19, delay: 11, rtl: false, small: false },
  { yPos: 245, dur: 12, delay: 7,  rtl: true,  small: true  },
  { yPos: 170, dur: 16, delay: 2,  rtl: false, small: true  },
  { yPos: 215, dur: 14, delay: 9,  rtl: true,  small: false },
  { yPos: 130, dur: 18, delay: 4,  rtl: false, small: false },
  { yPos: 255, dur: 10, delay: 6,  rtl: true,  small: true  },
  { yPos: 192, dur: 20, delay: 12, rtl: false, small: false },
  { yPos: 165, dur: 11, delay: 3,  rtl: true,  small: true  },
]

function IsoFish({ yPos, dur, delay, rtl, small }: FishCfg) {
  const sc = small ? 0.72 : 1
  const fill = small ? '#bbe1fa' : '#3282b8'
  const fin  = small ? '#9acae8' : '#205c8a'
  return (
    <g>
      <animateTransform attributeName="transform" type="translate"
        from={rtl ? `${SVG_W + 60} 0` : '-60 0'}
        to={rtl ? '-60 0' : `${SVG_W + 60} 0`}
        dur={`${dur}s`} begin={`-${delay}s`} repeatCount="indefinite" />
      <g transform={`scale(${rtl ? -sc : sc}, ${sc})`}>
        <ellipse cx={0} cy={yPos} rx={13} ry={6.5} fill={fill} opacity={0.9} />
        <polygon points={`-13,${yPos} -22,${yPos - 7} -22,${yPos + 7}`} fill={fin} />
        <ellipse cx={6} cy={yPos - 2} rx={3} ry={3} fill="white" />
        <circle cx={7} cy={yPos - 2} r={1.4} fill="#0a1820" />
        <line x1={-1} y1={yPos - 6.5} x2={2} y2={yPos - 13} stroke={fin} strokeWidth={2} strokeLinecap="round" />
      </g>
    </g>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────
export default function IsoOcean({ gridTiles, progressScore, healthScore, streakDays = 0 }: IsoOceanProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [{ scale, panX, panY }, setView] = useState({ scale: 1, panX: 0, panY: 0 })
  const [dragging, setDragging] = useState(false)
  const isDragging = useRef(false)
  const lastPt = useRef({ x: 0, y: 0 })

  // ── Derived geometry ────────────────────────────────────────────────────
  const { cx, cy } = useMemo(() => {
    if (gridTiles.length === 0) return { cx: 0, cy: 0 }
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
    for (const { col, row } of gridTiles) {
      const corners: [number, number][] = [
        [isoX(col, row), isoY(col, row)],
        [isoX(col + 1, row), isoY(col + 1, row)],
        [isoX(col + 1, row + 1), isoY(col + 1, row + 1)],
        [isoX(col, row + 1), isoY(col, row + 1)],
      ]
      for (const [x, y] of corners) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
    return {
      cx: (minX + maxX) / 2,
      cy: (minY + maxY + DEPTH) / 2,
    }
  }, [gridTiles])

  // ── Sorted tiles (painter's algorithm: back → front) ───────────────────
  const sortedTiles = useMemo(
    () => [...gridTiles].sort((a, b) => (a.col + a.row) - (b.col + b.row) || a.col - b.col),
    [gridTiles]
  )

  // ── Tile set for adjacency lookup ───────────────────────────────────────
  const tileSet = useMemo(
    () => new Set(gridTiles.map(({ col, row }) => `${col},${row}`)),
    [gridTiles]
  )

  // ── Addition order for decoration assignment ────────────────────────────
  const addOrder = useMemo(() => {
    const m = new Map<string, number>()
    gridTiles.forEach(({ col, row }, i) => m.set(`${col},${row}`, i))
    return m
  }, [gridTiles])

  // ── Fish count (visual cap) ─────────────────────────────────────────────
  // Fish scale with decorated tile count (1 fish per 3 objects), capped for performance
  const decoratedCount = Math.min(progressScore, gridTiles.length)
  const fishCount = Math.min(MAX_FISH, Math.floor(decoratedCount / 3))

  // ── Wheel zoom (non-passive) ────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const handler = (e: WheelEvent) => {
      e.preventDefault()
      const factor = e.deltaY < 0 ? 1.08 : 0.925
      setView(v => ({ ...v, scale: Math.min(MAX_SCALE, Math.max(MIN_SCALE, v.scale * factor)) }))
    }
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [])

  // ── Pan via pointer ─────────────────────────────────────────────────────
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true
    setDragging(true)
    lastPt.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId)
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return
    const dx = e.clientX - lastPt.current.x
    const dy = e.clientY - lastPt.current.y
    lastPt.current = { x: e.clientX, y: e.clientY }
    setView(v => ({ ...v, panX: v.panX + dx, panY: v.panY + dy }))
  }, [])

  const onPointerUp = useCallback(() => {
    isDragging.current = false
    setDragging(false)
  }, [])

  const alpha = Math.max(0.45, healthScore / 100)
  const gx = SVG_W / 2 + panX
  const gy = SVG_H / 2 + panY

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        background: 'linear-gradient(180deg,#0b1b28 0%,#0d2a40 55%,#0f3450 100%)',
        height: 295,
        overflow: 'hidden',
        flexShrink: 0,
        cursor: dragging ? 'grabbing' : 'grab',
        userSelect: 'none',
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <svg
        width="100%"
        height="295"
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ opacity: alpha, display: 'block' }}
      >
        <defs>
          <linearGradient id="isoFloor" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e5878" />
            <stop offset="100%" stopColor="#143d58" />
          </linearGradient>
          <linearGradient id="isoSideL" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0e3250" />
            <stop offset="100%" stopColor="#081c30" />
          </linearGradient>
          <linearGradient id="isoSideR" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0a2640" />
            <stop offset="100%" stopColor="#06121e" />
          </linearGradient>
          <radialGradient id="causA" cx="35%" cy="20%" r="35%">
            <stop offset="0%" stopColor="rgba(187,225,250,0.07)" />
            <stop offset="100%" stopColor="rgba(187,225,250,0)" />
          </radialGradient>
          <radialGradient id="causB" cx="72%" cy="55%" r="28%">
            <stop offset="0%" stopColor="rgba(187,225,250,0.05)" />
            <stop offset="100%" stopColor="rgba(187,225,250,0)" />
          </radialGradient>
        </defs>

        {/* Caustic light */}
        <rect width={SVG_W} height={SVG_H} fill="url(#causA)" style={{ animation: 'iso-caustic 6s ease-in-out infinite' }} />
        <rect width={SVG_W} height={SVG_H} fill="url(#causB)" style={{ animation: 'iso-caustic 8s ease-in-out 2s infinite' }} />

        {/* Light shafts */}
        <polygon points="70,0 130,0 155,295 45,295" fill="rgba(187,225,250,0.022)" />
        <polygon points="240,0 290,0 305,295 225,295" fill="rgba(187,225,250,0.018)" />
        <polygon points="420,0 465,0 478,295 407,295" fill="rgba(187,225,250,0.016)" />

        {/* Bubbles */}
        {([[55, 90], [138, 130], [215, 68], [345, 105], [455, 78], [510, 155], [82, 175], [290, 48]] as [number, number][]).map(([bx, by], i) => (
          <circle key={i} cx={bx} cy={by} r={1.8 + (i % 3) * 1.2}
            fill="none" stroke="rgba(187,225,250,0.28)" strokeWidth={0.9}
            style={{ animation: `iso-bubble ${4.5 + i * 0.7}s ease-in-out -${i * 1.1}s infinite` }} />
        ))}

        {/* ── Island (pannable / zoomable) ── */}
        <g transform={`translate(${gx}, ${gy}) scale(${scale})`}>
          {sortedTiles.map(({ col, row }) => {
            // Tile corner screen coords (centered at island centroid)
            const x0 = isoX(col, row) - cx,       y0 = isoY(col, row) - cy
            const x1 = isoX(col + 1, row) - cx,   y1 = isoY(col + 1, row) - cy
            const x2 = isoX(col + 1, row + 1) - cx, y2 = isoY(col + 1, row + 1) - cy
            const x3 = isoX(col, row + 1) - cx,   y3 = isoY(col, row + 1) - cy

            // Only draw a side face when no adjacent tile blocks it
            const showBottom = !tileSet.has(`${col},${row + 1}`)   // front-left face
            const showRight  = !tileSet.has(`${col + 1},${row}`)   // front-right face

            // Decoration center (centroid of top face)
            const dx = (x0 + x1 + x2 + x3) / 4
            const dy = (y0 + y1 + y2 + y3) / 4

            const addIdx = addOrder.get(`${col},${row}`) ?? 0
            const hasDeco = addIdx < progressScore
            const deco = hasDeco ? tileDeco(col, row) : null

            const key = `${col},${row}`
            return (
              <g key={key}>
                {/* Front-right face */}
                {showRight && (
                  <polygon
                    points={`${x1},${y1} ${x2},${y2} ${x2},${y2 + DEPTH} ${x1},${y1 + DEPTH}`}
                    fill="url(#isoSideR)"
                  />
                )}
                {/* Front-left face */}
                {showBottom && (
                  <polygon
                    points={`${x3},${y3} ${x2},${y2} ${x2},${y2 + DEPTH} ${x3},${y3 + DEPTH}`}
                    fill="url(#isoSideL)"
                  />
                )}
                {/* Top face */}
                <polygon
                  points={`${x0},${y0} ${x1},${y1} ${x2},${y2} ${x3},${y3}`}
                  fill="url(#isoFloor)"
                  stroke="rgba(187,225,250,0.07)"
                  strokeWidth={0.6}
                />
                {/* Decoration */}
                {deco === 'rock'       && <DecoRock       x={dx} y={dy} />}
                {deco === 'sanddollar' && <DecoSandDollar x={dx} y={dy} />}
                {deco === 'seaweed'    && <DecoSeaweed    x={dx} y={dy} col={col} row={row} />}
                {deco === 'coral'      && <DecoCoral      x={dx} y={dy} col={col} row={row} />}
              </g>
            )
          })}
        </g>

        {/* ── Fish — always in viewport space (outside zoom group) ── */}
        {FISH_POOL.slice(0, fishCount).map((cfg, i) => (
          <IsoFish key={i} {...cfg} />
        ))}
      </svg>

      {/* HUD */}
      <div style={{ position: 'absolute', top: 14, left: 16, display: 'flex', gap: 16, pointerEvents: 'none' }}>
        {[
          { val: progressScore, label: 'tasks complete' },
          { val: `${streakDays}d`, label: 'streak 🔥' },
        ].map(({ val, label }) => (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <span style={{ fontFamily: 'var(--font-figtree)', fontSize: 20, fontWeight: 700, color: '#bbe1fa', lineHeight: 1 }}>{val}</span>
            <span style={{ fontSize: 10, color: 'rgba(187,225,250,0.5)' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Zoom hint */}
      <div style={{ position: 'absolute', bottom: 10, right: 12, fontSize: 10, color: 'rgba(187,225,250,0.3)', pointerEvents: 'none' }}>
        scroll to zoom · drag to pan
      </div>

      <style>{`
        @keyframes iso-caustic {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.08); }
        }
        @keyframes iso-bubble {
          0%, 100% { opacity: 0.25; transform: translateY(0); }
          50%       { opacity: 0.6;  transform: translateY(-14px); }
        }
      `}</style>
    </div>
  )
}
