'use client'
import { getUnlockedObjects, getProgressLabel } from '@/lib/progression'

interface SeaFloorProps {
  progressScore: number
  healthScore: number
}

export default function SeaFloor({ progressScore, healthScore }: SeaFloorProps) {
  const objects = getUnlockedObjects(progressScore, healthScore)
  const label = getProgressLabel(progressScore)
  const isHealthy = healthScore >= 70

  return (
    <div className="relative w-full rounded-xl overflow-hidden" style={{ height: '280px' }}>
      {/* Water gradient */}
      <div
        className="absolute inset-0 transition-all duration-1000"
        style={{
          background: isHealthy
            ? 'linear-gradient(to bottom, #0c4a6e 0%, #075985 40%, #0369a1 70%, #082f49 100%)'
            : 'linear-gradient(to bottom, #1c1917 0%, #292524 40%, #1c1917 100%)',
        }}
      />

      {/* Sand floor */}
      <div
        className="absolute bottom-0 left-0 right-0 rounded-b-xl"
        style={{
          height: '22%',
          background: isHealthy
            ? 'linear-gradient(to bottom, #92400e, #78350f)'
            : 'linear-gradient(to bottom, #44403c, #292524)',
        }}
      />

      {/* Bubbles when healthy */}
      {isHealthy && progressScore > 3 && (
        <>
          <div className="bubble absolute" style={{ left: '10%', animationDelay: '0s' }}>·</div>
          <div className="bubble absolute" style={{ left: '40%', animationDelay: '1.5s' }}>·</div>
          <div className="bubble absolute" style={{ left: '75%', animationDelay: '3s' }}>·</div>
        </>
      )}

      {/* Sea objects */}
      {objects.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-ocean-600 text-sm">Complete tasks to grow your reef</p>
        </div>
      )}

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

      {/* Status overlay */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
        <span className="text-xs text-ocean-300 bg-ocean-950/60 px-2 py-1 rounded-full">
          {label}
        </span>
        <span className={`text-xs px-2 py-1 rounded-full ${healthScore >= 70 ? 'text-emerald-300 bg-emerald-950/60' : healthScore >= 40 ? 'text-yellow-300 bg-yellow-950/60' : 'text-red-300 bg-red-950/60'}`}>
          Health {healthScore}%
        </span>
      </div>

      <style jsx>{`
        .bubble {
          color: rgba(186, 230, 253, 0.4);
          font-size: 0.5rem;
          animation: rise 4s ease-in infinite;
          bottom: 20%;
        }
        @keyframes rise {
          0%   { transform: translateY(0) scale(1); opacity: 0.6; }
          100% { transform: translateY(-200px) scale(1.5); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
