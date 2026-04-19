import { redirect } from 'next/navigation'

// Sign-up and sign-in are unified — Supabase creates accounts automatically on first magic link / OAuth
export default function SignUpPage() {
  redirect('/sign-in')
}
