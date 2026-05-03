import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { alertaApi, fallaApi, mantenimientoApi } from '../services/api';
import {
  LayoutDashboard, Settings2, Wrench, AlertTriangle,
  Package, Users, FileBarChart, ChevronDown, Bell,
  LogOut, Menu, X, Cpu, CheckCircle, AlertCircle, Clock
} from 'lucide-react';

const ROLE_COLORS = {
  ADMIN: '#f5c300',
  JEFE_MANTENIMIENTO: '#60a5fa',
  TECNICO: '#34d399',
  CONSULTOR: '#a78bfa',
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

// ── Panel de notificaciones ────────────────────────────────────────────────────
function NotifPanel({ onClose, setPage }) {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [fallaRes, mantRes] = await Promise.allSettled([
          fallaApi.getAll(),
          mantenimientoApi.getAll(),
        ]);

        const items = [];

        // Fallas activas → notificaciones de alerta
        if (fallaRes.status === 'fulfilled') {
          const fallas = fallaRes.value?.data || fallaRes.value || [];
          fallas.filter(f => f.activa).slice(0, 5).forEach(f => {
            items.push({
              id: `f-${f.idFalla}`,
              tipo: 'falla',
              titulo: `Falla activa — ${f.gravedad}`,
              desc: f.descripcion?.substring(0, 60) + (f.descripcion?.length > 60 ? '...' : ''),
              color: f.gravedad === 'CRITICA' || f.gravedad === 'ALTA' ? '#ef4444' : '#f59e0b',
              icon: AlertCircle,
              page: 'fallas',
            });
          });
        }

        // Mantenimientos activos → notificaciones de info
        if (mantRes.status === 'fulfilled') {
          const mants = mantRes.value?.data || mantRes.value || [];
          mants.filter(m => m.estado === 'ACTIVO').slice(0, 3).forEach(m => {
            items.push({
              id: `m-${m.idMantenimiento}`,
              tipo: 'mantenimiento',
              titulo: `Mantenimiento en curso`,
              desc: m.descripcion?.substring(0, 60) + (m.descripcion?.length > 60 ? '...' : ''),
              color: '#60a5fa',
              icon: Clock,
              page: 'mantenimientos',
            });
          });
          mants.filter(m => m.estado === 'FINALIZADO').slice(0, 2).forEach(m => {
            items.push({
              id: `mf-${m.idMantenimiento}`,
              tipo: 'completado',
              titulo: `Mantenimiento completado`,
              desc: m.descripcion?.substring(0, 60) + (m.descripcion?.length > 60 ? '...' : ''),
              color: '#34d399',
              icon: CheckCircle,
              page: 'mantenimientos',
            });
          });
        }

        setNotifs(items);
      } catch { setNotifs([]); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  return (
      <>
        {/* Overlay */}
        <div style={{ position:'fixed',inset:0,zIndex:299 }} onClick={onClose}/>
        {/* Panel */}
        <div style={{
          position:'absolute', right:0, top:'110%',
          width:360, maxHeight:480, overflowY:'auto',
          background:'#1e1e1e', border:'1px solid #2d2d2d',
          borderRadius:14, boxShadow:'0 8px 32px rgba(0,0,0,.5)',
          zIndex:300,
        }}>
          {/* Header */}
          <div style={{ padding:'14px 16px', borderBottom:'1px solid #2d2d2d', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ fontWeight:700, fontSize:14, color:'#f0f0f0' }}>Notificaciones</div>
            <span style={{ fontSize:11, color:'#666' }}>{notifs.length} pendientes</span>
          </div>

          {/* Items */}
          {loading ? (
              <div style={{ padding:24, textAlign:'center', color:'#555', fontSize:13 }}>Cargando...</div>
          ) : notifs.length === 0 ? (
              <div style={{ padding:32, textAlign:'center', color:'#555' }}>
                <div style={{ fontSize:28, marginBottom:8 }}>✅</div>
                <div style={{ fontSize:13 }}>Sin notificaciones pendientes</div>
              </div>
          ) : notifs.map(n => {
            const Icon = n.icon;
            return (
                <div key={n.id}
                     onClick={() => { setPage(n.page); onClose(); }}
                     style={{
                       display:'flex', gap:12, padding:'12px 16px',
                       borderBottom:'1px solid #252525', cursor:'pointer',
                       transition:'background .15s',
                     }}
                     onMouseEnter={e => e.currentTarget.style.background='#252525'}
                     onMouseLeave={e => e.currentTarget.style.background='transparent'}
                >
                  <div style={{ width:36, height:36, borderRadius:10, background:n.color+'22', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Icon size={16} color={n.color}/>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12, fontWeight:600, color:'#f0f0f0', marginBottom:3 }}>{n.titulo}</div>
                    <div style={{ fontSize:11, color:'#666', lineHeight:1.5, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{n.desc}</div>
                  </div>
                </div>
            );
          })}

          {notifs.length > 0 && (
              <div style={{ padding:'10px 16px', borderTop:'1px solid #2d2d2d' }}>
                <button onClick={() => { setPage('fallas'); onClose(); }}
                        style={{ width:'100%', padding:'8px', borderRadius:8, border:'1px solid #2d2d2d', background:'transparent', color:'#f5c300', fontSize:12, fontWeight:600, cursor:'pointer' }}>
                  Ver todas las alertas
                </button>
              </div>
          )}
        </div>
      </>
  );
}

export default function Layout({ page, setPage, children }) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenu, setUserMenu]       = useState(false);
  const [notifOpen, setNotifOpen]     = useState(false);
  const [notifCount, setNotifCount]   = useState(0);

  const rol      = user?.rol || 'ADMIN';
  const color    = ROLE_COLORS[rol] || '#f5c300';
  const initials = (user?.nombre || 'U').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const navItems = NAV.filter(n => n.roles.includes(rol));

  // Cargar conteo de notificaciones
  useEffect(() => {
    const loadCount = async () => {
      try {
        const r = await fallaApi.getAll();
        const fallas = r?.data || r || [];
        setNotifCount(fallas.filter(f => f.activa).length);
      } catch { setNotifCount(0); }
    };
    loadCount();
  }, []);

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
              <div style={{ position:'relative' }}>
                <button className="icon-btn" onClick={() => { setNotifOpen(!notifOpen); setUserMenu(false); }}>
                  <Bell size={17} />
                  {notifCount > 0 && <span className="badge-dot" />}
                </button>
                {notifOpen && <NotifPanel onClose={() => setNotifOpen(false)} setPage={setPage}/>}
              </div>

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
          <main className="page-content" onClick={() => { setUserMenu(false); setNotifOpen(false); }}>
            {children}
          </main>

          <footer style={{ padding: '16px 28px', textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', borderTop: '1px solid var(--border)' }}>
            © 2024 Industech Care. Todos los derechos reservados.
          </footer>
        </div>
      </div>
  );
}
