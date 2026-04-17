import { useState } from 'react'
import { apiUpdateProfile } from '../api'
import { useGlobalModal } from '../GlobalModalContext'

const inputStyle = {
  width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--border)', background: 'var(--linen)',
  fontSize: 13, color: 'var(--ink)', outline: 'none',
  transition: 'border-color 0.2s', marginBottom: 16, boxSizing: 'border-box'
}

export default function ProfileModal({ user, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    bio: user.bio || '',
    skills: user.skills ? user.skills.join(', ') : '',
    avatar: user.avatar || '',
  })
  const [loading, setLoading] = useState(false)
  const { showModal } = useGlobalModal()

  const generateAvatar = () => {
    // Generate a dicebear avatar based on name + role
    const seed = encodeURIComponent(formData.name + (user.role || ''))
    const style = user.role === 'Professional' ? 'avataaars' : 'identicon'
    const generatedUrl = `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&backgroundColor=f8f9fa,e8f5e9`
    setFormData(prev => ({ ...prev, avatar: generatedUrl }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(Boolean)
      const res = await apiUpdateProfile({
        ...formData,
        skills: skillsArray
      })
      onUpdate(res.user)
      onClose()
      showModal({ title: 'Success', message: 'Profile updated successfully!', type: 'alert' })
    } catch (err) {
      showModal({ title: 'Error', message: err.message, type: 'alert', confirmStyle: 'danger' })
    }
    setLoading(false)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)',
      animation: 'fadeIn 0.2s'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)',
        border: '1px solid var(--border)', borderRadius: 'var(--radius)',
        padding: 32, width: '100%', maxWidth: 440,
        boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
        animation: 'slideDownFade 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)' }}>Edit Profile</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--stone)' }}>&times;</button>
        </div>

        {/* Avatar Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%', background: 'var(--sage-pale)',
            border: '2px solid var(--sage-light)', overflow: 'hidden', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, color: 'var(--sage)'
          }}>
            {formData.avatar ? <img src={formData.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : formData.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', marginBottom: 8 }}>Profile Image</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={generateAvatar} style={{
                background: 'var(--linen)', border: '1px solid var(--border)', color: 'var(--stone)',
                padding: '6px 12px', borderRadius: 6, fontSize: 11, cursor: 'pointer', fontWeight: 500
              }}>Generate Avatar</button>
            </div>
          </div>
        </div>

        <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--stone)', marginBottom: 5 }}>Full Name</label>
        <input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} style={inputStyle} />

        <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--stone)', marginBottom: 5 }}>Email Address</label>
        <input value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} style={inputStyle} disabled />

        <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--stone)', marginBottom: 5 }}>Short Bio</label>
        <textarea rows={3} value={formData.bio} onChange={e => setFormData(p => ({ ...p, bio: e.target.value }))} style={{ ...inputStyle, resize: 'none' }} placeholder="I am a dedicated professional..." />

        {user.role === 'Professional' && (
          <>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--stone)', marginBottom: 5 }}>Skills (comma separated)</label>
            <input value={formData.skills} onChange={e => setFormData(p => ({ ...p, skills: e.target.value }))} style={{...inputStyle, marginBottom: 24}} placeholder="React, UI Design, Node..." />
          </>
        )}

        <button
          onClick={handleSave}
          disabled={loading}
          style={{
            width: '100%', padding: 12, borderRadius: 'var(--radius-sm)',
            background: 'var(--sage)', color: 'white', border: 'none',
            fontSize: 14, fontWeight: 600, cursor: loading ? 'wait' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
