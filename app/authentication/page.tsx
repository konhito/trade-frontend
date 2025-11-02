import { redirect } from 'next/navigation'

export default function AuthenticationRedirect() {
  redirect('/authentication')
}

