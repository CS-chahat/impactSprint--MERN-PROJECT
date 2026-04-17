import { useState } from 'react'
import { useAuth } from './AuthContext'
import Navbar from './components/Navbar'
import CertModal from './components/CertModal'
import LandingPage from './pages/LandingPage'
import NgoDashboard from './pages/NgoDashboard'
import LiveTracking from './pages/LiveTracking'
import ProDashboard from './pages/ProDashboard'
import AdminDashboard from './pages/AdminDashboard'
import RegisterPage from './pages/RegisterPage'

export default function App() {
  const [page, setPage] = useState('landing')
  const [showCert, setShowCert] = useState(false)
  const [certData, setCertData] = useState(null)
  const { user } = useAuth()

  const navigate = (p) => {
    setPage(p)
    window.scrollTo(0, 0)
  }

  const handleCert = (data) => {
    setCertData(data || null)
    setShowCert(true)
  }

  const pages = {
    landing:       <LandingPage navigate={navigate} onCert={handleCert} />,
    ngo:           <NgoDashboard navigate={navigate} onCert={handleCert} />,
    tracking:      <LiveTracking navigate={navigate} onCert={handleCert} />,
    pro:           <ProDashboard navigate={navigate} onCert={handleCert} />,
    admin:         <AdminDashboard navigate={navigate} onCert={handleCert} />,
    'register-ngo':<RegisterPage navigate={navigate} role="NGO" />,
    'register-pro':<RegisterPage navigate={navigate} role="Professional" />,
  }

  const roleTints = {
    Orchestrator: 'rgba(232, 242, 251, 0.85)',
    NGO: 'rgba(232, 245, 237, 0.85)',
    Professional: 'rgba(224, 242, 241, 0.85)',
  }
  const defaultTint = 'rgba(255, 255, 255, 0.85)'
  const tint = (page !== 'landing' && user?.role) ? roleTints[user.role] || defaultTint : 'rgba(232, 245, 233, 0.75)'
  const tintEnd = page === 'landing' ? 'rgba(255, 255, 255, 0.85)' : tint

  return (
    <div style={{
      backgroundImage: `linear-gradient(${tint}, ${tintEnd}), url('https://img.freepik.com/premium-photo/world-map-made-foliage-with-people-silhouettes_780838-234.jpg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center bottom',
      backgroundAttachment: 'fixed',
      minHeight: '100vh',
    }}>
      <Navbar page={page} navigate={navigate} />
      <div key={page} className="page-enter" style={{ paddingTop: 60 }}>
        {pages[page]}
      </div>
      {showCert && <CertModal certData={certData} onClose={() => setShowCert(false)} />}
    </div>
  )
}
