'use client'

interface IsoOceanProps {
  progressScore: number
  healthScore: number
  streakDays?: number
}

const CX = 278, CY = 116, TW = 62, TH = 25, N = 5, DEPTH = 46

function isoPos(col: number, row: number): [number, number] {
  return [CX + (col - row) * TW / 2, CY + (col + row) * TH / 2]
}

function polyPt(coords: [number, number][]) {
  return coords.map(c => c.join(',')).join(' ')
}

function IsoShell({ col, row }: { col: number; row: number }) {
  const [x, y] = isoPos(col, row)
  return (
    <g>
      <ellipse cx={x} cy={y + 3.5} rx={10} ry={4.5} fill="#05121a" opacity={0.45} />
      <ellipse cx={x} cy={y} rx={10} ry={5.5} fill="#9e6f38" />
      <ellipse cx={x} cy={y} rx={7} ry={4} fill="#c8904a" />
      <path d={`M ${x-7} ${y} Q ${x} ${y-8} ${x+7} ${y}`} fill="none" stroke="#daa050" strokeWidth={1.2} opacity={0.8} />
      <path d={`M ${x-5} ${y+1} Q ${x} ${y-5} ${x+5} ${y+1}`} fill="none" stroke="#daa050" strokeWidth={0.8} opacity={0.5} />
    </g>
  )
}

function IsoRock({ col, row, size = 14 }: { col: number; row: number; size?: number }) {
  const [x, y] = isoPos(col, row)
  const s = size
  return (
    <g>
      <ellipse cx={x} cy={y + s * 0.42} rx={s * 1.15} ry={s * 0.45} fill="#04101a" opacity={0.4} />
      <path d={`M ${x-s} ${y} L ${x} ${y+s*0.52} L ${x} ${y+s*0.52+s*0.42} L ${x-s} ${y+s*0.42}`} fill="#101e2c" />
      <ellipse cx={x} cy={y} rx={s} ry={s * 0.52} fill="#1c3848" />
      <ellipse cx={x - s*0.22} cy={y - s*0.06} rx={s*0.48} ry={s*0.26} fill="#264e62" opacity={0.75} />
    </g>
  )
}

function IsoSeaweed({ col, row, h = 54 }: { col: number; row: number; h?: number }) {
  const [x, y] = isoPos(col, row)
  const b = 13
  const dur = (2.1 + col * 0.28).toFixed(2)
  return (
    <g>
      <ellipse cx={x} cy={y + 2.5} rx={5} ry={2.5} fill="#040e08" opacity={0.5} />
      <g>
        <animateTransform attributeName="transform" type="rotate"
          values={`-5 ${x} ${y};5 ${x} ${y};-5 ${x} ${y}`}
          dur={`${dur}s`} repeatCount="indefinite" calcMode="spline"
          keyTimes="0;0.5;1" keySplines="0.45 0 0.55 1;0.45 0 0.55 1" />
        <path d={`M ${x} ${y} C ${x+b} ${y-h*0.3} ${x-b} ${y-h*0.65} ${x+5} ${y-h}`}
          fill="none" stroke="#1a5c30" strokeWidth={5.5} strokeLinecap="round" />
        <path d={`M ${x} ${y} C ${x+b} ${y-h*0.3} ${x-b} ${y-h*0.65} ${x+5} ${y-h}`}
          fill="none" stroke="#2e9450" strokeWidth={3.2} strokeLinecap="round" />
        <path d={`M ${x+4} ${y-3} C ${x-b} ${y-h*0.38} ${x+b} ${y-h*0.7} ${x-4} ${y-h-5}`}
          fill="none" stroke="#1a5c30" strokeWidth={4.5} strokeLinecap="round" />
        <path d={`M ${x+4} ${y-3} C ${x-b} ${y-h*0.38} ${x+b} ${y-h*0.7} ${x-4} ${y-h-5}`}
          fill="none" stroke="#2e9450" strokeWidth={2.5} strokeLinecap="round" />
      </g>
    </g>
  )
}

function IsoCoral({ col, row, color = '#e05060', large = false }: { col: number; row: number; color?: string; large?: boolean }) {
  const [x, y] = isoPos(col, row)
  const h = large ? 66 : 44
  const r = large ? 9.5 : 6.5
  const sw = large ? 5.5 : 4
  return (
    <g>
      <ellipse cx={x} cy={y + 3.5} rx={8} ry={3.5} fill={color} opacity={0.18} />
      <line x1={x} y1={y} x2={x} y2={y - h} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <line x1={x} y1={y - h*0.31} x2={x+17} y2={y - h*0.49} stroke={color} strokeWidth={3.2} strokeLinecap="round" />
      <circle cx={x+17} cy={y - h*0.49} r={r} fill={color} />
      <circle cx={x+17 - r*0.35} cy={y - h*0.49 - r*0.22} r={r*0.28} fill="white" opacity={0.28} />
      <line x1={x} y1={y - h*0.52} x2={x-16} y2={y - h*0.67} stroke={color} strokeWidth={3.2} strokeLinecap="round" />
      <circle cx={x-16} cy={y - h*0.67} r={r} fill={color} />
      <circle cx={x-16 - r*0.3} cy={y - h*0.67 - r*0.22} r={r*0.28} fill="white" opacity={0.28} />
      {large && (
        <>
          <line x1={x} y1={y - h*0.7} x2={x+11} y2={y - h*0.83} stroke={color} strokeWidth={2.6} strokeLinecap="round" />
          <circle cx={x+11} cy={y - h*0.83} r={r*0.72} fill={color} />
          <line x1={x} y1={y - h*0.63} x2={x-11} y2={y - h*0.78} stroke={color} strokeWidth={2.6} strokeLinecap="round" />
          <circle cx={x-11} cy={y - h*0.78} r={r*0.72} fill={color} />
        </>
      )}
      <circle cx={x} cy={y - h} r={r} fill={color} />
      <circle cx={x - r*0.3} cy={y - h - r*0.25} r={r*0.3} fill="white" opacity={0.32} />
    </g>
  )
}

function IsoAnemone({ col, row }: { col: number; row: number }) {
  const [x, y] = isoPos(col, row)
  const n = 8
  return (
    <g>
      <ellipse cx={x} cy={y + 3.5} rx={12} ry={5} fill="#04080e" opacity={0.4} />
      <ellipse cx={x} cy={y} rx={11} ry={5.5} fill="#5a1858" />
      <ellipse cx={x} cy={y} rx={7} ry={3.5} fill="#7a2878" />
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2
        const ex = x + Math.cos(a) * 10
        const ey = y + Math.sin(a) * 4 - 20
        return (
          <path key={i}
            d={`M ${x + Math.cos(a)*4} ${y + Math.sin(a)*1.5 - 2} Q ${ex + Math.cos(a)*3} ${ey+9} ${ex} ${ey}`}
            fill="none" stroke="#b040c0" strokeWidth={2.2} strokeLinecap="round" />
        )
      })}
    </g>
  )
}

function IsoJellyfish({ col, row }: { col: number; row: number }) {
  const [x, y] = isoPos(col, row)
  return (
    <g>
      <animateTransform attributeName="transform" type="translate"
        values="0,0;0,-7;0,0" dur="3.2s" repeatCount="indefinite"
        calcMode="spline" keyTimes="0;0.5;1" keySplines="0.4 0 0.6 1;0.4 0 0.6 1" />
      <ellipse cx={x} cy={y - 22} rx={17} ry={13} fill="rgba(187,225,250,0.28)" stroke="rgba(187,225,250,0.55)" strokeWidth={1.2} />
      <ellipse cx={x} cy={y - 24} rx={10} ry={7} fill="rgba(187,225,250,0.14)" />
      <ellipse cx={x - 4} cy={y - 27} rx={5} ry={3} fill="rgba(255,255,255,0.1)" />
      {[-9, -3, 3, 9].map((dx, i) => (
        <path key={i}
          d={`M ${x+dx} ${y-10} C ${x+dx+5} ${y+2} ${x+dx-5} ${y+14} ${x+dx+2} ${y+26}`}
          fill="none" stroke="rgba(187,225,250,0.4)" strokeWidth={1.6} strokeLinecap="round" />
      ))}
    </g>
  )
}

function IsoFish({ yPos, dur = 14, delay = 0, rtl = false, small = false }: {
  yPos: number; dur?: number; delay?: number; rtl?: boolean; small?: boolean
}) {
  const sc = small ? 0.72 : 1
  return (
    <g>
      <animateTransform attributeName="transform" type="translate"
        from={rtl ? '620 0' : '-60 0'} to={rtl ? '-60 0' : '620 0'}
        dur={`${dur}s`} begin={`-${delay}s`} repeatCount="indefinite" />
      <g transform={`scale(${rtl ? -sc : sc}, ${sc})`}>
        <ellipse cx={0} cy={yPos} rx={13} ry={6.5} fill={small ? '#bbe1fa' : '#3282b8'} opacity={0.9} />
        <polygon points={`-13,${yPos} -22,${yPos-7} -22,${yPos+7}`} fill={small ? '#9acae8' : '#205c8a'} />
        <ellipse cx={6} cy={yPos - 2} rx={3} ry={3} fill="white" />
        <circle cx={7} cy={yPos - 2} r={1.4} fill="#0a1820" />
        <line x1={-1} y1={yPos - 6.5} x2={2} y2={yPos - 13} stroke={small ? '#9acae8' : '#205c8a'} strokeWidth={2} strokeLinecap="round" />
      </g>
    </g>
  )
}

const SAND_DOTS: [number, number][] = [
  [0.6,0.4],[2.8,0.5],[4.4,1.0],[0.3,2.2],[1.8,1.6],[3.6,0.8],
  [0.9,3.8],[2.4,4.5],[4.2,4.0],[3.0,3.5],[1.2,4.8],[4.7,2.8],
]

export default function IsoOcean({ progressScore, healthScore, streakDays = 0 }: IsoOceanProps) {
  const tl = isoPos(0, 0)
  const tr = isoPos(N, 0)
  const br = isoPos(N, N)
  const bl = isoPos(0, N)
  const D = DEPTH

  const gridLines: React.ReactNode[] = []
  for (let i = 1; i < N; i++) {
    const [r0x, r0y] = isoPos(0, i), [rNx, rNy] = isoPos(N, i)
    const [c0x, c0y] = isoPos(i, 0), [cNx, cNy] = isoPos(i, N)
    gridLines.push(
      <line key={`r${i}`} x1={r0x} y1={r0y} x2={rNx} y2={rNy} stroke="rgba(187,225,250,0.06)" strokeWidth={0.9} />,
      <line key={`c${i}`} x1={c0x} y1={c0y} x2={cNx} y2={cNy} stroke="rgba(187,225,250,0.06)" strokeWidth={0.9} />
    )
  }

  const s = progressScore
  const show = {
    rocks:     s >= 1,
    shells:    s >= 1,
    seaweed1:  s >= 2,
    seaweed2:  s >= 3,
    seaweed3:  s >= 4,
    coralSm1:  s >= 4,
    coralSm2:  s >= 5,
    fish1:     s >= 5,
    coralLg1:  s >= 6,
    anemone:   s >= 7,
    coralLg2:  s >= 8,
    fish2:     s >= 8,
    jellyfish: s >= 9,
  }

  const alpha = Math.max(0.45, healthScore / 100)

  return (
    <div style={{ position: 'relative', background: 'linear-gradient(180deg,#0b1b28 0%,#0d2a40 55%,#0f3450 100%)', height: 295, overflow: 'hidden', flexShrink: 0 }}>
      <svg width="100%" height="295" viewBox="0 0 556 295" preserveAspectRatio="xMidYMid meet" style={{ opacity: alpha }}>
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
        <rect width="556" height="295" fill="url(#causA)" style={{ animation: 'iso-caustic 6s ease-in-out infinite' }} />
        <rect width="556" height="295" fill="url(#causB)" style={{ animation: 'iso-caustic 8s ease-in-out 2s infinite' }} />

        {/* Light shafts */}
        <polygon points="70,0 130,0 155,295 45,295" fill="rgba(187,225,250,0.022)" />
        <polygon points="240,0 290,0 305,295 225,295" fill="rgba(187,225,250,0.018)" />
        <polygon points="420,0 465,0 478,295 407,295" fill="rgba(187,225,250,0.016)" />

        {/* Bubbles */}
        {([[55,90],[138,130],[215,68],[345,105],[455,78],[510,155],[82,175],[290,48]] as [number,number][]).map(([bx,by],i) => (
          <circle key={i} cx={bx} cy={by} r={1.8+(i%3)*1.2}
            fill="none" stroke="rgba(187,225,250,0.28)" strokeWidth={0.9}
            style={{ animation: `iso-bubble ${4.5+i*0.7}s ease-in-out -${i*1.1}s infinite` }} />
        ))}

        {/* Platform sides */}
        <polygon fill="url(#isoSideR)" points={polyPt([tr, br, [br[0], br[1]+D], [tr[0], tr[1]+D]])} />
        <polygon fill="url(#isoSideL)" points={polyPt([bl, br, [br[0], br[1]+D], [bl[0], bl[1]+D]])} />
        {/* Top face */}
        <polygon fill="url(#isoFloor)" points={polyPt([tl, tr, br, bl])} />
        <polyline fill="none" stroke="rgba(187,225,250,0.12)" strokeWidth={1.2} points={polyPt([tl, tr, br, bl, tl])} />

        {gridLines}

        {/* Sand dots */}
        {SAND_DOTS.map(([c, r], i) => {
          const [sx, sy] = isoPos(c, r)
          return <circle key={i} cx={sx} cy={sy} r={1.4} fill="rgba(187,225,250,0.09)" />
        })}

        {/* Sea elements (back to front) */}
        {show.rocks    && <IsoRock col={4.3} row={0.6} size={13} />}
        {show.rocks    && <IsoRock col={0.6} row={0.5} size={11} />}
        {show.seaweed3 && <IsoSeaweed col={3.2} row={0.5} h={56} />}
        {show.coralLg1 && <IsoCoral col={1.4} row={0.7} color="#c040a8" large />}
        {show.coralSm1 && <IsoCoral col={2.8} row={1.0} color="#e05060" />}
        {show.coralLg2 && <IsoCoral col={4.0} row={1.2} color="#e04848" large />}
        {show.anemone  && <IsoAnemone col={1.0} row={2.2} />}
        {show.coralSm2 && <IsoCoral col={3.8} row={2.5} color="#d06520" />}
        {show.seaweed1 && <IsoSeaweed col={0.7} row={2.8} h={50} />}
        {show.seaweed2 && <IsoSeaweed col={4.6} row={3.4} h={44} />}
        {show.rocks    && <IsoRock col={2.6} row={4.0} size={10} />}
        {show.shells   && <IsoShell col={1.4} row={4.3} />}
        {show.shells   && <IsoShell col={3.9} row={4.5} />}
        {show.rocks    && <IsoRock col={0.5} row={4.6} size={9} />}
        {show.jellyfish && <IsoJellyfish col={2.3} row={1.5} />}
        {show.fish1 && <IsoFish yPos={158} dur={15} delay={3} />}
        {show.fish2 && <IsoFish yPos={175} dur={11} delay={8} rtl small />}
      </svg>

      {/* HUD */}
      <div style={{ position: 'absolute', top: 14, left: 16, display: 'flex', gap: 16 }}>
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

      <style>{`
        @keyframes iso-caustic {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
        @keyframes iso-bubble {
          0%, 100% { opacity: 0.25; transform: translateY(0); }
          50% { opacity: 0.6; transform: translateY(-14px); }
        }
      `}</style>
    </div>
  )
}
