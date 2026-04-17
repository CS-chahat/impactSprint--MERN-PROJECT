import { useState } from 'react'
import { useAuth } from '../AuthContext'
import { inputStyle } from '../components/UI'

// ── Dedicated Registration Page ───────────────────────────────────────────────
// role: 'NGO' | 'Professional'
export default function RegisterPage({ navigate, role: initialRole = 'Professional' }) {
  const { register } = useAuth()
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState(false)
  const [error, setError]       = useState('')

  // shared
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')

  // Professional
  const [fullName, setFullName] = useState('')
  const [skillset, setSkillset] = useState('')
  const [profession, setProfession] = useState('')
  const [verifyUrl, setVerifyUrl] = useState('')
  const [githubUrl, setGithubUrl] = useState('')

  // NGO
  const [ngoFullName, setNgoFullName] = useState('')
  const [orgName, setOrgName]   = useState('')
  const [mission, setMission]   = useState('')

  const isNGO = initialRole === 'NGO'

  const inp = {
    ...inputStyle,
    padding: '11px 14px',
    fontSize: 13.5,
    borderRadius: 10,
    background: 'var(--linen)',
    width: '100%',
    boxSizing: 'border-box',
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) return setError('Passwords do not match.')
    if (password.length < 6)  return setError('Password must be at least 6 characters.')
    setLoading(true)
    try {
      if (isNGO) {
        if (!ngoFullName.trim() || !orgName.trim() || !email.trim()) return setError('Full name, organisation name, and email are required.')
        await register({
          name: ngoFullName.trim(),
          email: email.trim(),
          password,
          role: 'NGO',
          organization: orgName.trim(),
          mission: mission.trim(),
        })
        setSuccess(true)
        setTimeout(() => navigate('ngo'), 2600)
      } else {
        if (!fullName.trim() || !email.trim()) return setError('Full name and email are required.')
        await register({
          name: fullName.trim(),
          email: email.trim(),
          password,
          role: 'Professional',
          profession: profession.trim(),
          skills: skillset ? skillset.split(',').map(s => s.trim()).filter(Boolean) : [],
          verification_url: verifyUrl.trim(),
          github_url: githubUrl.trim(),
        })
        navigate('pro')
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: 'calc(100vh - 60px)',
      background: 'linear-gradient(160deg, var(--warm-white) 0%, var(--sage-pale) 50%, var(--mint) 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 1.5rem',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Decorative blob */}
      <div style={{ position: 'absolute', top: -120, right: -120, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(106,171,126,0.13) 0%,transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -80, left: -60, width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle,rgba(224,122,47,0.08) 0%,transparent 70%)', pointerEvents: 'none' }} />

      <div style={{
        background: 'rgba(255,255,255,0.80)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1.5px solid rgba(91,124,97,0.18)',
        borderRadius: 24,
        padding: '44px 48px',
        maxWidth: 520,
        width: '100%',
        boxShadow: '0 12px 60px rgba(91,124,97,0.10)',
        position: 'relative',
      }}>
        {/* Accent top bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: isNGO ? 'var(--amber)' : 'var(--sage)', borderRadius: '24px 24px 0 0' }} />

        {/* Back link */}
        <button
          onClick={() => navigate('landing')}
          style={{ background: 'none', border: 'none', color: 'var(--stone)', fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 5 }}
        >
          ← Back to Home
        </button>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: isNGO ? 'var(--amber-pale)' : 'var(--sage-pale)', borderRadius: 20, padding: '4px 12px', fontSize: 11, fontWeight: 600, color: isNGO ? 'var(--amber)' : 'var(--sage)', marginBottom: 12, letterSpacing: 0.5, textTransform: 'uppercase' }}>
            {isNGO ? '🏢 NGO Registration' : '👤 Professional Registration'}
          </div>
          <h1 style={{ fontFamily: "'Clash Display',sans-serif", fontSize: 26, fontWeight: 700, color: 'var(--ink)', letterSpacing: -0.8, margin: '0 0 6px' }}>
            {isNGO ? 'Register Your Organization' : 'Create Your Professional Account'}
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--stone)', margin: 0, lineHeight: 1.6 }}>
            {isNGO
              ? 'Post impact sprints and get matched with skilled professionals within hours.'
              : 'Offer your expertise to high-impact NGO projects and earn verified certificates.'
            }
          </p>
        </div>

        {/* Success notice */}
        {success && (
          <div style={{ background: 'rgba(91,124,97,0.1)', border: '1px solid rgba(91,124,97,0.3)', borderRadius: 12, padding: '14px 16px', marginBottom: 20, fontSize: 13, color: '#5B7C61', lineHeight: 1.6 }}>
            ✅ <strong>Account created!</strong> Your organization will be verified by the ImpactSprint Admin within 24 hours. Redirecting…
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#c0392b' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* ── NGO Fields ── */}
          {isNGO ? (
            <>
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--stone)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Full Name *</label>
                <input value={ngoFullName} onChange={e => setNgoFullName(e.target.value)} placeholder="e.g. Ananya Kapoor" style={inp} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--stone)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Organization Name *</label>
                <input value={orgName} onChange={e => setOrgName(e.target.value)} placeholder="e.g. EcoWatch Foundation" style={inp} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--stone)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Official Email *</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="contact@ecowatch.org" style={inp} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--stone)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Mission / Focus Area</label>
                <input value={mission} onChange={e => setMission(e.target.value)} placeholder="e.g. Forest conservation in the Amazon" style={inp} />
              </div>
            </>
          ) : (
            /* ── Professional Fields ── */
            <>
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--stone)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Full Name *</label>
                <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="e.g. Priya Sharma" style={inp} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--stone)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Personal Email *</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="priya@gmail.com" style={inp} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--stone)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Profession</label>
                  <input value={profession} onChange={e => setProfession(e.target.value)} placeholder="Full Stack Developer" style={inp} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--stone)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Primary Skills</label>
                  <input value={skillset} onChange={e => setSkillset(e.target.value)} placeholder="Python, React, GIS…" style={inp} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--stone)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>LinkedIn / Portfolio URL</label>
                <input value={verifyUrl} onChange={e => setVerifyUrl(e.target.value)} placeholder="linkedin.com/in/yourhandle" style={inp} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--stone)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>GitHub Profile URL</label>
                <input value={githubUrl} onChange={e => setGithubUrl(e.target.value)} placeholder="github.com/yourusername" style={inp} />
              </div>
            </>
          )}

          {/* Password row — shared */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--stone)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Password *</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" style={inp} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--stone)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Confirm Password *</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat password" style={inp} required />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || success}
            style={{
              marginTop: 8,
              width: '100%', padding: '13px', borderRadius: 24,
              background: loading || success ? '#a3b89e' : '#4A7C59',
              color: 'white', border: 'none', fontWeight: 700, fontSize: 15,
              cursor: loading || success ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s', fontFamily: "'DM Sans',sans-serif",
              letterSpacing: 0.2,
            }}
          >
            {loading ? 'Creating Account…' : isNGO ? '🏢 Register as NGO' : '👤 Create Professional Account'}
          </button>
        </form>

        {/* Divider + social (Pro only) */}
        {!isNGO && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0 14px' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{ fontSize: 12, color: 'var(--stone)' }}>or sign up with</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              {[['🐙', 'GitHub'], ['💼', 'LinkedIn']].map(([icon, name]) => (
                <button
                  key={name}
                  onClick={() => alert(`${name} OAuth coming soon!`)}
                  style={{
                    flex: 1, padding: '10px 12px', borderRadius: 12,
                    background: 'var(--linen)', border: '1.5px solid var(--border)',
                    fontSize: 13, color: 'var(--stone)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                    fontFamily: "'DM Sans',sans-serif", transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--sage-pale)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--linen)'}
                >
                  {icon} {name}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Sign-in hint */}
        <div style={{ textAlign: 'center', marginTop: 22, fontSize: 13, color: 'var(--stone)' }}>
          Already have an account?{' '}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('impactsprint:openLogin'))}
            style={{ background: 'none', border: 'none', color: '#5B7C61', fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: 0 }}
          >
            Sign in →
          </button>
        </div>
      </div>
    </div>
  )
}
