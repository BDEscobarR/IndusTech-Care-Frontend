import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import MaquinariasPage from './pages/MaquinariasPage';
import { MantenimientosPage } from './pages/MantenimientosPage';
import FallasPage from './pages/FallasPage';
import { TecnicosPage } from './pages/TecnicosPage.jsx';
import { RepuestosPage, UsuariosPage, ReportesPage } from './pages/OtherPages';
import './index.css';

function AppContent() {
  const { user } = useAuth();
  const [page, setPage] = useState('dashboard');

  if (!user) return <LoginPage />;

  const PAGES = {
    dashboard:      <DashboardPage setPage={setPage} />,
    maquinarias:    <MaquinariasPage />,
    mantenimientos: <MantenimientosPage />,
    fallas:         <FallasPage />,
    repuestos:      <RepuestosPage />,
    tecnicos:       <TecnicosPage />,
    usuarios:       <UsuariosPage />,
    reportes:       <ReportesPage />,
  };

  return (
      <Layout page={page} setPage={setPage}>
        {PAGES[page] || PAGES.dashboard}
      </Layout>
  );
}

export default function App() {
  return (
      <AuthProvider>
        <AppContent />
      </AuthProvider>
  );
}
