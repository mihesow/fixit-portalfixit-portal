import { useState } from 'react'
import { Lock } from 'lucide-react'
import { supabase } from '../lib/supabase'
import LOGO_B64 from '../lib/logo'

export default function AgentLogin({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setLoading(true)
    setError('')
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    setLoading(false)
    if (authError) {
      setError('Incorrect email or password.')
      return
    }
    if (data?.session) {
      onLogin()
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--surface2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: '2.5rem 2rem',
        width: '100%',
        maxWidth: 400,
        boxShadow: '0 8px 40px rgba(15,22,41,0.12)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img src={LOGO_B64} alt="Elevation House" style={{ height: 48, objectFit: 'contain' }} />
          <div style={{
            fontSize: 13, color: 'var(--text2)', marginTop: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <Lock size={13} /> Agent Dashboard — Secure Login
          </div>
        </div>

        {error && (
          <div style={{
            background: '#fff0f0', color: '#b91c1c', border: '1px solid #ffc0c0',
            borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: '1rem',
          }}>
            {error}
          </div>
        )}

        <div>
          <label>Email</label>
          <input
            type="email"
            placeholder="you@elevationhouse.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            autoFocus
          />
        </div>

        <div style={{ marginTop: 14 }}>
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
        </div>

        <button
          className="btn btn-primary"
          onClick={handleLogin}
          disabled={loading}
          style={{ width: '100%', marginTop: '1.5rem', justifyContent: 'center', padding: '11px' }}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </div>
    </div>
  )
}
