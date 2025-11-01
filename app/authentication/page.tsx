import { redirect } from 'next/navigation'

// Redirect /authentication to /en/authentication (default locale)
export default function AuthenticationRedirect() {
  redirect('/en/authentication')
}

