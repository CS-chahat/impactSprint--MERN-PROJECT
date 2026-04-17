export function generateCertificatePDF(sprint, user, certData = {}) {
  const date       = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const proName    = certData.professionalName || user?.name       || 'Professional'
  const profession = user?.profession          || 'Volunteer'
  const ngoName    = certData.ngoName          || sprint?.postedBy?.organization || sprint?.postedBy?.name || 'NGO Partner'
  const taskName   = certData.taskName         || sprint?.title     || 'Impact Sprint'
  const hours      = certData.timeCommitment   || sprint?.timeCommitment || '–'
  const skills     = (certData.skills && certData.skills.length > 0)
    ? certData.skills : (sprint?.requiredSkills || [])
  const hash       = certData.hash             || '—'
  const hashShort  = hash !== '—' ? hash.substring(0, 32) : '—'

  const CORAL = '#FF5733'
  const NAVY  = '#1a2744'

  const skillPills = skills.length > 0
    ? skills.map(s => `<span style="display:inline-block;padding:3px 12px;border-radius:99px;background:#fff4f1;border:1.5px solid #FF5733;color:#FF5733;font-size:10px;font-weight:600;margin:3px 4px 3px 0;letter-spacing:0.5px">${s}</span>`).join('')
    : '<span style="display:inline-block;padding:3px 12px;border-radius:99px;background:#f9fafb;border:1.5px solid #d1d5db;color:#6b7280;font-size:10px;font-weight:600;margin:3px 4px 3px 0;letter-spacing:0.5px">General Professional Support</span>'

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>ImpactSprint Certificate — ${proName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    *{margin:0;padding:0;box-sizing:border-box}
    body {
      font-family:'Inter',sans-serif;
      background:#f5f7fa;
      display:flex;
      align-items:center;
      justify-content:center;
      min-height:100vh;
      padding:32px
    }
    .cert-wrapper {
      width: 1056px; 
      height: 816px; 
      background: #ffffff;
      box-shadow: 0 12px 60px rgba(0,0,0,0.12);
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
    }
    .top-bar { height:12px; background:linear-gradient(90deg,${CORAL},#ff8c69); flex-shrink: 0; }
    .body { flex: 1; padding: 56px 80px; display: flex; flex-direction: column; }
    
    .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 40px; padding-bottom: 32px; border-bottom: 1.5px solid #f0f0f0; }
    .brand-name { font-size:22px; font-weight:800; color:${CORAL}; letter-spacing:-0.5px; }
    .brand-sub { font-size:12px; color:#9ca3af; letter-spacing:2px; text-transform:uppercase; margin-top:4px; }
    .cert-badge { font-size:12px; color:#9ca3af; letter-spacing:2px; text-transform:uppercase; text-align:right; }
    
    .content { flex: 1; display: flex; flex-direction: column; justify-content: center; }
    .cert-title { font-size:42px; font-weight:800; color:${NAVY}; letter-spacing:-1px; margin-bottom:12px; line-height:1.1; }
    .subtitle { font-size:16px; color:#9ca3af; letter-spacing:0.5px; margin-bottom: 24px; }
    .pro-name { font-size:56px; font-weight:800; color:${CORAL}; letter-spacing:-1.5px; line-height:1; margin-bottom:8px; }
    .pro-role { font-size:14px; color:#6b7280; letter-spacing:2px; text-transform:uppercase; margin-bottom:32px; padding:6px 18px; display:inline-block; border:1.5px solid #e5e7eb; border-radius:99px; }
    .task-line { font-size:18px; color:#374151; margin-bottom:8px; line-height:1.7; }
    .task-name { color:${NAVY}; font-weight:700; }
    .ngo-line { font-size:18px; color:#374151; margin-bottom: 32px; }
    .ngo-name { color:${NAVY}; font-weight:700; }
    .skills-label { font-size:12px; color:#9ca3af; letter-spacing:2px; text-transform:uppercase; margin-bottom:10px; }
    .skills-row { margin-bottom: 32px; }
    
    .divider { height:1px; background:#f0f0f0; margin: 32px 0; }
    .footer { display:flex; justify-content:space-between; align-items:flex-end; padding-bottom: 24px; }
    .footer-left .row { font-size:14px; color:#6b7280; margin-bottom:6px; line-height:1.6; }
    .footer-left .label { font-size:11px; text-transform:uppercase; letter-spacing:1.5px; color:#9ca3af; margin-bottom:4px; }
    .footer-right { text-align:right; }
    .footer-brand { font-size:16px; font-weight:700; color:${NAVY}; }
    .footer-verified { font-size:14px; color:${CORAL}; font-weight:600; letter-spacing:0.5px; margin-top:6px; }
    .hash-text { font-family:monospace; font-size:12px; color:#9ca3af; word-break:break-all; max-width:400px; }
    .bottom-bar { height:6px; background:linear-gradient(90deg,#ff8c69,${CORAL}); position: absolute; bottom: 0; left: 0; right: 0; }
    
    @page {
      size: letter landscape;
      margin: 0;
    }
    @media print {
      body { background: #fff; padding: 0; display: block; }
      .cert-wrapper { 
        box-shadow: none; 
        width: 100vw; 
        height: 100vh; 
        page-break-after: avoid; 
        page-break-before: avoid; 
      }
      * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
<div class="cert-wrapper">
  <div class="top-bar"></div>
  <div class="body">
    <div class="header">
      <div>
        <div class="brand-name">🌿 IMPACTSPRINT</div>
        <div class="brand-sub">Micro-Volunteering Platform</div>
      </div>
      <div class="cert-badge">Certificate of Impact<br>Digitally Issued &amp; Verified</div>
    </div>
    <div class="content">
      <div class="cert-title">Certificate of Impact</div>
      <div class="subtitle">This certifies that</div>
      <div class="pro-name">${proName}</div>
      <div class="pro-role">${profession}</div>
      <div class="task-line">has successfully completed the sprint task <span class="task-name">"${taskName}"</span></div>
      <div class="ngo-line">for <span class="ngo-name">${ngoName}</span> &nbsp;•&nbsp; <strong>${hours}h</strong> Contributed</div>
      <div class="skills-row">
        <div class="skills-label">Skills Applied</div>
        ${skillPills}
      </div>
    </div>
    <div class="divider"></div>
    <div class="footer">
      <div class="footer-left">
        <div class="label">Issued</div>
        <div class="row">${date}</div>
        <div class="label" style="margin-top:12px">Verification Hash (SHA-256)</div>
        <div class="hash-text">${hashShort}${hash !== '—' && hash.length > 32 ? '…' : ''}</div>
        <div class="row" style="margin-top:6px">Verify at: <strong>impactsprint.app/verify/${hashShort}</strong></div>
      </div>
      <div class="footer-right">
        <div class="footer-brand">ImpactSprint Platform</div>
        <div class="footer-verified">✓ Digitally Verified</div>
      </div>
    </div>
  </div>
  <div class="bottom-bar"></div>
</div>
<script>window.onload = () => { window.print() }</script>
</body>
</html>`

  const blob = new Blob([html], { type: 'text/html' })
  const url  = URL.createObjectURL(blob)
  window.open(url, '_blank')
  setTimeout(() => URL.revokeObjectURL(url), 15000)
}
