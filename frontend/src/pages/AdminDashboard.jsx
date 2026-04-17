import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../AuthContext'
import { apiGetAdminFeed, apiGetAllUsers, apiDeleteUser, apiGetSprints, apiGetAllCertificates } from '../api'
import { useGlobalModal } from '../GlobalModalContext'
import { BtnPrimary, BtnSecondary, BtnAgree, BtnDisagree, MetricCard, ProgressBar, LiveDot } from '../components/UI'

// ── Mini SVG line chart ─────────────────────────────────────────────────────
function MiniLineChart({ data, color = 'var(--sage)', height = 100 }) {
  if (!data || data.length < 2) return null
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const w = 280
  const h = height
  const pad = 8
  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2)
    const y = h - pad - ((v - min) / range) * (h - pad * 2)
    return `${x},${y}`
  })
  const line = points.join(' ')
  const areaPath = `M ${points[0]} L ${line.replace(/,/g, ' ').split(' ').reduce((acc, _, i, arr) => {
    if (i % 2 === 0) acc.push(`${arr[i]},${arr[i + 1]}`)
    return acc
  }, []).join(' L ')} L ${pad + ((data.length - 1) / (data.length - 1)) * (w - pad * 2)},${h - pad} L ${pad},${h - pad} Z`

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height }}>
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#chartGrad)" />
      <polyline points={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((v, i) => {
        const x = pad + (i / (data.length - 1)) * (w - pad * 2)
        const y = h - pad - ((v - min) / range) * (h - pad * 2)
        return <circle key={i} cx={x} cy={y} r="3" fill="white" stroke={color} strokeWidth="2" />
      })}
    </svg>
  )
}

// ── Data table component ────────────────────────────────────────────────────
function DataTable({ title, columns, rows, onRemove, onBack }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{title}</div>
        <button onClick={onBack} style={{
          background: 'var(--linen)', border: '1px solid var(--border)', color: 'var(--stone)',
          padding: '5px 12px', borderRadius: 'var(--radius-sm)', fontSize: 11, cursor: 'pointer', fontWeight: 500,
        }}>← Back to Feed</button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
          <thead>
            <tr>
              {columns.map(c => (
                <th key={c.key} style={{ textAlign: 'left', padding: '10px 12px', borderBottom: '2px solid var(--border)', color: 'var(--stone)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>{c.label}</th>
              ))}
              {onRemove && <th style={{ textAlign: 'center', padding: '10px 12px', borderBottom: '2px solid var(--border)', color: 'var(--stone)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={columns.length + (onRemove ? 1 : 0)} style={{ padding: 20, textAlign: 'center', color: 'var(--stone)' }}>No data available</td></tr>
            )}
            {rows.map((row, i) => (
              <tr key={row._id || i} style={{ background: i % 2 === 0 ? 'transparent' : 'var(--linen)', transition: 'background 0.2s' }}>
                {columns.map(c => (
                  <td key={c.key} style={{ padding: '9px 12px', borderBottom: '1px solid var(--border)', color: 'var(--charcoal)' }}>
                    {c.render ? c.render(row) : row[c.key] || '—'}
                  </td>
                ))}
                {onRemove && (
                  <td style={{ padding: '9px 12px', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
                    <button onClick={() => onRemove(row)} style={{
                      background: 'transparent', color: '#c0392b', border: '1.5px solid #e74c3c',
                      padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: 11,
                      cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                    >Remove</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function AdminDashboard({ navigate, onCert }) {
  const { user } = useAuth()
  const { showModal } = useGlobalModal()
  const [feedData, setFeedData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState(null) // null = feed, 'sprints' | 'sprintsDone' | 'pros' | 'ngos' | 'certs'
  const [tableData, setTableData] = useState([])
  const [tableLoading, setTableLoading] = useState(false)

  const fetchFeed = async () => {
    try {
      const data = await apiGetAdminFeed()
      setFeedData(data)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  useEffect(() => { fetchFeed() }, [])
  useEffect(() => {
    const id = setInterval(fetchFeed, 10000)
    return () => clearInterval(id)
  }, [])

  const stats = feedData?.stats || {}
  const feed = feedData?.feed || []
  const recentUsers = feedData?.recentUsers || []
  const pending = recentUsers.filter(u => !u.isVerified && u.role === 'NGO').slice(0, 5)

  // Clickable stat card handler
  const handleStatClick = async (view) => {
    if (activeView === view) { setActiveView(null); return }
    setActiveView(view)
    setTableLoading(true)
    try {
      if (view === 'sprints' || view === 'sprintsDone') {
        const data = await apiGetSprints()
        const sprints = data.sprints || data || []
        setTableData(view === 'sprintsDone' ? sprints.filter(s => s.status === 'COMPLETED') : sprints)
      } else if (view === 'pros' || view === 'ngos') {
        const data = await apiGetAllUsers()
        const users = data.users || []
        setTableData(view === 'pros' ? users.filter(u => u.role === 'Professional') : users.filter(u => u.role === 'NGO'))
      } else if (view === 'certs') {
        const data = await apiGetAllCertificates()
        setTableData(data.certificates || data || [])
      }
    } catch (err) { console.error(err); setTableData([]) }
    setTableLoading(false)
  }

  const handleRemoveUser = (userRow) => {
    showModal({
      title: 'Confirm Removal',
      message: `Are you sure you want to remove "${userRow.name}" (${userRow.role})? This action is irreversible.`,
      type: 'confirm',
      confirmStyle: 'danger',
      onConfirm: async () => {
        try {
          await apiDeleteUser(userRow._id)
          setTableData(prev => prev.filter(u => u._id !== userRow._id))
          fetchFeed() // refresh stats
        } catch (err) {
          showModal({ title: 'Error', message: err.message || 'Failed to delete user', type: 'alert' })
        }
      }
    })
  }

  // Compute health metrics from stats
  const healthMetrics = [
    { label: 'Sprint Completion Rate', val: stats.completionRate || 0, color: 'linear-gradient(90deg,var(--sage-light),var(--sage))',         display: `${stats.completionRate || 0}%`, dc: 'var(--sage)' },
    { label: 'Active Sprints',         val: stats.totalSprints > 0 ? Math.round((stats.activeSprints / stats.totalSprints) * 100) : 0, color: 'var(--sky)', display: `${stats.activeSprints || 0}`, dc: 'var(--sky)' },
    { label: 'Total NGOs',            val: Math.min(100, (stats.totalNGOs || 0) * 10), color: 'linear-gradient(90deg,var(--amber-light),var(--amber))',        display: `${stats.totalNGOs || 0}`, dc: 'var(--amber)' },
    { label: 'Certificate Integrity', val: 100, color: 'linear-gradient(90deg,var(--sage-light),var(--sage))',          display: '100%', dc: 'var(--sage)' },
  ]

  // Simulated growth data for chart
  const growthData = [
    Math.max(1, (stats.completedSprints || 0) - 8),
    Math.max(2, (stats.completedSprints || 0) - 5),
    Math.max(3, (stats.completedSprints || 0) - 3),
    Math.max(5, (stats.completedSprints || 0) - 1),
    stats.completedSprints || 6,
    (stats.completedSprints || 6) + 2,
  ]

  const roadmap = [
    { n: stats.completedSprints || '0', l: 'Sprints\nCompleted',      bg: 'var(--sage-pale)',  c: 'var(--sage)' },
    { n: stats.totalPros || '0',        l: 'Active\nProfessionals',    bg: 'var(--amber-pale)', c: 'var(--amber)' },
    { n: stats.totalNGOs || '0',        l: 'Verified\nNGOs',           bg: 'var(--sky-pale)',   c: 'var(--sky)' },
    { n: stats.totalCerts || '0',       l: 'Certs\nIssued',            bg: 'var(--mint)',       c: 'var(--moss)' },
  ]

  // Table configs per view
  const renderTable = () => {
    if (tableLoading) return <div style={{ padding: 30, textAlign: 'center', color: 'var(--stone)', fontSize: 13 }}>Loading data...</div>

    const back = () => setActiveView(null)

    if (activeView === 'sprints' || activeView === 'sprintsDone') {
      return <DataTable title={activeView === 'sprints' ? 'All Sprints' : 'Completed Sprints'} onBack={back} columns={[
        { key: 'title', label: 'Sprint Title' },
        { key: 'status', label: 'Status', render: r => <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 8, background: r.status === 'COMPLETED' ? 'var(--sage-pale)' : 'var(--amber-pale)', color: r.status === 'COMPLETED' ? 'var(--sage)' : 'var(--amber)', fontWeight: 500 }}>{r.status}</span> },
        { key: 'org', label: 'NGO', render: r => r.ngoName || r.postedBy?.organization || '—' },
        { key: 'time', label: 'Duration', render: r => `${r.timeCommitment || '—'} hrs` },
        { key: 'created', label: 'Created', render: r => r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—' },
      ]} rows={tableData} />
    }

    if (activeView === 'pros') {
      return <DataTable title="All Professionals" onBack={back} onRemove={handleRemoveUser} columns={[
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'profession', label: 'Profession', render: r => r.profession || '—' },
        { key: 'skills', label: 'Skills', render: r => (r.skills || []).join(', ') || '—' },
        { key: 'joined', label: 'Joined', render: r => r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—' },
      ]} rows={tableData} />
    }

    if (activeView === 'ngos') {
      return <DataTable title="All NGOs" onBack={back} onRemove={handleRemoveUser} columns={[
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'organization', label: 'Organization', render: r => r.organization || '—' },
        { key: 'verified', label: 'Verified', render: r => r.isVerified ? <span style={{ color: 'var(--sage)', fontWeight: 600 }}>✓ Yes</span> : <span style={{ color: 'var(--amber)', fontWeight: 600 }}>⏳ Pending</span> },
        { key: 'joined', label: 'Joined', render: r => r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—' },
      ]} rows={tableData} />
    }

    if (activeView === 'certs') {
      return <DataTable title="All Certificates" onBack={back} columns={[
        { key: 'proName', label: 'Professional', render: r => r.professionalName || r.professional?.name || '—' },
        { key: 'sprint', label: 'Sprint', render: r => r.sprintTitle || r.sprint?.title || '—' },
        { key: 'ngo', label: 'NGO', render: r => r.ngoName || r.ngo?.name || '—' },
        { key: 'issued', label: 'Issued', render: r => r.issuedAt ? new Date(r.issuedAt).toLocaleDateString() : r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—' },
      ]} rows={tableData} />
    }

    return null
  }

  // Stat card style for clickable cards
  const statCardStyle = (view) => ({
    cursor: 'pointer',
    transition: 'all 0.2s',
    outline: activeView === view ? '2px solid var(--sage)' : 'none',
    outlineOffset: 2,
    borderRadius: 'var(--radius-sm)',
  })

  return (
    <div>
      {/* Admin Header */}
      <div style={{ padding: '28px 28px 0', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{ fontFamily: "'Clash Display',sans-serif", fontSize: 24, fontWeight: 700, color: 'var(--ink)', letterSpacing: -0.5 }}>Admin Overview</div>
            <div style={{ fontSize: 13, color: 'var(--stone)', marginTop: 2 }}>
              <LiveDot /><span style={{ color: 'var(--sage)', fontSize: 12 }}>Real-time · All platform activity</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <BtnSecondary style={{ fontSize: 12 }}>Export Report</BtnSecondary>
            <BtnPrimary style={{ fontSize: 12 }} onClick={() => navigate('ngo')}>NGO Portal →</BtnPrimary>
          </div>
        </div>

        {/* Top metrics — clickable */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12, marginBottom: 8 }}>
          <div style={statCardStyle('sprints')} onClick={() => handleStatClick('sprints')}>
            <MetricCard value={stats.totalSprints || 0}     label="Total Sprints"   delta={`${stats.activeSprints || 0} active`} />
          </div>
          <div style={statCardStyle('sprintsDone')} onClick={() => handleStatClick('sprintsDone')}>
            <MetricCard value={stats.completedSprints || 0} label="Sprints Done"    delta={`${stats.completionRate || 0}% rate`} />
          </div>
          <div style={statCardStyle('pros')} onClick={() => handleStatClick('pros')}>
            <MetricCard value={stats.totalPros || 0}        label="Professionals"   delta="registered" />
          </div>
          <div style={statCardStyle('ngos')} onClick={() => handleStatClick('ngos')}>
            <MetricCard value={stats.totalNGOs || 0}        label="NGOs"            delta={`${pending.length} pending`} />
          </div>
          <div style={statCardStyle('certs')} onClick={() => handleStatClick('certs')}>
            <MetricCard value={stats.totalCerts || 0}       label="Certs Issued"    delta="verified" />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, padding: 28, maxWidth: 1200, margin: '0 auto' }}>
        {/* Activity Feed OR Data Table */}
        <div style={{ background: 'rgba(255, 255, 255, 0.65)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.4)', borderRadius: 'var(--radius)', padding: 20 }}>
          {activeView ? renderTable() : (
            <>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)', marginBottom: 16 }}>Real-Time Activity Feed</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {feed.length === 0 && !loading && (
                  <div style={{ fontSize: 13, color: 'var(--stone)', textAlign: 'center', padding: 20 }}>No activity yet. Waiting for platform usage...</div>
                )}
                {feed.map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: 10, background: 'var(--linen)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: f.dot, flexShrink: 0, marginTop: 5 }} />
                    <div>
                      <div style={{ fontSize: 12.5, color: 'var(--charcoal)', lineHeight: 1.5 }}>{f.text}</div>
                      <div style={{ fontSize: 11, color: 'var(--stone)', marginTop: 2 }}>{f.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Platform Health — expanded (no more Pending Verifications) */}
        <div style={{ background: 'rgba(255, 255, 255, 0.65)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.4)', borderRadius: 'var(--radius)', padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)', marginBottom: 16 }}>Platform Health</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {healthMetrics.map(m => (
                <div key={m.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--stone)', marginBottom: 5 }}>
                    <span>{m.label}</span><span style={{ color: m.dc, fontWeight: 500 }}>{m.display}</span>
                  </div>
                  <ProgressBar value={m.val} color={m.color} />
                </div>
              ))}
            </div>
          </div>

          {/* Revenue / Impact Growth Chart */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>Impact Growth</div>
              <span style={{ fontSize: 10.5, color: 'var(--sage)', background: 'var(--sage-pale)', padding: '2px 8px', borderRadius: 8, fontWeight: 600 }}>Last 6 months</span>
            </div>
            <MiniLineChart data={growthData} color="var(--sage)" height={110} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 10.5, color: 'var(--stone)' }}>
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map(m => <span key={m}>{m}</span>)}
            </div>
          </div>

          {/* Quick summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ background: 'var(--sage-pale)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Clash Display',sans-serif", fontSize: 20, fontWeight: 700, color: 'var(--sage)' }}>{stats.completionRate || 0}%</div>
              <div style={{ fontSize: 10, color: 'var(--stone)', marginTop: 2 }}>Completion Rate</div>
            </div>
            <div style={{ background: 'var(--amber-pale)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Clash Display',sans-serif", fontSize: 20, fontWeight: 700, color: 'var(--amber)' }}>{stats.activeSprints || 0}</div>
              <div style={{ fontSize: 10, color: 'var(--stone)', marginTop: 2 }}>Active Now</div>
            </div>
          </div>
        </div>

        {/* Impact Roadmap — spans full width */}
        <div style={{ background: 'rgba(255, 255, 255, 0.65)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.4)', borderRadius: 'var(--radius)', padding: 20, gridColumn: 'span 2' }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)', marginBottom: 16 }}>Platform Impact Roadmap</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
            {roadmap.map(r => (
              <div key={r.l} style={{ background: r.bg, borderRadius: 'var(--radius-sm)', padding: 16, textAlign: 'center' }}>
                <div style={{ fontFamily: "'Clash Display',sans-serif", fontSize: 28, fontWeight: 700, color: r.c }}>{r.n}</div>
                <div style={{ fontSize: 11, color: 'var(--stone)', marginTop: 4, whiteSpace: 'pre-line' }}>{r.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
