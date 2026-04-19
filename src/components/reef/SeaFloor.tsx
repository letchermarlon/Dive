'use client'
import { useId } from 'react'
import { getUnlockedObjects, getProgressLabel } from '@/lib/progression'

interface SeaFloorProps {
  progressScore: number
  healthScore: number
}

const BUBBLES = [
  { left: '12%', delay: '0s',   size: 4 },
  { left: '38%', delay: '1.8s', size: 3 },
  { left: '62%', delay: '3.4s', size: 5 },
  { left: '82%', delay: '2.1s', size: 3 },
]

function SvgShell() {
  return (
    <svg width="28" height="18" viewBox="-14 -15 28 18" overflow="visible">
      <ellipse cx="0" cy="4" rx="11" ry="3" fill="rgba(0,0,0,0.2)" />
      <path d="M-10 3 Q-6 -12 0 -14 Q6 -12 10 3 Z" fill="#c8904a" />
      <line x1="0" y1="-14" x2="-7" y2="3" stroke="#9e6f38" strokeWidth="1" opacity="0.55" />
      <line x1="0" y1="-14" x2="-2" y2="3" stroke="#9e6f38" strokeWidth="1" opacity="0.55" />
      <line x1="0" y1="-14" x2="2"  y2="3" stroke="#9e6f38" strokeWidth="1" opacity="0.55" />
      <line x1="0" y1="-14" x2="7"  y2="3" stroke="#9e6f38" strokeWidth="1" opacity="0.55" />
    </svg>
  )
}

function SvgSeaweed({ tall = false }: { tall?: boolean }) {
  const h = tall ? 52 : 40
  return (
    <svg
      width="20" height={h}
      viewBox={`-10 0 20 ${h}`}
      overflow="visible"
      style={{ transformOrigin: 'center bottom', animation: `sf-sway ${tall ? '2.6s' : '3.1s'} ease-in-out infinite` }}
    >
      <path d={`M0 ${h} C 9 ${h*0.72} -9 ${h*0.38} 4 3`}       fill="none" stroke="#1a5c30" strokeWidth="5.5" strokeLinecap="round" />
      <path d={`M0 ${h} C 9 ${h*0.72} -9 ${h*0.38} 4 3`}       fill="none" stroke="#2e9450" strokeWidth="3"   strokeLinecap="round" />
      <path d={`M2 ${h*0.78} C -9 ${h*0.52} 9 ${h*0.28} -4 ${h*0.04}`} fill="none" stroke="#1a5c30" strokeWidth="4"   strokeLinecap="round" />
      <path d={`M2 ${h*0.78} C -9 ${h*0.52} 9 ${h*0.28} -4 ${h*0.04}`} fill="none" stroke="#2e9450" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

function SvgCoral({ color = '#e05060', large = false }: { color?: string; large?: boolean }) {
  const h  = large ? 54 : 36
  const r  = large ? 7  : 5
  const sw = large ? 4.5 : 3.5
  return (
    <svg width={large ? 50 : 36} height={h + 4} viewBox={`-25 ${-(h+2)} 50 ${h+4}`} overflow="visible">
      <ellipse cx="0" cy="2" rx="7" ry="2.5" fill={color} opacity="0.15" />
      <line x1="0" y1="0"       x2="0"   y2={-h}       stroke={color} strokeWidth={sw}   strokeLinecap="round" />
      <line x1="0" y1={-h*0.32} x2={-15} y2={-h*0.50}  stroke={color} strokeWidth="2.8" strokeLinecap="round" />
      <circle cx={-15} cy={-h*0.50} r={r} fill={color} />
      <circle cx={-15 - r*0.3} cy={-h*0.50 - r*0.22} r={r*0.28} fill="white" opacity="0.28" />
      <line x1="0" y1={-h*0.54} x2={15}  y2={-h*0.70}  stroke={color} strokeWidth="2.8" strokeLinecap="round" />
      <circle cx={15} cy={-h*0.70} r={r} fill={color} />
      <circle cx={15 - r*0.3} cy={-h*0.70 - r*0.22} r={r*0.28} fill="white" opacity="0.28" />
      {large && (
        <>
          <line x1="0" y1={-h*0.70} x2={-11} y2={-h*0.83} stroke={color} strokeWidth="2.4" strokeLinecap="round" />
          <circle cx={-11} cy={-h*0.83} r={r*0.72} fill={color} />
          <line x1="0" y1={-h*0.64} x2={11}  y2={-h*0.78} stroke={color} strokeWidth="2.4" strokeLinecap="round" />
          <circle cx={11} cy={-h*0.78} r={r*0.72} fill={color} />
        </>
      )}
      <circle cx="0" cy={-h} r={r} fill={color} />
      <circle cx={-r*0.3} cy={-h - r*0.25} r={r*0.3} fill="white" opacity="0.3" />
    </svg>
  )
}

function SvgFish({ rtl = false, color = '#3282b8' }: { rtl?: boolean; color?: string }) {
  return (
    <svg width="38" height="26" viewBox="-19 -13 38 26" overflow="visible">
      <g transform={rtl ? 'scale(-1,1)' : undefined}>
        <ellipse cx="2"  cy="0"  rx="13" ry="6.5" fill={color} opacity="0.9" />
        <polygon points="-11,0 -20,-8 -20,8" fill={color} opacity="0.75" />
        <ellipse cx="6"  cy="-2" rx="3.5" ry="3.5" fill="white" />
        <circle  cx="7"  cy="-2" r="1.5" fill="#0a1820" />
        <line x1="-1" y1="-6.5" x2="1" y2="-12" stroke={color} strokeWidth="1.8" strokeLinecap="round" opacity="0.65" />
      </g>
    </svg>
  )
}

function SvgCrab() {
  return (
    <svg width="42" height="24" viewBox="-21 -14 42 24" overflow="visible">
      <ellipse cx="0" cy="10" rx="14" ry="4" fill="rgba(0,0,0,0.2)" />
      <line x1="-8" y1="0"  x2="-14" y2="-8" stroke="#c0392b" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="-14" y1="-8" x2="-11" y2="-1" stroke="#c0392b" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="-8" y1="3"  x2="-15" y2="-1" stroke="#c0392b" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="8"  y1="0"  x2="14"  y2="-8" stroke="#c0392b" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="14" y1="-8" x2="11"  y2="-1" stroke="#c0392b" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="8"  y1="3"  x2="15"  y2="-1" stroke="#c0392b" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="-19" cy="-4" r="4" fill="#e74c3c" />
      <circle cx="19"  cy="-4" r="4" fill="#e74c3c" />
      <ellipse cx="0" cy="0" rx="9" ry="6.5" fill="#e74c3c" />
      <ellipse cx="0" cy="-1" rx="6" ry="4.5" fill="#c0392b" opacity="0.4" />
      <circle cx="-3.5" cy="-4" r="1.8" fill="#0a1820" />
      <circle cx="3.5"  cy="-4" r="1.8" fill="#0a1820" />
    </svg>
  )
}

function SvgTurtle() {
  return (
    <svg width="42" height="30" viewBox="-21 -15 42 30" overflow="visible"
      style={{ animation: 'sf-bob 3.2s ease-in-out infinite' }}>
      <ellipse cx="0" cy="0" rx="14" ry="10" fill="#2e7d32" />
      <ellipse cx="0" cy="-1" rx="10" ry="7" fill="#388e3c" />
      <path d="M0 -7 L-6 0 L0 7 L6 0 Z" fill="none" stroke="#1b5e20" strokeWidth="1" opacity="0.55" />
      <line x1="-10" y1="0" x2="10" y2="0" stroke="#1b5e20" strokeWidth="1" opacity="0.4" />
      <ellipse cx="14" cy="-2" rx="6" ry="5" fill="#558b2f" />
      <circle  cx="16" cy="-3.5" r="1.5" fill="#0a1820" />
      <ellipse cx="-10" cy="-10" rx="6" ry="3" fill="#558b2f" transform="rotate(-30 -10 -10)" />
      <ellipse cx="5"   cy="-12" rx="6" ry="3" fill="#558b2f" transform="rotate(15 5 -12)"   />
      <ellipse cx="-10" cy="10"  rx="6" ry="3" fill="#558b2f" transform="rotate(30 -10 10)"  />
      <ellipse cx="5"   cy="12"  rx="6" ry="3" fill="#558b2f" transform="rotate(-15 5 12)"   />
    </svg>
  )
}

function SvgOctopus() {
  return (
    <svg width="46" height="42" viewBox="-23 -20 46 42" overflow="visible"
      style={{ animation: 'sf-bob 3.8s ease-in-out 0.5s infinite' }}>
      {([-16, -8, 0, 8, 16] as number[]).map((x, i) => (
        <path key={i}
          d={`M ${x*0.6} 8 C ${x} 16 ${x + 4*(i%2===0?1:-1)} 22 ${x + 2*(i%2===0?1:-1)} 28`}
          fill="none" stroke="#7b1fa2" strokeWidth="3" strokeLinecap="round" />
      ))}
      <ellipse cx="0" cy="0"  rx="16" ry="14" fill="#9c27b0" />
      <ellipse cx="0" cy="-4" rx="11" ry="9"  fill="#ab47bc" />
      <circle cx="-6" cy="-3" r="4"   fill="white" />
      <circle cx="6"  cy="-3" r="4"   fill="white" />
      <circle cx="-5" cy="-3" r="2.2" fill="#1a0030" />
      <circle cx="7"  cy="-3" r="2.2" fill="#1a0030" />
      <circle cx="-4" cy="-4" r="0.8" fill="white" opacity="0.7" />
      <circle cx="8"  cy="-4" r="0.8" fill="white" opacity="0.7" />
    </svg>
  )
}

function SvgDolphin() {
  return (
    <svg width="58" height="34" viewBox="-29 -17 58 34" overflow="visible"
      style={{ animation: 'sf-bob 2.8s ease-in-out infinite' }}>
      <path d="M-26 0 C-20 -12 10 -14 22 0 C10 14 -20 12 -26 0 Z" fill="#4a90d9" />
      <path d="M-26 0 C-20 -8 10 -9 20 -2" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="2" />
      <path d="M0 -12 C 2 -22 10 -20 8 -12" fill="#3a7abf" />
      <path d="M-26 0 L-36 -9 M-26 0 L-36 9" stroke="#3a7abf" strokeWidth="5" strokeLinecap="round" />
      <path d="M22 0 L32 -3" stroke="#4a90d9" strokeWidth="4" strokeLinecap="round" />
      <circle cx="14" cy="-4" r="3"   fill="white" />
      <circle cx="15" cy="-4" r="1.6" fill="#0a1820" />
    </svg>
  )
}

function SvgWhale() {
  return (
    <svg width="72" height="38" viewBox="-36 -19 72 38" overflow="visible"
      style={{ animation: 'sf-bob 4.2s ease-in-out infinite' }}>
      <path d="M-30 0 C-20 -15 18 -16 28 0 C18 16 -20 15 -30 0 Z" fill="#1565c0" />
      <path d="M-30 0 C-22 -10 16 -11 26 -2" fill="none" stroke="rgba(255,255,255,0.13)" strokeWidth="2.5" />
      <ellipse cx="5" cy="6" rx="16" ry="8" fill="#1976d2" opacity="0.45" />
      <path d="M4 -14 C 6 -26 16 -22 12 -14" fill="#0d47a1" />
      <path d="M-30 0 L-44 -12 M-30 0 L-44 12" stroke="#0d47a1" strokeWidth="6" strokeLinecap="round" />
      <path d="M8 4 L16 18" stroke="#0d47a1" strokeWidth="5" strokeLinecap="round" />
      <circle cx="20" cy="-4" r="3.5" fill="white" />
      <circle cx="21" cy="-4" r="2"   fill="#0a1820" />
      <ellipse cx="10" cy="-15" rx="3" ry="1.5" fill="#0d47a1" />
    </svg>
  )
}

function getSeaObjectSvg(id: string) {
  if (id.startsWith('shell'))   return <SvgShell />
  if (id === 'seaweed1')        return <SvgSeaweed tall />
  if (id.startsWith('seaweed')) return <SvgSeaweed />
  if (id === 'coral1')          return <SvgCoral color="#e05060" />
  if (id === 'coral2')          return <SvgCoral color="#c040a8" />
  if (id === 'coral3')          return <SvgCoral color="#e04848" large />
  if (id === 'crab')            return <SvgCrab />
  if (id === 'turtle')          return <SvgTurtle />
  if (id === 'octopus')         return <SvgOctopus />
  if (id === 'dolphin')         return <SvgDolphin />
  if (id === 'whale')           return <SvgWhale />
  return null
}

const FISH_OBJECTS = new Set(['fish1', 'fish2'])

export default function SeaFloor({ progressScore, healthScore }: SeaFloorProps) {
  const uid = useId().replace(/:/g, '')
  const objects = getUnlockedObjects(progressScore, healthScore)
  const label = getProgressLabel(progressScore)
  const isHealthy = healthScore >= 70

  const sandColor   = isHealthy ? '#92400e' : '#44403c'
  const sandColorDk = isHealthy ? '#6b2d0a' : '#292524'

  const staticObjects = objects.filter(o => !FISH_OBJECTS.has(o.id))
  const fishObjects   = objects.filter(o => FISH_OBJECTS.has(o.id))

  return (
    <div className="relative w-full rounded-xl overflow-hidden" style={{ height: '240px' }}>

      {/* Water */}
      <div
        className="absolute inset-0 transition-all duration-1000"
        style={{
          background: isHealthy
            ? 'linear-gradient(180deg, #082840 0%, #0c4a7a 35%, #0d5a8a 65%, #083550 100%)'
            : 'linear-gradient(180deg, #18110e 0%, #241a14 50%, #18110e 100%)',
        }}
      />

      {/* Top glow */}
      {isHealthy && (
        <div
          className="absolute inset-x-0 top-0 pointer-events-none"
          style={{ height: '60%', background: 'radial-gradient(ellipse 70% 40% at 50% 0%, rgba(187,225,250,0.10) 0%, transparent 100%)' }}
        />
      )}

      {/* Light shafts */}
      {isHealthy && (
        <>
          <div className="absolute top-0 pointer-events-none" style={{ left: '12%', width: 36, height: '100%', background: 'linear-gradient(180deg, rgba(187,225,250,0.07) 0%, transparent 80%)', transform: 'rotate(5deg)',  transformOrigin: 'top center', animation: 'sf-ray 7s ease-in-out infinite' }} />
          <div className="absolute top-0 pointer-events-none" style={{ left: '34%', width: 24, height: '100%', background: 'linear-gradient(180deg, rgba(187,225,250,0.05) 0%, transparent 70%)', transform: 'rotate(-3deg)', transformOrigin: 'top center', animation: 'sf-ray 9s ease-in-out 2s infinite' }} />
          <div className="absolute top-0 pointer-events-none" style={{ left: '55%', width: 44, height: '100%', background: 'linear-gradient(180deg, rgba(187,225,250,0.06) 0%, transparent 75%)', transform: 'rotate(7deg)',  transformOrigin: 'top center', animation: 'sf-ray 11s ease-in-out 4.5s infinite' }} />
          <div className="absolute top-0 pointer-events-none" style={{ left: '72%', width: 28, height: '100%', background: 'linear-gradient(180deg, rgba(187,225,250,0.05) 0%, transparent 65%)', transform: 'rotate(-6deg)', transformOrigin: 'top center', animation: 'sf-ray 8s ease-in-out 1.5s infinite' }} />
          <div className="absolute top-0 pointer-events-none" style={{ left: '86%', width: 32, height: '100%', background: 'linear-gradient(180deg, rgba(187,225,250,0.06) 0%, transparent 72%)', transform: 'rotate(4deg)',  transformOrigin: 'top center', animation: 'sf-ray 13s ease-in-out 6s infinite' }} />
        </>
      )}

      {/* Water ripple lines */}
      <svg className="absolute inset-0 w-full pointer-events-none" style={{ height: '78%', opacity: 0.03 }}>
        <defs>
          <pattern id={`${uid}-rpl`} x="0" y="0" width="90" height="22" patternUnits="userSpaceOnUse">
            <path d="M0 11 Q 22.5 7 45 11 Q 67.5 15 90 11" fill="none" stroke="rgba(187,225,250,1)" strokeWidth="1.2" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${uid}-rpl)`} />
      </svg>

      {/* Sand base */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{ height: '22%', background: `linear-gradient(180deg, ${sandColor}, ${sandColorDk})` }}
      />

      {/* Sand grain texture */}
      <svg className="absolute bottom-0 left-0 w-full pointer-events-none" style={{ height: '22%' }} preserveAspectRatio="none">
        <defs>
          <filter id={`${uid}-grain`} x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.85 0.6" numOctaves="4" seed="5" stitchTiles="stitch" result="noise" />
            <feColorMatrix type="saturate" values="0" in="noise" result="gray" />
            <feBlend in="SourceGraphic" in2="gray" mode="overlay" />
          </filter>
        </defs>
        <rect width="100%" height="100%" fill={sandColor} filter={`url(#${uid}-grain)`} opacity="0.35" />
      </svg>

      {/* Wavy sand edge */}
      <svg
        className="absolute pointer-events-none"
        style={{ bottom: 'calc(22% - 1px)', left: 0, width: '100%', height: 14 }}
        viewBox="0 0 200 14"
        preserveAspectRatio="none"
      >
        <path d="M0 7 Q 12.5 1 25 7 Q 37.5 13 50 7 Q 62.5 1 75 7 Q 87.5 13 100 7 Q 112.5 1 125 7 Q 137.5 13 150 7 Q 162.5 1 175 7 Q 187.5 13 200 7 L200 14 L0 14 Z" fill={sandColor} />
      </svg>

      {/* Bubbles */}
      {isHealthy && progressScore > 3 && BUBBLES.map((b, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: b.left, bottom: '24%',
            width: b.size, height: b.size,
            background: 'rgba(187,225,250,0.55)',
            animationName: 'sf-rise',
            animationDuration: `${3.5 + i * 0.6}s`,
            animationDelay: b.delay,
            animationTimingFunction: 'ease-in',
            animationIterationCount: 'infinite',
          }}
        />
      ))}

      {/* Static sea objects */}
      {objects.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ paddingBottom: '22%' }}>
          <p className="text-sm" style={{ color: 'rgba(187,225,250,0.35)' }}>Complete tasks to grow your reef</p>
        </div>
      )}

      {staticObjects.map((obj) => (
        <div
          key={obj.id}
          className="absolute select-none transition-all duration-500"
          style={{ bottom: obj.style.bottom, left: obj.style.left, opacity: healthScore < 50 ? 0.4 : 1 }}
          title={obj.label}
        >
          {getSeaObjectSvg(obj.id)}
        </div>
      ))}

      {/* Swimming fish */}
      {fishObjects.map((obj) => {
        const rtl = obj.id === 'fish2'
        return (
          <div
            key={obj.id}
            className="absolute pointer-events-none"
            style={{
              bottom: obj.style.bottom,
              left: 0,
              opacity: healthScore < 50 ? 0.4 : 1,
              animationName: rtl ? 'sf-swim-rtl' : 'sf-swim-ltr',
              animationDuration: obj.id === 'fish1' ? '14s' : '11s',
              animationDelay: obj.id === 'fish1' ? '-3s' : '-7s',
              animationTimingFunction: 'linear',
              animationIterationCount: 'infinite',
            }}
          >
            <SvgFish rtl={rtl} color={rtl ? '#bbe1fa' : '#3282b8'} />
          </div>
        )
      })}

      {/* Status badges */}
      <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between">
        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(4,18,30,0.55)', color: 'rgba(187,225,250,0.75)', backdropFilter: 'blur(4px)' }}>
          {label}
        </span>
        <span
          className="text-xs px-2 py-0.5 rounded-full"
          style={{
            backdropFilter: 'blur(4px)',
            background: healthScore >= 70 ? 'rgba(6,40,20,0.6)' : healthScore >= 40 ? 'rgba(40,28,4,0.6)' : 'rgba(40,6,6,0.6)',
            color:      healthScore >= 70 ? '#6ee7b7'           : healthScore >= 40 ? '#fcd34d'            : '#fca5a5',
          }}
        >
          Health {healthScore}%
        </span>
      </div>

      <style>{`
        @keyframes sf-ray {
          0%, 100% { opacity: 0;   }
          50%      { opacity: 1;   }
        }
        @keyframes sf-rise {
          0%   { transform: translateY(0);      opacity: 0.7; }
          100% { transform: translateY(-180px); opacity: 0;   }
        }
        @keyframes sf-sway {
          0%, 100% { transform: rotate(-4deg); }
          50%      { transform: rotate(4deg);  }
        }
        @keyframes sf-bob {
          0%, 100% { transform: translateY(0);    }
          50%      { transform: translateY(-4px); }
        }
        @keyframes sf-swim-ltr {
          from { transform: translateX(-80px);  }
          to   { transform: translateX(calc(100vw + 80px)); }
        }
        @keyframes sf-swim-rtl {
          from { transform: translateX(calc(100vw + 80px)); }
          to   { transform: translateX(-80px);  }
        }
      `}</style>
    </div>
  )
}
