import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../AuthContext'
import { useGlobalModal } from '../GlobalModalContext'
import {
  apiGetSprints,
  apiVerifyImpact,
  apiDisagreeSprint,
  apiSubmitSprint,
  apiStopSprint,
} from '../api'
import { BtnPrimary, BtnAgree, BtnDisagree, LiveDot, ProgressBar, inputStyle } from '../components/UI'

import { generateCertificatePDF } from '../utils/cert'

// ── Timer display with stop-on-command support ────────────────────────────────
function TimerDisplay({ initialSecs, stopped, color }) {
  const [secs, setSecs] = useState(initialSecs || 0)
  const intervalRef     = useRef(null)

  useEffect(() => {
    setSecs(initialSecs || 0)
  }, [initialSecs])

  useEffect(() => {
    clearInterval(intervalRef.current)
    if (stopped) return
    intervalRef.current = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(intervalRef.current)
  }, [stopped])

  const fmt = (s) => {
    const h   = String(Math.floor(s / 3600)).padStart(2, '0')
    const m   = String(Math.floor((s % 3600) / 60)).padStart(2, '0')
    const sec = String(s % 60).padStart(2, '0')
    return `${h}:${m}:${sec}`
  }

  return (
    <div style={{
      fontFamily: "'Clash Display',sans-serif", fontSize: 52, fontWeight: 700,
      color: color || 'var(--ink)', letterSpacing: -2, margin: '12px 0', textAlign: 'center',
    }}>
      {fmt(secs)}
    </div>
  )
}

// ── Card: Professional's own active sprint ────────────────────────────────────
function ProSprintCard({ sprint, user, onCompleteTask, onStop, onDownloadCert }) {
  const [submissionUrl, setSubmissionUrl] = useState('')
  const [completing, setCompleting]       = useState(false)
  const [stopping, setStopping]           = useState(false)
  const { showModal } = useGlobalModal()

  const isInProgress      = sprint.status === 'IN_PROGRESS'
  const isPendingApproval = sprint.status === 'PENDING_APPROVAL'
  const isCompleted       = sprint.status === 'COMPLETED'
  const timerStopped      = !isInProgress || completing

  const getTimerSecs = () => {
    if (!sprint.startedAt) return 0
    const elapsed = (Date.now() - new Date(sprint.startedAt).getTime()) / 1000
    const total   = (sprint.timeCommitment || 3) * 3600
    return Math.max(0, Math.round(total - elapsed))
  }

  const getProgress = () => {
    if (isCompleted || isPendingApproval) return 100
    if (!sprint.startedAt) return 0
    const elapsed = (Date.now() - new Date(sprint.startedAt).getTime()) / 1000
    const total   = (sprint.timeCommitment || 3) * 3600
    return Math.min(100, Math.round((elapsed / total) * 100))
  }

  const badge     = isCompleted ? '🏆 Certified' : isPendingApproval ? '🟡 In Review' : '🟢 Live'
  const badgeBg   = isCompleted ? 'var(--sage-pale)' : isPendingApproval ? 'var(--amber-pale)' : 'var(--sage-pale)'
  const badgeColor = isCompleted ? 'var(--moss)' : isPendingApproval ? 'var(--amber)' : 'var(--sage)'
  const timerColor = isPendingApproval ? 'var(--amber)' : isCompleted ? 'var(--sage)' : 'var(--ink)'
  const barColor  = isPendingApproval
    ? 'linear-gradient(90deg,var(--amber-light),var(--amber))'
    : 'linear-gradient(90deg,var(--sage-light),var(--sage))'

  const isValidUrl = /^(https?:\/\/)?([\w.-]+\.[a-z]{2,})\/?/.test(submissionUrl)

  const handleComplete = async () => {
    if (!isValidUrl) return
    setCompleting(true)
    await onCompleteTask(sprint._id, submissionUrl)
    setCompleting(false)
  }

  const handleStopClick = () => {
    showModal({
      title: 'Stop Task',
      message: 'Stop Timer? This task will be immediately unassigned and made available to other professionals.',
      type: 'confirm',
      confirmLabel: 'Stop & Reassign',
      confirmStyle: 'danger',
      onConfirm: async () => {
        setStopping(true)
        await onStop(sprint._id)
        setStopping(false)
      }
    })
  }

  return (
    <div style={{ background: 'rgba(255, 255, 255, 0.65)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: 'var(--radius)', border: '1px solid rgba(255, 255, 255, 0.4)', padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{sprint.title}</div>
        <span style={{ fontSize: 10, padding: '3px 9px', borderRadius: 10, fontWeight: 500, background: badgeBg, color: badgeColor }}>{badge}</span>
      </div>
      <div style={{ fontSize: 12, color: 'var(--stone)', marginBottom: 10 }}>
        {user?.name} · {user?.profession || 'Professional'}
      </div>

      {/* Timer — stops as soon as Complete Task or Stop is clicked */}
      <TimerDisplay initialSecs={getTimerSecs()} stopped={timerStopped || stopping} color={timerColor} />
      <div style={{ fontSize: 12, color: 'var(--stone)', textAlign: 'center', marginBottom: 16 }}>
        {isCompleted       ? '✓ Sprint Certified'
          : isPendingApproval ? '⏳ Awaiting NGO Approval…'
          : 'Time remaining'}
      </div>

      {/* Submission URL — only visible while IN_PROGRESS */}
      {isInProgress && (
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--stone)', marginBottom: 5 }}>
            Submission URL
          </label>
          <input
            value={submissionUrl}
            onChange={e => setSubmissionUrl(e.target.value)}
            placeholder="https://github.com/your-work or drive link…"
            style={{ ...inputStyle, fontSize: 12, padding: '8px 12px', boxSizing: 'border-box' }}
          />
        </div>
      )}

      {/* Progress bar */}
      <div style={{ marginBottom: 6 }}>
        <ProgressBar value={getProgress()} color={barColor} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--stone)', marginBottom: 16 }}>
        <span>{isPendingApproval ? 'Submitted ✓' : isCompleted ? 'Completed ✓' : 'Sprint Progress'}</span>
        <span>{getProgress()}%</span>
      </div>

      {/* Complete Task + Stop buttons (IN_PROGRESS only) */}
      {isInProgress && (
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <button
              onClick={handleComplete}
              disabled={completing || !isValidUrl}
              style={{
                background: 'var(--sage)', color: 'white', border: 'none',
                padding: 10, borderRadius: 'var(--radius-sm)', fontSize: 13,
                fontWeight: 500, cursor: (completing || !isValidUrl) ? 'not-allowed' : 'pointer',
                opacity: (completing || !isValidUrl) ? 0.6 : 1,
              }}
            >
              {completing ? '…' : '✓ Complete Task'}
            </button>
            <button
              onClick={handleStopClick}
              disabled={stopping}
              style={{
                background: 'transparent', color: '#c0392b',
                border: '1.5px solid #e74c3c', padding: 10,
                borderRadius: 'var(--radius-sm)', fontSize: 13, fontWeight: 500,
                cursor: stopping ? 'not-allowed' : 'pointer',
                opacity: stopping ? 0.7 : 1,
              }}
            >
              {stopping ? '…' : '⏹ Stop'}
            </button>
          </div>
        </div>
      )}

      {/* Download Certificate — strictly visible only when Certified */}
      {isCompleted && (
        <button
          onClick={() => onDownloadCert(sprint)}
          style={{
            width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)',
            fontSize: 13.5, fontWeight: 600, transition: 'all 0.2s',
            background: 'linear-gradient(135deg,var(--sage),var(--moss))',
            color: 'white', border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(91,124,97,0.2)',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          📄 Download Certified Impact Certificate
        </button>
      )}
    </div>
  )
}

// ── Card: NGO reviews submitted sprint (PENDING_APPROVAL) ─────────────────────
function NgoReviewCard({ sprint, onAgree, onDisagree }) {
  const [agreeing, setAgreeing]     = useState(false)
  const [disagreeing, setDisagreeing] = useState(false)

  const handleAgree = async () => {
    setAgreeing(true)
    await onAgree(sprint._id)
    setAgreeing(false)
  }

  const handleDisagree = async () => {
    setDisagreeing(true)
    await onDisagree(sprint._id)
    setDisagreeing(false)
  }

  return (
    <div style={{ background: 'rgba(255, 255, 255, 0.65)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: 'var(--radius)', border: '1px solid rgba(255, 255, 255, 0.4)', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{sprint.title}</div>
        <span style={{ fontSize: 10, padding: '3px 9px', borderRadius: 10, fontWeight: 500, background: 'var(--amber-pale)', color: 'var(--amber)' }}>🟡 In Review</span>
      </div>
      <div style={{ fontSize: 12, color: 'var(--stone)', marginBottom: 12 }}>
        {sprint.assignedTo?.name || 'Professional'} · {sprint.assignedTo?.profession || 'Professional'}
      </div>

      {/* Deliverable preview */}
      <div style={{ background: 'var(--linen)', borderRadius: 'var(--radius-sm)', padding: 12, marginBottom: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 500, color: 'var(--stone)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 }}>
          Submitted Deliverable
        </div>
        {sprint.submissionUrl ? (
          <a
            href={sprint.submissionUrl}
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: 12, color: 'var(--sage)', wordBreak: 'break-all' }}
          >
            {sprint.submissionUrl}
          </a>
        ) : (
          <div style={{ fontSize: 12, color: 'var(--charcoal)' }}>
            {sprint.submissionNote || 'Task marked as complete by professional'}
          </div>
        )}
      </div>

      <div style={{ marginBottom: 6 }}>
        <ProgressBar value={100} color="linear-gradient(90deg,var(--amber-light),var(--amber))" />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--stone)', marginBottom: 16 }}>
        <span>Submitted ✓</span><span>100%</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <BtnAgree onClick={handleAgree} disabled={agreeing}>
          {agreeing ? '…' : '✓ Agree'}
        </BtnAgree>
        <BtnDisagree onClick={handleDisagree} disabled={disagreeing}>
          {disagreeing ? '…' : '✗ Disagree'}
        </BtnDisagree>
      </div>
    </div>
  )
}

// ── Card: Read-only monitor view (admin / other sprints) ──────────────────────
function MonitorCard({ sprint }) {
  const isReview    = sprint.status === 'PENDING_APPROVAL'
  const isCompleted = sprint.status === 'COMPLETED'
  const isLive      = sprint.status === 'IN_PROGRESS'

  const getTimerSecs = () => {
    if (!sprint.startedAt || !isLive) return 0
    const elapsed = (Date.now() - new Date(sprint.startedAt).getTime()) / 1000
    const total   = (sprint.timeCommitment || 3) * 3600
    return Math.max(0, Math.round(total - elapsed))
  }

  const getProgress = () => {
    if (isCompleted || isReview) return 100
    if (!sprint.startedAt) return 0
    const elapsed = (Date.now() - new Date(sprint.startedAt).getTime()) / 1000
    const total   = (sprint.timeCommitment || 3) * 3600
    return Math.min(100, Math.round((elapsed / total) * 100))
  }

  const badge      = isCompleted ? '🏆 Certified' : isReview ? '🟡 In Review' : '🟢 Live'
  const badgeBg    = isCompleted ? 'var(--sage-pale)' : isReview ? 'var(--amber-pale)' : 'var(--sage-pale)'
  const badgeColor = isCompleted ? 'var(--moss)' : isReview ? 'var(--amber)' : 'var(--sage)'
  const timerColor = isReview ? 'var(--amber)' : 'var(--ink)'
  const barColor   = isReview
    ? 'linear-gradient(90deg,var(--amber-light),var(--amber))'
    : 'linear-gradient(90deg,var(--sage-light),var(--sage))'

  return (
    <div style={{ background: 'rgba(255, 255, 255, 0.65)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: 'var(--radius)', border: '1px solid rgba(255, 255, 255, 0.4)', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{sprint.title}</div>
        <span style={{ fontSize: 10, padding: '3px 9px', borderRadius: 10, fontWeight: 500, background: badgeBg, color: badgeColor }}>{badge}</span>
      </div>
      <div style={{ fontSize: 12, color: 'var(--stone)', marginBottom: 10 }}>
        {sprint.assignedTo?.name || 'Unassigned'} · {sprint.assignedTo?.profession || 'Professional'}
      </div>

      <TimerDisplay initialSecs={getTimerSecs()} stopped={!isLive} color={timerColor} />
      <div style={{ fontSize: 12, color: 'var(--stone)', textAlign: 'center', marginBottom: 16 }}>Time remaining</div>

      <div style={{ marginBottom: 6 }}>
        <ProgressBar value={getProgress()} color={barColor} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--stone)' }}>
        <span>{isCompleted ? 'Certified ✓' : isReview ? 'In Review' : 'In Progress'}</span>
        <span>{getProgress()}%</span>
      </div>
    </div>
  )
}

// ── Main LiveTracking page ─────────────────────────────────────────────────────
export default function LiveTracking({ navigate, onCert }) {
  const { user }    = useAuth()
  const { showModal } = useGlobalModal()
  const [sprints, setSprints]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [certData, setCertData] = useState({}) // hash + skills from NGO approval

  const fetchSprints = async () => {
    try {
      const data = await apiGetSprints()
      setSprints(data.sprints || [])
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  useEffect(() => { fetchSprints() }, [])
  useEffect(() => {
    const id = setInterval(fetchSprints, 5000)
    return () => clearInterval(id)
  }, [])

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleCompleteTask = async (sprintId, submissionUrl) => {
    try {
      await apiSubmitSprint(sprintId, { submissionNote: 'Task completed', submissionUrl })
      fetchSprints()
      showModal({
        title: 'Task Completed',
        message: 'Congratulations on completing this task! Your submission is now pending NGO approval.',
      })
    } catch (err) { showModal({ title: 'Error', message: err.message }) }
  }

  const handleStop = async (sprintId) => {
    try {
      const res = await apiStopSprint(sprintId)
      fetchSprints()
      navigate('pro')
      showModal({
        title: 'Task Reassigned',
        message: `Task successfully stopped and reassigned.\n\nActivity Logged: ${res.timeLogged || '0 mins'} spent.`,
      })
    } catch (err) { showModal({ title: 'Error', message: err.message }) }
  }

  const handleAgree = async (sprintId) => {
    try {
      const data = await apiVerifyImpact(sprintId)
      if (data.certificate) setCertData(data.certificate)
      fetchSprints()
    } catch (err) { showModal({ title: 'Error', message: err.message }) }
  }

  const handleDisagree = async (sprintId) => {
    try {
      await apiDisagreeSprint(sprintId, 'Needs revision')
      fetchSprints()
    } catch (err) { showModal({ title: 'Error', message: err.message }) }
  }

  const handleDownloadCert = (sprint) => {
    // Pass stored certData (contains the SHA-256 hash from server) to the PDF generator
    generateCertificatePDF(sprint, user, certData)
  }

  // ── Role flags ─────────────────────────────────────────────────────────────
  const isPro = user?.role === 'Professional'
  const isNGO = user?.role === 'NGO'

  // ── Sprint buckets ─────────────────────────────────────────────────────────
  const liveSprints      = sprints.filter(s => s.status === 'IN_PROGRESS')
  const reviewSprints    = sprints.filter(s => s.status === 'PENDING_APPROVAL')
  const completedSprints = sprints.filter(s => s.status === 'COMPLETED')

  // Professional: find their own sprint across all active statuses
  const myLiveSprint      = isPro ? liveSprints.find(s => String(s.assignedTo?._id) === String(user?._id)) : null
  const myReviewSprint    = isPro ? reviewSprints.find(s => String(s.assignedTo?._id) === String(user?._id)) : null
  const myCompletedSprint = isPro ? completedSprints.find(s => String(s.assignedTo?._id) === String(user?._id)) : null
  const mySprint          = myLiveSprint || myReviewSprint || myCompletedSprint

  // NGO: review cards only for sprints THEY posted
  const ngoReviewSprints  = isNGO
    ? reviewSprints.filter(s => String(s.postedBy?._id || s.postedBy) === String(user?._id))
    : []

  // Monitor: all live + review sprints EXCLUDING what this professional manages already
  const otherLive  = isPro
    ? liveSprints.filter(s => String(s.assignedTo?._id) !== String(user?._id))
    : liveSprints
  const otherReview = isPro
    ? reviewSprints.filter(s => String(s.assignedTo?._id) !== String(user?._id))
    : (isNGO ? reviewSprints.filter(s => !ngoReviewSprints.includes(s)) : reviewSprints)

  const allActive = [...liveSprints, ...reviewSprints]

  const overview = [
    { n: String(sprints.length),         l: 'Total Sprints',  c: 'var(--ink)'   },
    { n: String(liveSprints.length),      l: 'Live Now',       c: 'var(--sage)'  },
    { n: String(reviewSprints.length),    l: 'In Review',      c: 'var(--amber)' },
    { n: String(completedSprints.length), l: 'Certified',      c: 'var(--sky)'   },
    { n: '0',                             l: 'Disputes',       c: 'var(--stone)' },
  ]

  return (
    <div>
      {/* Header */}
      <div style={{ padding: '28px 28px 0', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{ fontFamily: "'Clash Display',sans-serif", fontSize: 24, fontWeight: 700, color: 'var(--ink)', letterSpacing: -0.5 }}>
              Live Sprint Tracking
            </div>
            <div style={{ fontSize: 13, color: 'var(--stone)', marginTop: 2 }}>
              <LiveDot />
              <span style={{ color: 'var(--sage)', fontSize: 12 }}>
                {liveSprints.length} sprints in progress · Updated live
              </span>
            </div>
          </div>
          <BtnPrimary onClick={() => navigate(isPro ? 'pro' : 'ngo')}>
            ← Back to {isPro ? 'Pro' : 'NGO'} Portal
          </BtnPrimary>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, padding: '0 28px 28px', maxWidth: 1100, margin: '0 auto' }}>

        {/* ── Professional's own sprint card ── */}
        {isPro && mySprint && (
          <ProSprintCard
            sprint={mySprint}
            user={user}
            onCompleteTask={handleCompleteTask}
            onStop={handleStop}
            onDownloadCert={handleDownloadCert}
          />
        )}

        {/* ── NGO: review cards for their posted sprints ── */}
        {isNGO && ngoReviewSprints.map(sp => (
          <NgoReviewCard
            key={sp._id}
            sprint={sp}
            onAgree={handleAgree}
            onDisagree={handleDisagree}
          />
        ))}

        {/* ── Monitor cards: other live sprints ── */}
        {otherLive.map(sp => <MonitorCard key={sp._id} sprint={sp} />)}

        {/* ── Monitor cards: other review sprints ── */}
        {otherReview.map(sp => <MonitorCard key={sp._id} sprint={sp} />)}

        {/* ── Latest completed sprints (monitor only) ── */}
        {completedSprints.slice(0, 2).filter(sp =>
          !isPro || String(sp.assignedTo?._id) !== String(user?._id)
        ).map(sp => <MonitorCard key={sp._id} sprint={sp} />)}

        {/* ── Empty state ── */}
        {allActive.length === 0 && completedSprints.length === 0 && !loading && (
          <div style={{
            gridColumn: 'span 3', background: 'rgba(255, 255, 255, 0.65)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.4)',
            borderRadius: 'var(--radius)', padding: 40, textAlign: 'center', color: 'var(--stone)',
          }}>
            No active sprints to track. Post or join a sprint to get started!
          </div>
        )}

        {/* ── Sprint Progress Overview ── */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.65)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.4)',
          borderRadius: 'var(--radius)', padding: 20, gridColumn: 'span 3',
        }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)', marginBottom: 16 }}>
            Sprint Progress Overview · Today
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12, textAlign: 'center' }}>
            {overview.map(o => (
              <div key={o.l}>
                <div style={{ fontFamily: "'Clash Display',sans-serif", fontSize: 28, fontWeight: 700, color: o.c }}>{o.n}</div>
                <div style={{ fontSize: 11, color: 'var(--stone)' }}>{o.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
