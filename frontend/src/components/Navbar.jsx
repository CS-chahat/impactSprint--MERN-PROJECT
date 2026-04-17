import { useState, useEffect } from 'react'
import { useAuth } from '../AuthContext'
import { inputStyle } from './UI'
import ProfileModal from './ProfileModal'

const s = {
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
    borderBottom: '1px solid rgba(255,255,255,0.6)', padding: '0 2rem',
    height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  brand: {
    fontFamily: "'Clash Display', sans-serif", fontSize: 20, fontWeight: 700,
    color: 'var(--moss)', letterSpacing: '-0.5px', display: 'flex',
    alignItems: 'center', gap: 8, cursor: 'pointer', border: 'none', background: 'none',
  },
  links: { display: 'flex', alignItems: 'center', gap: 6, position: 'absolute', left: '50%', transform: 'translateX(-50%)' },
  right:  { display: 'flex', alignItems: 'center', gap: 8 },
}

const navLinkStyle = `
  .nav-link {
    position: relative;
    font-size: 13.5px;
    font-weight: 500;
    padding: 6px 12px;
    border-radius: 20px;
    cursor: pointer;
    border: none;
    background: transparent;
    font-family: 'DM Sans', sans-serif;
    color: var(--stone);
    transition: all 0.2s;
  }
  .nav-link.active {
    color: var(--moss);
  }
  .nav-link::after {
    content: '';
    position: absolute;
    bottom: 0px; left: 12px; right: 12px;
    height: 2px;
    background: var(--sage);
    transform: scaleX(0);
    transform-origin: right;
    transition: transform 0.3s ease;
  }
  .nav-link:hover::after, .nav-link.active::after {
    transform: scaleX(1);
    transform-origin: left;
  }
  .modal-spring {
    animation: springPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }
`

const btnStyle = (filled) => ({
  fontSize: 13, fontWeight: 500, padding: '7px 16px', borderRadius: 20,
  cursor: 'pointer', border: '1.5px solid var(--sage)', transition: 'all 0.2s',
  background: filled ? 'var(--sage)' : 'transparent',
  color: filled ? 'white' : 'var(--sage)',
})

const links = [
  { label: 'Home',          page: 'landing' },
  { label: 'About',         page: 'landing', scroll: 'about' },
]

// ── Login Modal (inline, minimal — preserves Navbar aesthetics) ──
function LoginModal({ onClose, navigate }) {
  const { login, register } = useAuth()
  const [mode, setMode] = useState('login') // login | registerNGO | registerPro
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [org, setOrg] = useState('')
  const [profession, setProfession] = useState('')
  const [skills, setSkills] = useState('')
  const [verificationUrl, setVerificationUrl] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const user = await login(email, password)
      onClose()
      
      const role = user.userRole || user.role;
      if (role === 'Admin' || role === 'Orchestrator') {
        navigate('admin')
      } else if (role === 'NGO') {
        navigate('ngo')
      } else if (role === 'Professional') {
        navigate('pro')
      } else {
        navigate('pro') // fallback
      }
    } catch (err) {
      console.error('Login Error:', err);
      setError(err.message || 'Server Error');
    }
    setLoading(false)
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) return setError('Full Name is required.')
    if (!email.trim()) return setError('Email is required.')
    if (!password.trim()) return setError('Password is required.')
    if (password.length < 6) return setError('Password must be at least 6 characters.')
    if (mode === 'registerNGO' && !org.trim()) return setError('Organization Name is required.')
    setLoading(true)
    try {
      const body = { name: name.trim(), email: email.trim(), password }
      if (mode === 'registerNGO') {
        body.role = 'NGO'
        body.organization = org.trim()
      } else {
        body.role = 'Professional'
        body.profession = profession.trim()
        body.skills = skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : []
        body.verification_url = verificationUrl.trim()
        body.github_url = githubUrl.trim()
      }
      const user = await register(body)
      onClose()
      if (user.role === 'NGO') navigate('ngo')
      else navigate('pro')
    } catch (err) { setError(err.message) }
    setLoading(false)
  }

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(44,42,39,0.5)',
      zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div onClick={e => e.stopPropagation()} className="modal-spring" style={{
        background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
        borderRadius: 20, padding: 36, maxWidth: 400, width: '90%',
      }}>
        <div style={{ fontFamily: "'Clash Display',sans-serif", fontSize: 22, fontWeight: 700, color: 'var(--ink)', marginBottom: 6, textAlign: 'center' }}>
          {mode === 'login' ? '🌿 Welcome Back' : mode === 'registerNGO' ? '🏢 Register as NGO' : '👤 Register as Professional'}
        </div>
        <div style={{ fontSize: 13, color: 'var(--stone)', textAlign: 'center', marginBottom: 20 }}>
          {mode === 'login' ? 'Login to ImpactSprint' : 'Join the ImpactSprint community'}
        </div>
        {error && <div style={{ background: '#fef2f2', color: '#c0392b', fontSize: 12, padding: '8px 12px', borderRadius: 8, marginBottom: 12 }}>{error}</div>}

        <form onSubmit={mode === 'login' ? handleLogin : handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {mode !== 'login' && (
            <input placeholder="Full Name (e.g. Chahat Shishodia)" value={name} onChange={e => setName(e.target.value)} required style={inputStyle} />
          )}
          {mode === 'registerNGO' && (
            <input placeholder="Organisation Name *" value={org} onChange={e => setOrg(e.target.value)} required style={inputStyle} />
          )}
          {mode === 'registerPro' && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 13, color: 'var(--stone)', marginLeft: 4 }}>Profession</label>
                <input placeholder="e.g. Full Stack Developer" value={profession} onChange={e => setProfession(e.target.value)} style={inputStyle} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 13, color: 'var(--stone)', marginLeft: 4 }}>Skills</label>
                <input placeholder="e.g. Python, React, GIS…" value={skills} onChange={e => setSkills(e.target.value)} style={inputStyle} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 13, color: 'var(--stone)', marginLeft: 4 }}>Verification URL</label>
                <input placeholder="e.g. linkedin.com/in/yourhandle" value={verificationUrl} onChange={e => setVerificationUrl(e.target.value)} style={inputStyle} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 13, color: 'var(--stone)', marginLeft: 4 }}>GitHub Profile URL</label>
                <input placeholder="e.g. github.com/yourusername" value={githubUrl} onChange={e => setGithubUrl(e.target.value)} style={inputStyle} />
              </div>
            </>
          )}
          <input type="email" placeholder="Email (e.g. abc2@gmail.com)" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} />
          <button type="submit" disabled={loading} style={{
            background: loading ? '#a3b89e' : mode === 'login' ? 'var(--sage)' : '#4A7C59',
            color: 'white', border: 'none', padding: '11px',
            borderRadius: 24, fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4,
            transition: 'all 0.2s', fontFamily: "'DM Sans',sans-serif",
          }}>{loading ? 'Please wait...' : mode === 'login' ? 'Login →' : 'Create Account →'}</button>
        </form>

        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 6, textAlign: 'center' }}>
          {mode === 'login' ? (
            <>
              <button onClick={() => setMode('registerNGO')} style={{ background: 'none', border: 'none', color: 'var(--sage)', fontSize: 13, cursor: 'pointer' }}>Register as NGO →</button>
              <button onClick={() => setMode('registerPro')} style={{ background: 'none', border: 'none', color: 'var(--sage)', fontSize: 13, cursor: 'pointer' }}>Register as Professional →</button>
            </>
          ) : (
            <button onClick={() => setMode('login')} style={{ background: 'none', border: 'none', color: 'var(--sage)', fontSize: 13, cursor: 'pointer' }}>Already have an account? Login →</button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Navbar({ page, navigate }) {
  const { user, logout, setUser } = useAuth()
  const [showLogin, setShowLogin] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  // Listen for login-open events fired from SmartEntryCard on LandingPage
  useEffect(() => {
    const handler = () => setShowLogin(true)
    window.addEventListener('impactsprint:openLogin', handler)
    return () => window.removeEventListener('impactsprint:openLogin', handler)
  }, [])

  const handleLink = (item) => {
    navigate(item.page)
    if (item.scroll) {
      setTimeout(() => {
        const el = document.getElementById(item.scroll)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 150)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('landing')
  }

  const initials = user ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : ''

  return (
    <>
      <style>{navLinkStyle}</style>
      <nav style={s.nav}>
        <button style={s.brand} onClick={() => navigate('landing')}>
          🌿 Impact<span style={{ color: 'var(--sage-light)' }}>Sprint</span>
        </button>
        <div style={s.links}>
          {links.map(l => (
            <button key={l.label} className={`nav-link ${page === l.page && !l.scroll ? 'active' : ''}`}
              onClick={() => handleLink(l)}>{l.label}</button>
          ))}
        </div>
        <div style={s.right}>
          {user ? (
            <>
              <div
                onClick={() => setShowProfile(true)} 
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  cursor: 'pointer', padding: '4px 8px', borderRadius: 8,
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--linen)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', background: 'var(--mint)',
                  color: 'var(--moss)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 600, overflow: 'hidden'
                }}>
                  {user.avatar ? <img src={user.avatar} style={{width:'100%',height:'100%',objectFit:'cover'}} alt="Avatar" /> : initials}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', lineHeight: 1 }}>{user.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--stone)' }}>{user.role}</div>
                </div>
              </div>
              <button style={btnStyle(false)} onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <button style={btnStyle(false)} onClick={() => setShowLogin(true)}>Login</button>
              <button style={btnStyle(true)}  onClick={() => setShowLogin(true)}>Sign Up</button>
            </>
          )}
        </div>
      </nav>
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} navigate={navigate} />}
      {showProfile && user && (
        <ProfileModal 
          user={user} 
          onClose={() => setShowProfile(false)} 
          onUpdate={(updatedUser) => setUser(updatedUser)} 
        />
      )}
    </>
  )
}
