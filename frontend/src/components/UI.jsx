// ── Buttons ──────────────────────────────────────────────────────────────────
export function BtnPrimary({ children, onClick, style = {} }) {
  return (
    <button onClick={onClick} style={{
      background: 'var(--sage)', color: 'white', fontSize: 14, fontWeight: 500,
      padding: '12px 24px', borderRadius: 24, border: 'none', cursor: 'pointer',
      transition: 'all 0.25s', ...style,
    }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--moss)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'var(--sage)'; e.currentTarget.style.transform = 'translateY(0)' }}
    >{children}</button>
  )
}

export function BtnSecondary({ children, onClick, style = {} }) {
  return (
    <button onClick={onClick} style={{
      background: 'transparent', color: 'var(--sage)', fontSize: 14, fontWeight: 500,
      padding: '12px 24px', borderRadius: 24, border: '1.5px solid var(--sage)',
      cursor: 'pointer', transition: 'all 0.25s', ...style,
    }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--sage-pale)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >{children}</button>
  )
}

export function BtnAgree({ children, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: 'var(--sage)', color: 'white', border: 'none', padding: '10px',
      borderRadius: 'var(--radius-sm)', fontSize: 13, fontWeight: 500, cursor: 'pointer', width: '100%',
    }}>{children}</button>
  )
}

export function BtnDisagree({ children, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: 'transparent', color: '#c0392b', border: '1.5px solid #e74c3c',
      padding: '10px', borderRadius: 'var(--radius-sm)', fontSize: 13, fontWeight: 500, cursor: 'pointer', width: '100%',
    }}>{children}</button>
  )
}

// ── Cards ─────────────────────────────────────────────────────────────────────
export function Card({ children, style = {}, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
      padding: 20, ...style,
    }}>{children}</div>
  )
}

export function MetricCard({ value, label, delta, deltaColor = 'var(--sage)' }) {
  return (
    <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: 16 }}>
      <div style={{ fontFamily: "'Clash Display',sans-serif", fontSize: 28, fontWeight: 700, color: 'var(--ink)' }}>{value}</div>
      <div style={{ fontSize: 11.5, color: 'var(--stone)', marginTop: 3 }}>{label}</div>
      {delta && <div style={{ fontSize: 11, color: deltaColor, marginTop: 6, fontWeight: 500 }}>{delta}</div>}
    </div>
  )
}

// ── Badges ────────────────────────────────────────────────────────────────────
export function Badge({ children, type = 'active' }) {
  const colors = {
    active: { bg: 'var(--sage-pale)',  color: 'var(--sage)' },
    review: { bg: 'var(--amber-pale)', color: 'var(--amber)' },
    done:   { bg: '#e8f4fd',           color: 'var(--sky)' },
    ai:     { bg: 'linear-gradient(135deg,var(--sage),var(--moss))', color: 'white' },
  }
  const c = colors[type] || colors.active
  return (
    <span style={{
      fontSize: 10.5, padding: '3px 9px', borderRadius: 10, fontWeight: 500,
      background: c.bg, color: c.color,
    }}>{children}</span>
  )
}

// ── Progress Bar ──────────────────────────────────────────────────────────────
export function ProgressBar({ value, color = 'var(--sage)' }) {
  return (
    <div style={{ background: 'var(--cream)', borderRadius: 999, height: 8, overflow: 'hidden' }}>
      <div style={{ width: `${value}%`, height: '100%', borderRadius: 999, background: color, transition: 'width 0.5s' }} />
    </div>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
export function Sidebar({ title, subtitle, items, navigate }) {
  return (
    <div style={{ background: 'white', borderRight: '1px solid var(--border)', padding: '24px 0', minHeight: 'calc(100vh - 60px)' }}>
      <div style={{ padding: '0 20px 20px', borderBottom: '1px solid var(--border)', marginBottom: 16 }}>
        <div style={{ fontFamily: "'Clash Display',sans-serif", fontSize: 16, fontWeight: 700, color: 'var(--moss)' }}>🌿 ImpactSprint</div>
        <div style={{ fontSize: 11, color: 'var(--stone)', marginTop: 2 }}>{subtitle}</div>
      </div>
      {items.map(item => (
        <div key={item.label}
          onClick={() => item.page && navigate(item.page)}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px',
            fontSize: 13.5, color: item.active ? 'var(--sage)' : 'var(--stone)',
            cursor: 'pointer', borderLeft: `3px solid ${item.active ? 'var(--sage)' : 'transparent'}`,
            background: item.active ? 'var(--sage-pale)' : 'transparent',
            fontWeight: item.active ? 500 : 400, transition: 'all 0.2s',
          }}>
          <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{item.icon}</span>
          {item.label}
        </div>
      ))}
    </div>
  )
}

// ── Section Header ────────────────────────────────────────────────────────────
export function SectionHeader({ label, title, sub }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--sage)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>{label}</div>
      <h2 style={{ fontFamily: "'Clash Display',sans-serif", fontSize: 'clamp(28px,4vw,42px)', fontWeight: 700, color: 'var(--ink)', letterSpacing: -1, marginBottom: 12 }}>{title}</h2>
      {sub && <p style={{ fontSize: 15, color: 'var(--stone)', lineHeight: 1.7, maxWidth: 560 }}>{sub}</p>}
    </div>
  )
}

// ── Live Dot ──────────────────────────────────────────────────────────────────
export function LiveDot() {
  return <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2ecc71', display: 'inline-block', marginRight: 6, animation: 'pulse 1.5s infinite' }} />
}

// ── Form Input ────────────────────────────────────────────────────────────────
export function FormGroup({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--stone)', marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  )
}

export const inputStyle = {
  width: '100%', padding: '9px 12px', border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)', fontSize: 13, fontFamily: "'DM Sans',sans-serif",
  background: 'var(--linen)', color: 'var(--charcoal)', outline: 'none',
}
