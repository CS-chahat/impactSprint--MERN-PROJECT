import { NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'

const styles = {
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 2.5rem',
    height: '68px',
    background: 'rgba(247,244,239,0.88)',
    backdropFilter: 'blur(14px)',
    borderBottom: '1px solid var(--border)',
    transition: 'box-shadow 0.3s',
  },
  navScrolled: {
    boxShadow: '0 2px 20px rgba(13,27,42,0.08)',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontFamily: 'Syne, sans-serif',
    fontWeight: 800,
    fontSize: '1.2rem',
    color: 'var(--navy)',
    letterSpacing: '-0.3px',
  },
  logo: {
    width: '34px',
    height: '34px',
    background: 'var(--orange)',
    borderRadius: '9px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '1.1rem',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  link: {
    padding: '7px 16px',
    borderRadius: '8px',
    fontFamily: 'DM Sans, sans-serif',
    fontWeight: 500,
    fontSize: '0.95rem',
    color: 'var(--text-muted)',
    transition: 'all 0.2s',
  },
  activeLink: {
    color: 'var(--navy)',
    background: 'rgba(13,27,42,0.07)',
  },
  cta: {
    marginLeft: '0.75rem',
    padding: '8px 20px',
    background: 'var(--orange)',
    color: '#fff',
    borderRadius: '9px',
    fontFamily: 'Syne, sans-serif',
    fontWeight: 700,
    fontSize: '0.9rem',
    border: 'none',
    letterSpacing: '0.2px',
    transition: 'transform 0.15s, box-shadow 0.15s',
  },
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav style={{ ...styles.nav, ...(scrolled ? styles.navScrolled : {}) }}>
      <NavLink to="/" style={styles.brand}>
        <div style={styles.logo}>⚡</div>
        ImpactSprint
      </NavLink>

      <div style={styles.links}>
        {['/', '/about', '/contact'].map((path, i) => {
          const label = ['Home', 'About', 'Contact'][i]
          return (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              style={({ isActive }) => ({
                ...styles.link,
                ...(isActive ? styles.activeLink : {}),
              })}
            >
              {label}
            </NavLink>
          )
        })}
        <button
          style={styles.cta}
          onMouseEnter={e => { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = '0 6px 20px rgba(232,101,42,0.35)' }}
          onMouseLeave={e => { e.target.style.transform = 'none'; e.target.style.boxShadow = 'none' }}
        >
          Sign In
        </button>
      </div>
    </nav>
  )
}