export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ocean-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-ocean-200">🌊 Dive</h1>
          <p className="text-ocean-500 text-sm mt-2">Your ocean grows as your team does.</p>
        </div>
        {children}
      </div>
    </div>
  )
}
