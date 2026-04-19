import { SignIn } from '@clerk/nextjs'
import OceanBackground from '@/components/OceanBackground'

export default function SignInPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <OceanBackground />
      <div className="relative z-10">
        <SignIn
          appearance={{
            elements: {
              card: 'bg-black/80 backdrop-blur-md border border-white/10 shadow-2xl',
              headerTitle: 'text-white',
              headerSubtitle: 'text-white/60',
              socialButtonsBlockButton: 'bg-white/5 border border-white/10 text-white hover:bg-white/10',
              socialButtonsBlockButtonText: 'text-white',
              dividerLine: 'bg-white/10',
              dividerText: 'text-white/40',
              formFieldLabel: 'text-white/70',
              formFieldInput: 'bg-white/5 border-white/10 text-white placeholder:text-white/30',
              formButtonPrimary: 'bg-cyan-500 hover:bg-cyan-400 text-black font-medium',
              footerActionLink: 'text-cyan-400 hover:text-cyan-300',
              footerActionText: 'text-white/40',
              identityPreviewText: 'text-white',
              identityPreviewEditButton: 'text-cyan-400',
            },
          }}
        />
      </div>
    </div>
  )
}
