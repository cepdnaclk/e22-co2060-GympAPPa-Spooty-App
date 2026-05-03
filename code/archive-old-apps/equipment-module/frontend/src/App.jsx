// ============================================================
// App.jsx — Main Application
// Matches GympAPPa design:
//   - White header with logo + logout button
//   - Teal navigation bar below header
//   - Beige/cream background
// ============================================================

import React from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'

import IssueEquipment  from './pages/IssueEquipment'
import ReturnEquipment from './pages/ReturnEquipment'
import MyIssuedItems   from './pages/MyIssuedItems'

import './styles/global.css'
import './styles/header.css'
import './styles/navigation.css'
import './styles/equipment.css'

import logo from './components/logo.png'

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const path     = location.pathname

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      {/* ══════════════════════════════════════════
          HEADER
      ══════════════════════════════════════════ */}
      <header className="header">
        <div className="header-container">

          <div className="logo" style={{ flexDirection: 'row', alignItems: 'center' }}>
            <img src={logo} alt="GympAPPa Logo" className="header-logo" />
            <div>
              <h1>GympAPPa</h1>
              <p className="tagline">PERA Sports &amp; Gymnasium Management System</p>
            </div>
          </div>

          <div className="logo-spacer" />

          <div className="header-right">
            <button className="btn-logout">Logout</button>
            <div className="user-section">
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-green)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '20px',
                cursor: 'pointer',
                border: '3px solid var(--color-green)',
                transition: 'var(--transition)'
              }}>
                &#128100;
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════
          NAVIGATION
      ══════════════════════════════════════════ */}
      <nav className="navigation">
        <div className="nav-container">
          <ul className="nav-menu">
            <li>
              <button
                className={`nav-link ${path === '/' || path === '/issue' ? 'active' : ''}`}
                onClick={() => navigate('/issue')}
              >
                Issue Equipment
              </button>
            </li>
            <li>
              <button
                className={`nav-link ${path === '/return' ? 'active' : ''}`}
                onClick={() => navigate('/return')}
              >
                Return Equipment
              </button>
            </li>
            <li>
              <button
                className={`nav-link ${path === '/history' ? 'active' : ''}`}
                onClick={() => navigate('/history')}
              >
                Issue History
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* ══════════════════════════════════════════
          PAGE CONTENT — no container, full width
      ══════════════════════════════════════════ */}
      <main style={{ flex: 1, padding: '32px 40px', backgroundColor: 'var(--color-light)' }}>
        <Routes>
          <Route path="/"        element={<IssueEquipment />} />
          <Route path="/issue"   element={<IssueEquipment />} />
          <Route path="/return"  element={<ReturnEquipment />} />
          <Route path="/history" element={<MyIssuedItems />} />
        </Routes>
      </main>

    </div>
  )
}

export default App
