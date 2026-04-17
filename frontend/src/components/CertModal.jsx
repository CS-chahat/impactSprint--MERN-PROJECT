import { apiDownloadCertPDF } from '../api'

export default function CertModal({ onClose, certData }) {
  const hash = certData?.hash || 'IS-2026-0411-AK-94F2A3B8'
  const hashShort = certData?.hash ? `IS-${certData.hash.substring(0, 16).toUpperCase()}` : 'IS-2026-0411-AK-94F2A3B8'
  const taskName = certData?.taskName || ''
  const proName = certData?.professionalName || ''

  const handleDownload = async () => {
    if (certData?._id) {
      try { await apiDownloadCertPDF(certData._id) } catch (err) { console.error(err) }
    }
    onClose()
  }

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(44,42,39,0.5)',
      zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'white', borderRadius: 20, padding: 48, textAlign: 'center',
        maxWidth: 420, width: '90%', animation: 'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        <div style={{
          width: 80, height: 80, background: 'linear-gradient(135deg,var(--sage-pale),var(--mint))',
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px', fontSize: 36,
        }}>🏆</div>

        <div style={{ fontFamily: "'Clash Display',sans-serif", fontSize: 24, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>
          Certificate Generated!
        </div>
        {(taskName || proName) && (
          <div style={{ fontSize: 13, color: 'var(--stone)', marginBottom: 6 }}>
            {proName && <><strong>{proName}</strong> · </>}{taskName}
          </div>
        )}
        <p style={{ fontSize: 14, color: 'var(--stone)', lineHeight: 1.6, marginBottom: 24 }}>
          Cryptographically signed impact certificate issued to the professional's portfolio.
          This contribution is permanently verified on the ImpactSprint ledger.
        </p>
        <div style={{
          background: 'var(--linen)', borderRadius: 'var(--radius-sm)', padding: '10px 16px',
          fontFamily: 'monospace', fontSize: 12, color: 'var(--sage)', marginBottom: 20,
          wordBreak: 'break-all',
        }}>
          {hashShort}
        </div>
        <button onClick={handleDownload} style={{
          width: '100%', background: 'var(--sage)', color: 'white', border: 'none',
          padding: '12px', borderRadius: 24, fontSize: 14, fontWeight: 500,
          cursor: 'pointer', marginBottom: 10,
        }}>Download Certificate</button>
        <button onClick={onClose} style={{
          width: '100%', background: 'transparent', color: 'var(--sage)',
          border: '1.5px solid var(--sage)', padding: '11px', borderRadius: 24,
          fontSize: 13, fontWeight: 500, cursor: 'pointer',
        }}>Close</button>
      </div>
    </div>
  )
}
