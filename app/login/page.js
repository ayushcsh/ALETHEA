'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) router.replace('/start')
  }, [session, router])

  return (
    <main className="login-page">
      <section className="login-card" aria-label="Sign in to Alethea">
        <aside className="login-showcase">
          <Image
            src="/images/alethea-ai-login-poster.png"
            alt="Alethea AI — Your Intelligent PDF Reader"
            fill
            priority
            sizes="(max-width: 720px) 100vw, 44vw"
            className="login-poster"
          />
        </aside>

        <div className="login-form-panel">
          <div className="login-form">
            <div className="login-mark" aria-hidden="true">*</div>
            <h2>Welcome back</h2>
            <p>Sign in to continue to Alethea</p>
            <div className="login-divider" />
            <button className="oauth-button" onClick={() => signIn('google')}><GoogleIcon />Continue with Google</button>
            <button className="oauth-button github-button" onClick={() => signIn('github')}><GithubIcon />Continue with GitHub</button>
            <p className="login-help">Secure sign-in powered by your selected provider.</p>
          </div>
        </div>
      </section>
    </main>
  )
}

function GoogleIcon() {
  return <svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 3l5.7-5.7C33.9 6 29.2 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.7-.4-4z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C33.9 6 29.2 4 24 4c-7.7 0-14.4 4.4-17.7 10.7z"/><path fill="#4CAF50" d="M24 44c5.1 0 9.8-2 13.3-5.2l-6.2-5.2C29.1 35.1 26.7 36 24 36c-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9.5 39.5 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20H42V20H24v8h11.3c-.8 2.2-2.3 4.1-4.2 5.6l.1-.1 6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.7-.4-4z"/></svg>
}

function GithubIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .7a11.3 11.3 0 0 0-3.6 22c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.4-5.5-6a4.7 4.7 0 0 1 1.2-3.2c-.1-.3-.5-1.6.1-3.2 0 0 1-.3 3.3 1.2a11.4 11.4 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.9.1 3.2a4.7 4.7 0 0 1 1.2 3.2c0 4.7-2.9 5.7-5.6 6 .4.4.8 1.1.8 2.1v3.1c0 .3.2.7.8.6A11.3 11.3 0 0 0 12 .7z" /></svg>
}
