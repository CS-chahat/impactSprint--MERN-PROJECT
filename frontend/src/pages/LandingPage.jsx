import { useState, useEffect } from 'react'
import { useAuth } from '../AuthContext'
import { useGlobalModal } from '../GlobalModalContext'
import { BtnPrimary, BtnSecondary, SectionHeader } from '../components/UI'

// ── Hooks ───────────────────────────────────────────────────────────────────
function useCounter(target, duration = 2000) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let startTimestamp = null
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / duration, 1)
      setCount(Math.floor(progress * target))
      if (progress < 1) window.requestAnimationFrame(step)
    }
    window.requestAnimationFrame(step)
  }, [target, duration])
  return count
}

// ── Stat Pill ─────────────────────────────────────────────────────────────────
function StatPill({ n, l, color = 'var(--sage)' }) {
  const target = parseInt(String(n).replace(/,/g, '')) || 0
  const isK = String(n).includes('k')
  const count = useCounter(target, 2000)
  const display = count === target ? n : isK ? count + 'k' : count.toLocaleString()
  return (
    <div style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.6)', padding: '8px 14px', borderRadius: 'var(--radius-sm)', flex: 1, textAlign: 'center' }}>
      <span style={{ fontFamily: "'Clash Display',sans-serif", fontSize: 22, fontWeight: 700, color, display: 'block' }}>{display}</span>
      <span style={{ fontSize: 11, color: 'var(--stone)', display: 'block' }}>{l}</span>
    </div>
  )
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function Hero({ navigate, user, openLogin, showToast }) {
  const handlePostSprint = () => {
    if (!user) return openLogin('NGO')
    if (user.role === 'NGO') return navigate('ngo')
    showToast('Only NGOs can post sprints. Please switch to an NGO account.')
  }

  const handleFindOpps = () => {
    if (!user) return openLogin('Professional')
    if (user.role === 'Professional') return navigate('pro')
    showToast('This section is for Professionals looking for tasks.')
  }
  return (
    <div style={{
      padding: '80px 2rem 60px', position: 'relative', overflow: 'hidden',
    }}>
      {/* Decorative blobs */}
      <div style={{ position: 'absolute', top: -100, right: -100, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(106,171,126,0.15) 0%,transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -80, left: -60, width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle,rgba(224,122,47,0.1) 0%,transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
        {/* Left */}
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(91,124,97,0.1)', color: 'var(--moss)', fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 20, marginBottom: 20, letterSpacing: 0.5, border: '1px solid rgba(91,124,97,0.2)' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--sage)', animation: 'pulse 2s infinite', display: 'inline-block' }} />
            🌱 Impact-Driven Platform
          </div>
          <h1 style={{ fontFamily: "'Clash Display',sans-serif", fontSize: 'clamp(36px,5vw,60px)', fontWeight: 700, lineHeight: 1.08, color: 'var(--ink)', letterSpacing: -1.5, marginBottom: 20 }}>
            Big Impact.<br />
            <span style={{ color: 'var(--sage)' }}>Small Sprints.</span>
          </h1>
          <p style={{ fontSize: 16, color: 'var(--stone)', lineHeight: 1.7, marginBottom: 32, fontWeight: 500 }}>
            NGOs need expert help; Professionals need flexibility. We match elite skills with 2–5 hour micro-tasks for social good.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn-ripple" onClick={handlePostSprint} style={{
              background: 'var(--sage)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
              color: 'white', padding: '12px 24px', borderRadius: 24, fontSize: 14, fontWeight: 700, border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', transition: 'all 0.2s'
            }} onMouseEnter={e => e.currentTarget.style.background = 'var(--moss)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--sage)'}>
              Post a Sprint →
            </button>
            <button className="btn-ripple" onClick={handleFindOpps} style={{
              background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
              color: 'var(--ink)', padding: '12px 24px', borderRadius: 24, fontSize: 14, fontWeight: 600, border: '1px solid rgba(255,255,255,0.8)', cursor: 'pointer', transition: 'all 0.2s'
            }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.7)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.5)'}>
              Find Opportunities
            </button>
          </div>
          
          {/* Feature Highlight */}
          <div className="card-lift" style={{ marginTop: 32, padding: '14px 18px', background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.8)', borderRadius: 'var(--radius-sm)', backdropFilter: 'blur(12px)', display: 'inline-flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(91,124,97,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, animation: 'breathe 3s infinite ease-in-out' }}>✅</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>Verified Impact Portfolio</div>
              <div style={{ fontSize: 12, color: 'var(--stone)', marginTop: 2 }}>Completion leads to a cryptographically signed digital certificate.</div>
            </div>
          </div>
        </div>

        {/* Right — stacked cards */}
        <div style={{ position: 'relative', height: 340 }}>
          {/* Back card */}
          <div className="card-lift" style={{ position: 'absolute', top: 24, left: 16, right: 16, zIndex: 1, opacity: 0.6, transform: 'scale(0.97)', background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderRadius: 'var(--radius)', padding: 18, border: '1px solid rgba(255,255,255,0.5)' }}>
            <div style={{ fontSize: 11, color: 'var(--stone)', marginBottom: 10 }}>🌿 Amazon Canopy AI Model</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>Deforestation Pattern Analysis</div>
          </div>
          {/* Main card */}
          <div className="card-lift" style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 3, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderRadius: 'var(--radius)', padding: 18, border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 12px 40px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--stone)' }}>EcoWatch HQ</div>
                <div style={{ fontFamily: "'Clash Display',sans-serif", fontSize: 17, fontWeight: 700, color: 'var(--ink)' }}>Active Sprints</div>
              </div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, background: 'var(--amber-pale)', color: 'var(--amber)', padding: '3px 9px', borderRadius: 10, fontWeight: 600 }}>⚡ Live</span>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 14 }}>
              <StatPill n="12"  l="Active" color="var(--sage)" />
              <StatPill n="480" l="Professionals" color="var(--amber)" />
              <StatPill n="34"  l="NGOs" color="var(--sky)" />
            </div>
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 11, color: 'var(--stone)', marginBottom: 6 }}>Sprint Completion Rate</div>
              <div style={{ background: 'var(--cream)', borderRadius: 999, height: 8, overflow: 'hidden' }}>
                <div style={{ width: '82%', height: '100%', borderRadius: 999, background: 'linear-gradient(90deg,var(--sage-light),var(--sage))', animation: 'fillBar 2s cubic-bezier(0.34,1.56,0.64,1) forwards' }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--sage)', textAlign: 'right', marginTop: 2 }}>82%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Entry Cards ───────────────────────────────────────────────────────────────
function EntryCard({ icon, title, desc, accent, children, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
      padding: 28, cursor: 'pointer', transition: 'all 0.3s', position: 'relative', overflow: 'hidden',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-hover)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: accent }} />
      <div style={{ width: 44, height: 44, borderRadius: 10, background: accent + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, fontSize: 22 }}>{icon}</div>
      <div style={{ fontFamily: "'Clash Display',sans-serif", fontSize: 18, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 13.5, color: 'var(--stone)', lineHeight: 1.6 }}>{desc}</div>
      {children}
    </div>
  )
}

// ── About Section ─────────────────────────────────────────────────────────────
function AboutSection() {
  const steps = [
    { n: 1, t: 'NGO Posts Sprint',            d: 'Define task, skills needed, and time boundary (2–5 hrs)', c: 'var(--sage)' },
    { n: 2, t: 'AI Matches Professionals',     d: 'Our algorithm scores candidates by GitHub & LinkedIn signals', c: 'var(--sage)' },
    { n: 3, t: 'Sprint Begins',               d: 'Live timer starts — professional delivers within the window', c: 'var(--sage)' },
    { n: 4, t: 'NGO Reviews & Certifies',     d: "Agree → cryptographic certificate issued to professional\'s portfolio", c: 'var(--amber)' },
  ]
  return (
    <div id="about" style={{ padding: '20px 2rem 60px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ background: 'linear-gradient(135deg,var(--sage-pale) 0%,var(--mint) 60%,var(--amber-pale) 100%)', borderRadius: 20, padding: '56px 48px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
        <div>
          <div style={{ display: 'inline-block', background: 'white', color: 'var(--moss)', fontSize: 12, fontWeight: 500, padding: '4px 12px', borderRadius: 12, marginBottom: 16, border: '1px solid var(--border)' }}>The Sprint Concept</div>
          <h2 style={{ fontFamily: "'Clash Display',sans-serif", fontSize: 'clamp(26px,3.5vw,40px)', fontWeight: 700, color: 'var(--ink)', letterSpacing: -0.8, lineHeight: 1.15, marginBottom: 16 }}>Big Impact in Small Sprints</h2>
          <p style={{ fontSize: 14.5, color: 'var(--stone)', lineHeight: 1.8, marginBottom: 12 }}>Traditional volunteering asks for weeks. ImpactSprint asks for 2–5 hours. We believe in the power of focused, skilled micro-contributions — where a data scientist can model deforestation patterns in an afternoon, or a UX designer can revamp a donation flow before lunch.</p>
          <p style={{ fontSize: 14.5, color: 'var(--stone)', lineHeight: 1.8, marginBottom: 24 }}>Every sprint is bounded, verified, and rewarded with a cryptographic digital certificate — proof of your impact, forever on your portfolio.</p>
          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            {[['124,302','Hours donated','var(--sage)'],['8,941','Sprints done','var(--amber)'],['12.8k','Certs issued','var(--sky)']].map(([n,l,c]) => <StatPill key={l} n={n} l={l} color={c} />)}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {steps.map(({ n, t, d, c }) => (
            <div key={n} style={{ background: 'white', borderRadius: 'var(--radius-sm)', padding: 16, display: 'flex', gap: 14, alignItems: 'flex-start', border: '1px solid var(--border)' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: c, color: 'white', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: "'Clash Display',sans-serif" }}>{n}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)', marginBottom: 3 }}>{t}</div>
                <div style={{ fontSize: 12.5, color: 'var(--stone)' }}>{d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Features ──────────────────────────────────────────────────────────────────
function FeatureCard({ f, i }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="stagger-card"
      style={{
        position: 'relative',
        background: 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        borderTop: `2px solid ${f.color}`,
        borderRadius: 'var(--radius)',
        padding: 32,
        cursor: 'pointer',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s, transform 0.6s',
        transitionDelay: hovered ? '0s' : `${(i + 1) * 0.1}s`,
        transform: hovered ? 'translateY(-10px) scale(1.03)' : 'translateY(0) scale(1)',
        boxShadow: hovered ? `0 15px 40px rgba(${f.colorRgb}, 0.25)` : '0 4px 16px rgba(0,0,0,0.04)',
        overflow: 'hidden'
      }}
    >
      {/* Background Radial Glow */}
      <div style={{ position: 'absolute', top: -50, left: -50, width: 220, height: 220, background: `radial-gradient(circle, rgba(${f.colorRgb}, 0.2) 0%, transparent 70%)`, pointerEvents: 'none', transition: 'all 0.4s', transform: hovered ? 'scale(1.2)' : 'scale(1)' }} />
      
      {/* Icon with interactive SVG */}
      <div className={`feature-icon ${hovered ? 'hovered' : ''}`} style={{ width: 56, height: 56, borderRadius: 'var(--radius-sm)', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.color, background: `rgba(${f.colorRgb}, 0.1)`, position: 'relative', overflow: 'hidden' }}>
        {f.svg}
        {/* Shine wipe specifically for Trophy, visible on hover */}
        {f.key === 'cert' && <div className={`shine-wipe ${hovered ? 'animate' : ''}`} style={{ position: 'absolute', top: 0, left: '-100%', width: '50%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)', transform: 'skewX(-20deg)' }} />}
      </div>
      
      <div style={{ fontFamily: "'Clash Display',sans-serif", fontSize: 20, fontWeight: 700, color: 'var(--ink)', marginBottom: 12 }}>{f.title}</div>
      <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13.5, color: 'var(--stone)', lineHeight: 1.6, opacity: 0.8, position: 'relative', zIndex: 1 }}>{f.desc}</div>
    </div>
  )
}

function FeaturesSection() {
  const feats = [
    {
      key: 'ai', color: '#10b981', colorRgb: '16, 185, 129',
      title: 'AI Match Score', desc: 'Our AI analyzes your GitHub repositories and LinkedIn skills to compute a match score for every available sprint — no manual searching needed.',
      svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-gear"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
    },
    {
      key: 'timer', color: '#f59e0b', colorRgb: '245, 158, 11',
      title: 'Live Sprint Timer', desc: 'Every sprint runs on a bounded live clock. NGOs and professionals stay aligned on expectations with real-time progress tracking.',
      svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-timer"><circle cx="12" cy="13" r="8"></circle><polyline points="12 9 12 13 14 15"></polyline><line x1="12" y1="2" x2="12" y2="4"></line><line x1="8" y1="2" x2="16" y2="2"></line></svg>
    },
    {
      key: 'cert', color: '#3b82f6', colorRgb: '59, 130, 246',
      title: 'Digital Certificates', desc: 'Cryptographically signed impact certificates are generated instantly upon NGO approval — verifiable, shareable, and permanently yours.',
      svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-trophy"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"></path></svg>
    },
    {
      key: 'roadmap', color: '#f43f5e', colorRgb: '244, 63, 94',
      title: 'Impact Roadmap', desc: 'Track your cumulative environmental impact across sprints — CO₂ offset modeled, hectares analyzed, and policies influenced.',
      svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-earth"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
    }
  ]
  return (
    <div style={{ padding: '0 2rem 60px', maxWidth: 1100, margin: '0 auto' }}>
      <SectionHeader label="Platform Features" title="Built for the Modern Do-Gooder" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 30 }}>
        {feats.map((f, i) => <FeatureCard key={f.title} f={f} i={i} />)}
      </div>
    </div>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ background: 'white', borderTop: '1px solid var(--border)', padding: '40px 2rem', textAlign: 'center' }}>
      <div style={{ fontFamily: "'Clash Display',sans-serif", fontSize: 22, fontWeight: 700, color: 'var(--moss)', marginBottom: 8 }}>🌿 ImpactSprint</div>
      <div style={{ fontSize: 13, color: 'var(--stone)' }}>Connecting professionals with NGOs — one sprint at a time.</div>
      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 24, fontSize: 13, color: 'var(--stone)' }}>
        {['About','Privacy','Terms','Contact'].map(l => <span key={l} style={{ cursor: 'pointer' }}>{l}</span>)}
      </div>
      <div style={{ marginTop: 16, fontSize: 12, color: 'var(--stone)', opacity: 0.7 }}>© 2026 ImpactSprint. Built for the planet.</div>
    </footer>
  )
}

// ── Unified Registration Component ────────────────────────────────────────────
function UnifiedRegister({ navigate }) {
  const { register } = useAuth()
  const { showModal } = useGlobalModal()
  const [role, setRole]         = useState('Professional') // 'NGO' | 'Professional'
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState(false)

  // Shared
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')

  // Professional fields
  const [fullName, setFullName] = useState('')
  const [skillset, setSkillset] = useState('')

  // NGO fields
  const [ngoFullName, setNgoFullName] = useState('')
  const [orgName, setOrgName]   = useState('')

  const inp = {
    width: '100%', padding: '10px 14px', fontSize: 13,
    border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
    background: 'var(--linen)', color: 'var(--charcoal)',
    fontFamily: "'DM Sans',sans-serif", outline: 'none',
    transition: 'border-color 0.2s', boxSizing: 'border-box',
  }

  const handleSubmit = async () => {
    if (role === 'NGO') {
      if (!ngoFullName.trim() || !orgName.trim() || !email.trim() || !password.trim()) return showModal({ title: 'Validation Error', message: 'Please fill in all required fields (Full Name, Organization Name, Email, Password).', type: 'alert' })
      if (password.length < 6) return showModal({ title: 'Validation Error', message: 'Password must be at least 6 characters.', type: 'alert' })
      setLoading(true)
      try {
        await register({
          name: ngoFullName.trim(),
          email: email.trim(),
          password,
          role: 'NGO',
          organization: orgName.trim(),
        })
        setSuccess(true)
        // Show 24h verification notice; navigate after 2.5s
        setTimeout(() => navigate('ngo'), 2500)
      } catch (err) { showModal({ title: 'Registration Failed', message: err.message, type: 'alert', confirmStyle: 'danger' }) }
      setLoading(false)
    } else {
      if (!fullName.trim() || !email.trim() || !password.trim()) return showModal({ title: 'Validation Error', message: 'Please fill in all required fields (Full Name, Email, Password).', type: 'alert' })
      if (password.length < 6) return showModal({ title: 'Validation Error', message: 'Password must be at least 6 characters.', type: 'alert' })
      setLoading(true)
      try {
        await register({
          name: fullName.trim(),
          email: email.trim(),
          password,
          role: 'Professional',
          profession: skillset.trim(),
          skills: skillset ? skillset.split(',').map(s => s.trim()).filter(Boolean) : [],
        })
        navigate('pro')
      } catch (err) { showModal({ title: 'Registration Failed', message: err.message, type: 'alert', confirmStyle: 'danger' }) }
      setLoading(false)
    }
  }

  // Card selector style helper
  const roleCard = (r, icon, label, sub) => {
    const active = role === r
    return (
      <div
        onClick={() => { setRole(r); setSuccess(false) }}
        style={{
          flex: 1, padding: '14px 16px', borderRadius: 'var(--radius-sm)',
          border: `2px solid ${active ? '#5B7C61' : 'var(--border)'}`,
          background: active ? 'rgba(91,124,97,0.07)' : 'var(--linen)',
          cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: active ? '#5B7C61' : 'var(--ink)' }}>{label}</div>
        <div style={{ fontSize: 11, color: 'var(--stone)', marginTop: 2 }}>{sub}</div>
      </div>
    )
  }

  return (
    <div style={{
      background: 'rgba(255,255,255,0.72)',
      backdropFilter: 'blur(18px)',
      WebkitBackdropFilter: 'blur(18px)',
      border: '1px solid rgba(91,124,97,0.18)',
      borderRadius: 20,
      padding: 32,
      boxShadow: '0 8px 40px rgba(91,124,97,0.10)',
      maxWidth: 440,
      width: '100%',
    }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontFamily: "'Clash Display',sans-serif", fontSize: 20, fontWeight: 700, color: 'var(--ink)', letterSpacing: -0.5 }}>
          Join ImpactSprint
        </div>
        <div style={{ fontSize: 12, color: 'var(--stone)', marginTop: 4 }}>
          Create your account in seconds
        </div>
      </div>

      {/* Role Selector */}
      <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--stone)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
        I am a…
      </div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
        {roleCard('Professional', '👤', 'Professional', 'Offer your skills')}
        {roleCard('NGO', '🏢', 'NGO', 'Post impact sprints')}
      </div>

      {/* Fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
        {role === 'NGO' ? (
          <>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--stone)', marginBottom: 5 }}>Full Name *</label>
              <input value={ngoFullName} onChange={e => setNgoFullName(e.target.value)} placeholder="e.g. Ananya Kapoor" style={inp} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--stone)', marginBottom: 5 }}>Organization Name *</label>
              <input value={orgName} onChange={e => setOrgName(e.target.value)} placeholder="e.g. EcoWatch Foundation" style={inp} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--stone)', marginBottom: 5 }}>Official Email *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="contact@ecowatch.org" style={inp} required />
            </div>
          </>
        ) : (
          <>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--stone)', marginBottom: 5 }}>Full Name *</label>
              <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="e.g. Priya Sharma" style={inp} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--stone)', marginBottom: 5 }}>Personal Email *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="priya@gmail.com" style={inp} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--stone)', marginBottom: 5 }}>Primary Skillset</label>
              <input value={skillset} onChange={e => setSkillset(e.target.value)} placeholder="Python, React, GIS, ML…" style={inp} />
            </div>
          </>
        )}

        {/* Password — shared */}
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--stone)', marginBottom: 5 }}>Password *</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" style={inp} />
        </div>
      </div>

      {/* NGO 24-hour verification notice */}
      {success && role === 'NGO' && (
        <div style={{
          background: 'rgba(91,124,97,0.1)', border: '1px solid rgba(91,124,97,0.3)',
          borderRadius: 'var(--radius-sm)', padding: '12px 14px', marginBottom: 14,
          fontSize: 12.5, color: '#5B7C61', lineHeight: 1.6,
        }}>
          ✅ <strong>Account created!</strong> Your organization will be verified by the ImpactSprint Admin within 24 hours. Redirecting to your portal…
        </div>
      )}

      {/* Primary CTA */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          width: '100%', padding: '12px', borderRadius: 24,
          background: loading ? '#a3b89e' : '#4A7C59',
          color: 'white', border: 'none', fontWeight: 600,
          fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s', marginBottom: 0,
          fontFamily: "'DM Sans',sans-serif",
        }}
        onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#3d6a4c' }}
        onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#4A7C59' }}
      >
        {loading ? 'Creating Account…' : role === 'NGO' ? '🏢 Register as NGO' : '👤 Create Professional Account'}
      </button>

      {/* Sign-in hint */}
      <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--stone)' }}>
        Already have an account?{' '}
        <span style={{ color: '#5B7C61', fontWeight: 600, cursor: 'pointer' }} onClick={() => navigate('pro')}>
          Sign in →
        </span>
      </div>
    </div>
  )
}

// ── Toast notification ─────────────────────────────────────────────────────────
function Toast({ msg, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3400)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <div style={{
      position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
      background: '#1a2744', color: 'white', borderRadius: 12,
      padding: '12px 22px', fontSize: 13.5, fontWeight: 500,
      boxShadow: '0 8px 32px rgba(0,0,0,0.22)', zIndex: 999,
      display: 'flex', alignItems: 'center', gap: 10,
      animation: 'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)',
    }}>
      <span style={{ fontSize: 16 }}>ℹ️</span>
      {msg}
    </div>
  )
}

// ── Auth-aware entry card ─────────────────────────────────────────────────────
// cardRole: the role this card corresponds to ('Orchestrator' | 'NGO' | 'Professional')
// If user is logged in with matching role  → navigate to their portal
// If user is logged in with different role → show toast warning
// If guest                                 → open Navbar login modal (show toast hint)
function SmartEntryCard({ icon, title, desc, accent, cardRole, ctaLabel, user, loading, navigate, showToast, openLogin, delay = 0 }) {
  const [hovered, setHovered] = useState(false)

  const handleClick = () => {
    if (loading) return // still checking auth token

    if (user) {
      // Already logged in
      if (user.role === cardRole) {
        // ✅ Correct role → go to their dashboard
        if (cardRole === 'Orchestrator') return navigate('admin')
        if (cardRole === 'NGO')          return navigate('ngo')
        if (cardRole === 'Professional') return navigate('pro')
      } else {
        // ❌ Wrong role → toast warning
        const roleLabel = user.role === 'Orchestrator' ? 'Admin' : user.role
        const targetLabel = cardRole === 'Orchestrator' ? 'Admin' : cardRole
        showToast(`You are logged in as a ${roleLabel}. Please logout to access the ${targetLabel} portal.`)
      }
    } else {
      // Guest → open login modal with a pre-hint (via openLogin)
      openLogin(cardRole)
    }
  }

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="stagger-card"
      style={{
        background: 'rgba(255,255,255,0.7)', backdropFilter: hovered ? 'blur(24px)' : 'blur(16px)', WebkitBackdropFilter: hovered ? 'blur(24px)' : 'blur(16px)',
        border: `1.5px solid ${hovered ? accent : 'rgba(255,255,255,0.8)'}`,
        borderRadius: 'var(--radius)', padding: 24, cursor: loading ? 'wait' : 'pointer',
        transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.6s, transform 0.6s', position: 'relative', overflow: 'hidden',
        transform: hovered ? 'translateY(-8px)' : 'translateY(0)',
        boxShadow: hovered ? '0 12px 32px rgba(91,124,97,0.3)' : '0 4px 16px rgba(0,0,0,0.04)',
        transitionDelay: hovered ? '0s' : `${delay}s`,
      }}
    >
      {/* Accent top bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: accent }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        {/* Icon */}
        <div style={{
          width: 44, height: 44, borderRadius: 10, flexShrink: 0,
          background: accent + '20', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 22,
        }}>{icon}</div>

        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Clash Display',sans-serif", fontSize: 16, fontWeight: 600, color: 'var(--ink)', marginBottom: 5 }}>
            {title}
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--stone)', lineHeight: 1.6 }}>{desc}</div>
        </div>
      </div>

      {/* CTA row */}
      <div style={{
        marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderTop: '1px solid var(--border)', paddingTop: 12,
      }}>
        <span style={{ fontSize: 12.5, color: accent, fontWeight: 600 }}>
          {loading ? '⏳ Checking…' : user && user.role === cardRole ? ctaLabel : user ? '🔒 Wrong role' : ctaLabel}
        </span>
        {loading
          ? <div style={{ width: 14, height: 14, border: `2px solid ${accent}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          : user && user.role === cardRole
            ? <span style={{ fontSize: 12, background: accent + '20', color: accent, padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>✓ Go to Portal</span>
            : <span style={{ fontSize: 18, color: accent }}>→</span>
        }
      </div>
    </div>
  )
}

// ── Main Export ───────────────────────────────────────────────────────────────
export default function LandingPage({ navigate }) {
  const { user, loading: authLoading } = useAuth()
  const [toast, setToast]       = useState(null)
  const [loginHint, setLoginHint] = useState(null) // 'NGO' | 'Professional' | 'Orchestrator'

  const showToast = (msg) => setToast(msg)

  // When a guest clicks a card we open the Navbar login modal by injecting
  // a custom event — the Navbar listens for this and opens LoginModal.
  // Alternatively we navigate to 'landing' and pass a hint through state.
  // Since there's no router, we dispatch a custom DOM event that Navbar picks up.
  const openLogin = (hint) => {
    setLoginHint(hint)
    window.dispatchEvent(new CustomEvent('impactsprint:openLogin', { detail: { hint } }))
  }

  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    // Parallax
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    
    // Intersection Observer for stagger cards
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view')
        }
      })
    }, { threshold: 0.1 })
    setTimeout(() => {
      document.querySelectorAll('.stagger-card').forEach(el => observer.observe(el))
    }, 100)

    // Add keyframe animations
    let style = document.getElementById('_is_kf')
    if (style) style.remove()
    
    style = document.createElement('style')
    style.id = '_is_kf'
    style.textContent = `
      @keyframes fillBar { from { width: 0; } to { width: 82%; } }
      @keyframes slideUp { from { opacity:0; transform:translateX(-50%) translateY(16px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
      @keyframes spin    { to { transform:rotate(360deg); } }
      @keyframes bgScalePulse { 0% { transform: scale(1); } 100% { transform: scale(1.04); } }
      .stagger-card { opacity: 0; transform: translateY(20px); }
      .stagger-card.in-view { opacity: 1; transform: translateY(0); }
      .btn-ripple { position: relative; overflow: hidden; transform: scale(1); transition: transform 0.15s cubic-bezier(0.16,1,0.3,1); }
      .btn-ripple::after { content: ""; position: absolute; border-radius: 50%; background: rgba(255,255,255,0.4); width: 100px; height: 100px; margin-top: -50px; margin-left: -50px; left: 50%; top: 50%; opacity: 0; transform: scale(0); transition: all 0.6s ease-out; pointer-events: none; }
      .btn-ripple:active::after { transform: scale(4); opacity: 1; transition: 0s; }
      .btn-ripple:active { transform: scale(0.95); }
      .card-lift { transition: transform 0.4s cubic-bezier(0.16,1,0.3,1), box-shadow 0.4s cubic-bezier(0.16,1,0.3,1); }
      .card-lift:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.3); }

      /* Feature Card SVG Icon Keyframes */
      .feature-icon svg { width: 28px; height: 28px; transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1); }
      .feature-icon.hovered .icon-gear { animation: spinGear 3s linear infinite; }
      @keyframes spinGear { to { transform: rotate(360deg); } }
      .feature-icon.hovered .icon-timer { animation: tickTimer 0.8s steps(2, end) infinite; }
      @keyframes tickTimer { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(15deg); } }
      .feature-icon.hovered .icon-earth { animation: rotateEarth 5s linear infinite; }
      @keyframes rotateEarth { to { transform: rotateY(360deg); } }
      .shine-wipe.animate { animation: shineRun 1.5s infinite; }
      @keyframes shineRun { 0% { left: -100%; opacity: 0; } 50% { opacity: 1; } 100% { left: 200%; opacity: 0; } }
    `
    document.head.appendChild(style)
    
    return () => {
      window.removeEventListener('scroll', onScroll)
      observer.disconnect()
    }
  }, [])

  return (
    <div style={{ position: 'relative', overflowX: 'hidden' }}>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Hero navigate={navigate} user={user} openLogin={openLogin} showToast={showToast} />

      {/* ── Get Started — Role Gate + Registration ── */}
      <div style={{ padding: '60px 2rem', maxWidth: 1100, margin: '0 auto' }}>
        {user ? (
          /* ── LOGGED IN: Full-width horizontal role cards ── */
          <div>
            <SectionHeader
              label="Get Started"
              title="Choose Your Role"
              sub="Select your role below. Already logged in? We'll take you straight to your portal."
            />

            {/* Logged-in welcome banner */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'rgba(91,124,97,0.08)', border: '1px solid rgba(91,124,97,0.2)',
              borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 24,
              fontSize: 12.5, color: '#5B7C61', fontWeight: 500,
              maxWidth: 600, margin: '0 auto 24px',
            }}>
              <span>✅</span>
              Logged in as <strong>{user.name}</strong> ({user.role}) — click your portal card below.
            </div>

            <div style={{ display: 'flex', gap: 20, justifyContent: 'space-between' }}>
              <div style={{ flex: 1 }}>
                <SmartEntryCard
                  delay={0}
                  icon="⚙️"
                  title="Admin Dashboard"
                  desc="Monitor platform activity, verify NGOs, manage sprint pipelines, and view engagement analytics."
                  accent="var(--sky)"
                  cardRole="Orchestrator"
                  ctaLabel="Enter Dashboard →"
                  user={user}
                  loading={authLoading}
                  navigate={navigate}
                  showToast={showToast}
                  openLogin={openLogin}
                />
              </div>
              <div style={{ flex: 1 }}>
                <SmartEntryCard
                  delay={0.15}
                  icon="🏢"
                  title="Register as NGO"
                  desc="Post impact sprints, define bounded tasks with clear deliverables, and get matched with skilled professionals."
                  accent="var(--amber)"
                  cardRole="NGO"
                  ctaLabel="Go to NGO Portal →"
                  user={user}
                  loading={authLoading}
                  navigate={navigate}
                  showToast={showToast}
                  openLogin={openLogin}
                />
              </div>
              <div style={{ flex: 1 }}>
                <SmartEntryCard
                  delay={0.3}
                  icon="👤"
                  title="Register as Professional"
                  desc="Offer your skills in focused 2–5 hour sprints. Earn cryptographic impact certificates for your portfolio."
                  accent="var(--sage)"
                  cardRole="Professional"
                  ctaLabel="Go to Pro Portal →"
                  user={user}
                  loading={authLoading}
                  navigate={navigate}
                  showToast={showToast}
                  openLogin={openLogin}
                />
              </div>
            </div>
          </div>
        ) : (
          /* ── GUEST: Two-column layout with registration form ── */
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>

          {/* Left — smart entry cards */}
          <div>
            <SectionHeader
              label="Get Started"
              title="Choose Your Role"
              sub="Select your role below. Already logged in? We'll take you straight to your portal."
            />

            {/* Auth loading banner */}
            {authLoading && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'var(--sage-pale)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 16,
                fontSize: 12.5, color: 'var(--moss)',
              }}>
                <div style={{ width: 12, height: 12, border: '2px solid var(--sage)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                Checking your session…
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <SmartEntryCard
                delay={0}
                icon="⚙️"
                title="Admin Dashboard"
                desc="Monitor platform activity, verify NGOs, manage sprint pipelines, and view engagement analytics."
                accent="var(--sky)"
                cardRole="Orchestrator"
                ctaLabel="Enter Dashboard →"
                user={user}
                loading={authLoading}
                navigate={navigate}
                showToast={showToast}
                openLogin={openLogin}
              />
              <SmartEntryCard
                delay={0.15}
                icon="🏢"
                title="Register as NGO"
                desc="Post impact sprints, define bounded tasks with clear deliverables, and get matched with skilled professionals."
                accent="var(--amber)"
                cardRole="NGO"
                ctaLabel="Go to NGO Portal →"
                user={user}
                loading={authLoading}
                navigate={navigate}
                showToast={showToast}
                openLogin={openLogin}
              />
              <SmartEntryCard
                delay={0.3}
                icon="👤"
                title="Register as Professional"
                desc="Offer your skills in focused 2–5 hour sprints. Earn cryptographic impact certificates for your portfolio."
                accent="var(--sage)"
                cardRole="Professional"
                ctaLabel="Go to Pro Portal →"
                user={user}
                loading={authLoading}
                navigate={navigate}
                showToast={showToast}
                openLogin={openLogin}
              />
            </div>
          </div>

          {/* Right — unified registration */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <UnifiedRegister navigate={navigate} />
          </div>
        </div>
        )}
      </div>

      <AboutSection />
      <FeaturesSection />
      <Footer />

      {/* Toast */}
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
      </div>
    </div>
  )
}


