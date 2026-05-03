import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import EquipmentDashboard from './pages/EquipmentDashboard.jsx';
import Navigation from './components/Navigation.jsx';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import './styles/App.css';
import './styles/footer.css';
import './styles/header.css';
import './styles/navigation.css';
import './styles/template.css';

const App = () => {
  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header userProfile={JSON.parse(localStorage.getItem('user') || 'null')} />
        <Navigation role={JSON.parse(localStorage.getItem('user') || '{}')?.role || 'student'} />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/equipment-availability" element={<EquipmentDashboard />} />
            <Route path="/request-equipment" element={<EquipmentDashboard />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
