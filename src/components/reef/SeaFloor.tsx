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

export default function SeaFloor({ progressScore, healthScore }: SeaFloorProps) {
  const uid = useId().replace(/:/g, '')
  const objects = getUnlockedObjects(progressScore, healthScore)
  const label = getProgressLabel(progressScore)
  const isHealthy = healthScore >= 70

  const sandColor   = isHealthy ? '#92400e' : '#44403c'
  const sandColorDk = isHealthy ? '#6b2d0a' : '#292524'

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

      {/* Top glow — simulates light from above */}
      {isHealthy && (
        <div
          className="absolute inset-x-0 top-0 pointer-events-none"
          style={{
            height: '60%',
            background: 'radial-gradient(ellipse 70% 40% at 50% 0%, rgba(187,225,250,0.10) 0%, transparent 100%)',
          }}
        />
      )}

      {/* Light shafts */}
      {isHealthy && (
        <>
          <div className="absolute top-0 pointer-events-none" style={{ left: '18%',  width: 40, height: '100%', background: 'linear-gradient(180deg, rgba(187,225,250,0.045) 0%, transparent 80%)', transform: 'rotate(6deg)', transformOrigin: 'top center' }} />
          <div className="absolute top-0 pointer-events-none" style={{ left: '50%',  width: 30, height: '100%', background: 'linear-gradient(180deg, rgba(187,225,250,0.035) 0%, transparent 70%)', transform: 'rotate(-4deg)', transformOrigin: 'top center' }} />
          <div className="absolute top-0 pointer-events-none" style={{ left: '74%',  width: 36, height: '100%', background: 'linear-gradient(180deg, rgba(187,225,250,0.040) 0%, transparent 75%)', transform: 'rotate(8deg)', transformOrigin: 'top center' }} />
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

      {/* Sand grain texture overlay */}
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
        <path
          d="M0 7 Q 12.5 1 25 7 Q 37.5 13 50 7 Q 62.5 1 75 7 Q 87.5 13 100 7 Q 112.5 1 125 7 Q 137.5 13 150 7 Q 162.5 1 175 7 Q 187.5 13 200 7 L200 14 L0 14 Z"
          fill={sandColor}
        />
      </svg>

      {/* Bubbles */}
      {isHealthy && progressScore > 3 && BUBBLES.map((b, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: b.left,
            bottom: '24%',
            width: b.size,
            height: b.size,
            background: 'rgba(187,225,250,0.55)',
            animationName: 'sf-rise',
            animationDuration: `${3.5 + i * 0.6}s`,
            animationDelay: b.delay,
            animationTimingFunction: 'ease-in',
            animationIterationCount: 'infinite',
          }}
        />
      ))}

      {/* Empty state */}
      {objects.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ paddingBottom: '22%' }}>
          <p className="text-sm" style={{ color: 'rgba(187,225,250,0.35)' }}>Complete tasks to grow your reef</p>
        </div>
      )}

      {/* Sea objects */}
      {objects.map((obj) => (
        <div
          key={obj.id}
          className="absolute select-none transition-all duration-500"
          style={{ ...obj.style, opacity: healthScore < 50 ? 0.4 : 1 }}
          title={obj.label}
        >
          {obj.emoji}
        </div>
      ))}

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
            color:      healthScore >= 70 ? '#6ee7b7'           : healthScore >= 40 ? '#fcd34d'          : '#fca5a5',
          }}
        >
          Health {healthScore}%
        </span>
      </div>

      <style>{`
        @keyframes sf-rise {
          0%   { transform: translateY(0);       opacity: 0.7; }
          100% { transform: translateY(-180px);  opacity: 0;   }
        }
      `}</style>
    </div>
  )
}
