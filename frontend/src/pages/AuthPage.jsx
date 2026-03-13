import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import s from './AuthPage.module.css'

export default function AuthPage() {
  const { login, register } = useAuth()
 const [isLogin, setIsLogin] = useState(!!localStorage.getItem('rv_token'))
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      isLogin ? await login(email, password) : await register(email, password)
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    } finally { setLoading(false) }
  }

  return (
    <div className={s.page}>
      <div className={s.orb_a} /><div className={s.orb_b} />
      <div className={s.card}>
        <div className={s.logo}>
          <div className={s.logo_icon}>📚</div>
          <div className={s.logo_text}>Resource<span>Vault</span></div>
        </div>
        <h2 className={s.title}>{isLogin ? 'Welcome back' : 'Create account'}</h2>
        <p className={s.subtitle}>{isLogin ? 'Sign in to your vault' : 'Start saving your resources'}</p>
        <form onSubmit={handleSubmit} className={s.form}>
          <div className={s.field}>
            <label>Email</label>
            <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
          </div>
          <div className={s.field}>
            <label>Password</label>
            <input type="password" placeholder={isLogin ? '••••••••' : 'min. 6 characters'} value={password} onChange={e => setPassword(e.target.value)} required autoComplete={isLogin ? 'current-password' : 'new-password'} />
          </div>
          {error && <div className={s.error}>{error}</div>}
          <button type="submit" className={s.submit} disabled={loading}>
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>
        <div className={s.toggle}>
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button onClick={() => { setIsLogin(!isLogin); setError('') }}>
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  )
}
