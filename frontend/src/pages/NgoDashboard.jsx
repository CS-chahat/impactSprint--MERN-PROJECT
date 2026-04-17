import { useState, useEffect } from 'react'
import { useAuth } from '../AuthContext'
import { useGlobalModal } from '../GlobalModalContext'
import { apiGetSprints, apiCreateSprint, apiVerifyImpact, apiDisagreeSprint } from '../api'
import { Sidebar, MetricCard, BtnPrimary, BtnAgree, BtnDisagree, LiveDot, FormGroup, inputStyle } from '../components/UI'

const sidebarItems = [
  { icon: '📊', label: 'Dashboard',     active: true },
  { icon: '⚡', label: 'Active Sprints', page: 'tracking' },
  { icon: '📋', label: 'Post Sprint' },
  { icon: '👥', label: 'Matched Pros' },
  { icon: '🏆', label: 'Certificates' },
]

const badgeStyle = {
  POSTED:           { bg: 'var(--sage-pale)',  color: 'var(--sage)',  label: 'Posted' },
  IN_PROGRESS:      { bg: 'var(--mint)',       color: 'var(--moss)',  label: 'Active' },
  PENDING_APPROVAL: { bg: 'var(--amber-pale)', color: 'var(--amber)', label: 'Review' },
  COMPLETED:        { bg: '#e8f4fd',           color: 'var(--sky)',   label: 'Completed' },
}

const skillOptions = ['React', 'Python', 'TensorFlow', 'Data Science', 'GIS', 'Machine Learning', 'UI/UX Design', 'Legal', 'Graphic Design', 'D3.js', 'PostgreSQL', 'Node.js', 'Research', 'Data Viz', 'Remote Sensing']

export default function NgoDashboard({ navigate, onCert }) {
  const { user } = useAuth()
  const { showModal } = useGlobalModal()
  const [sprints, setSprints] = useState([])
  const [loading, setLoading] = useState(true)

  // Form state
  const [ngoName, setNgoName] = useState(user?.organization || user?.name || '')
  const [taskName, setTaskName] = useState('')
  const [taskDesc, setTaskDesc] = useState('')
  const [timeCommitment, setTimeCommitment] = useState(2)
  const [reqSkills, setReqSkills] = useState('')
  const [posting, setPosting] = useState(false)

  const fetchSprints = async () => {
    try {
      const data = await apiGetSprints()
      setSprints(data.sprints || [])
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  useEffect(() => { fetchSprints() }, [])

  // Polling for live updates
  useEffect(() => {
    const id = setInterval(fetchSprints, 8000)
    return () => clearInterval(id)
  }, [])

  const handlePostSprint = async () => {
    if (!taskName.trim() || !taskDesc.trim()) return showModal({ title: 'Missing Info', message: 'Please fill in Task Name and Description', type: 'alert' })
    setPosting(true)
    try {
      await apiCreateSprint({
        title: taskName.trim(),
        description: taskDesc.trim(),
        ngoName: ngoName.trim(),
        timeCommitment: Number(timeCommitment),
        requiredSkills: reqSkills.split(',').map(s => s.trim()).filter(Boolean),
        category: 'Environment',
      })
      setTaskName(''); setTaskDesc(''); setReqSkills('')
      fetchSprints()
      showModal({ title: 'Sprint Posted', message: 'Your task has been successfully posted to professionals.' })
    } catch (err) { showModal({ title: 'Error', message: err.message, type: 'alert', confirmStyle: 'danger' }) }
    setPosting(false)
  }

  const handleAgree = async (sprintId) => {
    try {
      await apiVerifyImpact(sprintId)
      fetchSprints()
      showModal({ title: 'Impact Verified', message: 'Sprint approved! The professional will receive their certificate.' })
    } catch (err) { showModal({ title: 'Error', message: err.message, type: 'alert', confirmStyle: 'danger' }) }
  }

  const handleDisagree = async (sprintId) => {
    try {
      await apiDisagreeSprint(sprintId, 'Needs revision')
      fetchSprints()
      showModal({ title: 'Revision Requested', message: 'Task sent back to the professional for revision.' })
    } catch (err) { showModal({ title: 'Error', message: err.message, type: 'alert', confirmStyle: 'danger' }) }
  }

  const activeTasks = sprints.filter(s => ['IN_PROGRESS', 'POSTED'].includes(s.status))
  const pendingApproval = sprints.filter(s => s.status === 'PENDING_APPROVAL')
  const completedCount = sprints.filter(s => s.status === 'COMPLETED').length

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: 'calc(100vh - 60px)' }}>
      <Sidebar subtitle="NGO Portal" items={sidebarItems} navigate={navigate} />

      <div style={{ padding: 28 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{ fontFamily: "'Clash Display',sans-serif", fontSize: 24, fontWeight: 700, color: 'var(--ink)', letterSpacing: -0.5 }}>{user?.organization || user?.name || 'NGO Dashboard'}</div>
            <div style={{ fontSize: 13, color: 'var(--stone)', marginTop: 2 }}>
              Welcome back, {user?.name || 'User'} · <LiveDot /><span style={{ fontSize: 12, color: 'var(--sage)' }}>{activeTasks.length} sprints live</span>
            </div>
          </div>
          <BtnPrimary onClick={() => navigate('tracking')}>⚡ View Live Sprints</BtnPrimary>
        </div>

        {/* Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
          <MetricCard value={sprints.length}        label="Total Sprints"        delta={`${activeTasks.length} active`} />
          <MetricCard value={activeTasks.length}     label="Live Now"             delta="↑ recently" />
          <MetricCard value={pendingApproval.length} label="Pending Review"       delta="awaiting" deltaColor="var(--amber)" />
          <MetricCard value={completedCount}         label="Completed"            delta="✓ certified" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Task List */}
          <div style={{ background: 'rgba(255, 255, 255, 0.65)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.4)', borderRadius: 'var(--radius)', padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)', marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
              Active Sprint Tasks
              <span style={{ fontSize: 10.5, padding: '3px 9px', borderRadius: 10, fontWeight: 500, background: 'var(--sage-pale)', color: 'var(--sage)' }}>Live</span>
            </div>
            {sprints.length === 0 && !loading && (
              <div style={{ fontSize: 13, color: 'var(--stone)', textAlign: 'center', padding: 20 }}>No sprints yet. Post your first sprint! →</div>
            )}
            {sprints.slice(0, 6).map(t => {
              const b = badgeStyle[t.status] || badgeStyle.POSTED
              const initials = t.assignedTo?.name ? t.assignedTo.name.split(' ').map(w => w[0]).join('').toUpperCase() : '??'
              const assigneeName = t.assignedTo?.name || 'Unassigned'
              return (
                <div key={t._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: b.bg, color: b.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>{initials}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{assigneeName}</div>
                    <div style={{ fontSize: 11, color: 'var(--stone)', marginTop: 2 }}>{t.title} · {t.timeCommitment}h</div>
                  </div>
                  <span style={{ fontSize: 10.5, padding: '3px 9px', borderRadius: 10, fontWeight: 500, background: b.bg, color: b.color }}>{b.label}</span>
                </div>
              )
            })}
          </div>

          {/* Post Sprint Form */}
          <div style={{ background: 'rgba(255, 255, 255, 0.65)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.4)', borderRadius: 'var(--radius)', padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)', marginBottom: 16 }}>Post New Sprint</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <FormGroup label="NGO Name"><input value={ngoName} onChange={e => setNgoName(e.target.value)} placeholder="Organisation Name" style={inputStyle} /></FormGroup>
                <FormGroup label="Task Name"><input value={taskName} onChange={e => setTaskName(e.target.value)} placeholder="e.g. Forest Analysis" style={inputStyle} /></FormGroup>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <FormGroup label="Time Boundary">
                  <select value={timeCommitment} onChange={e => setTimeCommitment(e.target.value)} style={inputStyle}>
                    <option value={2}>2 Hours</option><option value={3}>3 Hours</option><option value={4}>4 Hours</option><option value={5}>5 Hours</option>
                  </select>
                </FormGroup>
                <FormGroup label="Required Skills"><input value={reqSkills} onChange={e => setReqSkills(e.target.value)} placeholder="Python, ML, GIS" style={inputStyle} /></FormGroup>
              </div>
              <FormGroup label="Task Description"><input value={taskDesc} onChange={e => setTaskDesc(e.target.value)} placeholder="Describe the deliverable clearly..." style={inputStyle} /></FormGroup>
              <BtnPrimary style={{ marginTop: 4, borderRadius: 'var(--radius-sm)', opacity: posting ? 0.6 : 1 }} onClick={handlePostSprint}>🚀 {posting ? 'Posting...' : 'Launch Sprint'}</BtnPrimary>
            </div>
          </div>

          {/* Approval Queue */}
          <div style={{ background: 'rgba(255, 255, 255, 0.65)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.4)', borderRadius: 'var(--radius)', padding: 20, gridColumn: 'span 2' }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)', marginBottom: 16 }}>NGO Outcome Approval Queue</div>
            {pendingApproval.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--stone)', textAlign: 'center', padding: 16 }}>No sprints pending approval right now.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                {pendingApproval.map(a => (
                  <div key={a._id} style={{ background: 'var(--linen)', borderRadius: 'var(--radius-sm)', padding: 14 }}>
                    <div style={{ fontSize: 12, color: 'var(--stone)', marginBottom: 6 }}>{a.ngoName || a.postedBy?.organization || 'NGO'}</div>
                    <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--ink)', marginBottom: 4 }}>{a.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--stone)', marginBottom: 12 }}>by {a.assignedTo?.name || 'Unknown'}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                      <button
                        onClick={() => {
                          if (a.submissionUrl) {
                            window.open(a.submissionUrl, '_blank', 'noopener,noreferrer')
                          } else {
                            showModal({ title: 'No Submission', message: 'The professional has not submitted a proof-of-work URL yet.', type: 'alert' })
                          }
                        }}
                        style={{
                          background: 'var(--linen)', border: '1.5px solid var(--border)', color: 'var(--ink)',
                          padding: '7px 0', borderRadius: 'var(--radius-sm)', fontSize: 11.5, fontWeight: 500,
                          cursor: 'pointer', transition: 'all 0.2s',
                        }}
                      >🔗 Show Work</button>
                      <BtnAgree onClick={() => handleAgree(a._id)}>✓ Agree</BtnAgree>
                      <BtnDisagree onClick={() => handleDisagree(a._id)}>✗ Disagree</BtnDisagree>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
