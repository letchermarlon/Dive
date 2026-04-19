import { redirect } from 'next/navigation'

// OAuth callback is now handled by /auth/callback/route.ts
export default function SSOCallbackPage() {
  redirect('/dashboard')
}
