import OceanBackground from '@/components/OceanBackground'
import SignInForm from './SignInForm'

export default function SignInPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <OceanBackground />
      <div className="relative z-10 w-full max-w-sm px-4">
        <SignInForm />
      </div>
    </div>
  )
}
