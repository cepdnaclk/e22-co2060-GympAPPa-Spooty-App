// ============================================================
// main.jsx — App Entry Point (Vite)
// This is the very first file React loads.
// We wrap the whole app in <BrowserRouter> so routing works.
// ============================================================

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/equipment.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)