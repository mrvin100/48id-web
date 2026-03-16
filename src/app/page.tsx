import { redirect } from 'next/navigation'

export default function Home() {
  // Redirect to dashboard for now - authentication will be implemented in Sprint 1
  redirect('/dashboard')
}
