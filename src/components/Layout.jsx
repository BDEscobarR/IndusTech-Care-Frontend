import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Settings2, Wrench, AlertTriangle,
  Package, Users, FileBarChart, ChevronDown, Bell,
  LogOut, Menu, X, Cpu
} from 'lucide-react';

const ROLE_COLORS = {
  ADMIN: '#1a56db',
  JEFE_MANTENIMIENTO: '#0891b2',
  TECNICO: '#16a34a',
  CONSULTOR: '#7c3aed',
};

const ROLE_LABELS = {
  ADMIN: 'Administrador',
  JEFE_MANTENIMIENTO: 'Jefe de Mantenimiento',
  TECNICO: 'Técnico',
  CONSULTOR: 'Consultor',
};

const NAV = [
  { id: 'dashboard',       label: 'Dashboard',        icon: LayoutDashboard, roles: ['ADMIN','JEFE_MANTENIMIENTO','TECNICO','CONSULTOR'] },
  { id: 'maquinarias',     label: 'Maquinarias',       icon: Cpu,             roles: ['ADMIN','JEFE_MANTENIMIENTO','TECNICO','CONSULTOR'] },
  { id: 'mantenimientos',  label: 'Mantenimientos',    icon: Wrench,          roles: ['ADMIN','JEFE_MANTENIMIENTO','TECNICO','CONSULTOR'] },
  { id: 'fallas',          label: 'Fallas',            icon: AlertTriangle,   roles: ['ADMIN','JEFE_MANTENIMIENTO','TECNICO','CONSULTOR'] },
  { id: 'repuestos',       label: 'Repuestos',         icon: Package,         roles: ['ADMIN','JEFE_MANTENIMIENTO','TECNICO','CONSULTOR'] },
  { id: 'reportes',        label: 'Reportes',          icon: FileBarChart,    roles: ['ADMIN','JEFE_MANTENIMIENTO','CONSULTOR'] },
  { id: 'tecnicos',        label: 'Técnicos',          icon: Users,           roles: ['ADMIN','JEFE_MANTENIMIENTO'] },
  { id: 'usuarios',        label: 'Usuarios',          icon: Users,           roles: ['ADMIN'] },
];

export default function Layout({ page, setPage, children }) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);

  const rol = user?.rol || 'ADMIN';
  const color = ROLE_COLORS[rol] || '#1a56db';
  const initials = (user?.nombre || 'U').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const navItems = NAV.filter(n => n.roles.includes(rol));

  return (
    <div className="app-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.4)', zIndex:99 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Settings2 size={18} />
          </div>
          <div className="sidebar-logo-text">
            <strong>INDUSTECH <span style={{ color:'#60a5fa' }}>CARE</span></strong>
            <span>Sistema de Mantenimiento</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${page === item.id ? 'active' : ''}`}
              onClick={() => { setPage(item.id); setSidebarOpen(false); }}
            >
              <item.icon size={17} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            className="nav-item"
            onClick={logout}
            style={{ color: '#f87171' }}
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-btn"
              style={{ border:'none', background:'none' }}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div>
              <div className="topbar-title">
                {NAV.find(n => n.id === page)?.label || 'Dashboard'}
              </div>
            </div>
          </div>

          <div className="topbar-right">
            <button className="icon-btn">
              <Bell size={17} />
              <span className="badge-dot" />
            </button>

            <div style={{ position: 'relative' }}>
              <div className="user-pill" onClick={() => setUserMenu(!userMenu)}>
                <div className="avatar" style={{ background: color }}>
                  {initials}
                </div>
                <div style={{ lineHeight: 1.3 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {user?.nombre || 'Usuario'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {ROLE_LABELS[rol] || rol}
                  </div>
                </div>
                <ChevronDown size={14} color="var(--text-muted)" />
              </div>

              {userMenu && (
                <div style={{
                  position: 'absolute', right: 0, top: '110%',
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 10, boxShadow: 'var(--shadow-md)', minWidth: 160, zIndex: 200,
                }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{user?.nombre}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{ROLE_LABELS[rol]}</div>
                  </div>
                  <button
                    onClick={() => { logout(); setUserMenu(false); }}
                    style={{
                      width: '100%', padding: '10px 16px', border: 'none', background: 'none',
                      display: 'flex', alignItems: 'center', gap: 8,
                      fontSize: 13, color: 'var(--danger)', cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    <LogOut size={14} /> Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page */}
        <main className="page-content" onClick={() => setUserMenu(false)}>
          {children}
        </main>

        <footer style={{ padding: '16px 28px', textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', borderTop: '1px solid var(--border)' }}>
          © 2024 Industech Care. Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
}
