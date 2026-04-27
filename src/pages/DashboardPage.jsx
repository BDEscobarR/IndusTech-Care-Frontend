import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { maquinariaApi, mantenimientoApi, fallaApi, repuestoApi, reporteApi, usuarioApi } from '../services/api';
import { Cpu, Wrench, AlertTriangle, FileBarChart, Package, Users, Clock, CheckCircle, TrendingUp } from 'lucide-react';

const ESTADO_BADGE = {
    'Programado':    'badge badge-blue',
    'En Proceso':    'badge badge-warning',
    'Completado':    'badge badge-success',
    'Pendiente':     'badge badge-gray',
    'Cancelado':     'badge badge-danger',
    'Abierta':       'badge badge-danger',
    'Cerrada':       'badge badge-success',
};

function getBadge(estado) {
    return <span className={ESTADO_BADGE[estado] || 'badge badge-gray'}>{estado}</span>;
}

function StatCard({ icon: Icon, value, label, sub, color }) {
    return (
        <div className="stat-card">
            <div className="stat-icon" style={{ background: color + '18', color }}>
                <Icon size={22} />
            </div>
            <div>
                <div className="stat-value">{value ?? '—'}</div>
                <div className="stat-label">{label}</div>
                {sub && <div className="stat-sub">{sub}</div>}
            </div>
        </div>
    );
}

function QuickItem({ icon: Icon, label, color, onClick }) {
    return (
        <div className="quick-item" onClick={onClick}>
            <Icon size={26} color={color} />
            <span>{label}</span>
        </div>
    );
}

// ── ADMIN Dashboard ──────────────────────────────────────────────────────────
function AdminDashboard({ setPage }) {
    const [data, setData] = useState({});
    useEffect(() => {
        Promise.allSettled([
            maquinariaApi.getAll(), mantenimientoApi.getAll(),
            fallaApi.getAll(), repuestoApi.getAll(),
            reporteApi.getAll(), usuarioApi.getAll(),
        ]).then(([maq, mant, fal, rep, rept, usr]) => {
            setData({
                maquinarias: maq.value?.data?.length ?? 0,
                mantenimientos: mant.value?.data?.length ?? 0,
                fallas: fal.value?.data?.length ?? 0,
                repuestos: rep.value?.data?.length ?? 0,
                reportes: rept.value?.data?.length ?? 0,
                usuarios: usr.value?.data?.length ?? 0,
                ultimosMant: mant.value?.data?.slice(0, 5) ?? [],
                ultimasFallas: fal.value?.data?.slice(0, 5) ?? [],
                ultimosReportes: rept.value?.data?.slice(0, 5) ?? [],
            });
        });
    }, []);

    return (
        <div>
            <div className="page-header" style={{ marginBottom: 24 }}>
                <div className="page-header-left">
                    <h1>Dashboard</h1>
                    <p>Bienvenido, Administrador</p>
                </div>
            </div>

            <div className="stat-grid">
                <StatCard icon={Cpu}           value={data.maquinarias}    label="Maquinarias"   sub="Activas"          color="#1a56db" />
                <StatCard icon={Wrench}        value={data.mantenimientos}  label="Mantenimientos" sub="Este mes"         color="#0891b2" />
                <StatCard icon={AlertTriangle} value={data.fallas}          label="Fallas"        sub="Este mes"         color="#d97706" />
                <StatCard icon={FileBarChart}  value={data.reportes}        label="Reportes"      sub="Este mes"         color="#7c3aed" />
                <StatCard icon={Package}       value={data.repuestos}       label="Repuestos"     sub="En inventario"    color="#16a34a" />
                <StatCard icon={Users}         value={data.usuarios}        label="Usuarios"      sub="Registrados"      color="#0891b2" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                {/* Mantenimientos recientes */}
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Mantenimientos recientes</span>
                        <span className="see-all" onClick={() => setPage('mantenimientos')}>Ver todos</span>
                    </div>
                    <div className="table-wrap">
                        <table>
                            <thead><tr><th>Maquinaria</th><th>Tipo</th><th>Estado</th></tr></thead>
                            <tbody>
                            {data.ultimosMant?.map((m, i) => (
                                <tr key={i}>
                                    <td className="link">{m.descripcion || `Mant. #${m.idMantenimiento || i + 1}`}</td>
                                    <td><span className="badge badge-blue">{m.tipo || '—'}</span></td>
                                    <td>{getBadge(m.estado || 'Pendiente')}</td>
                                </tr>
                            ))}
                            {!data.ultimosMant?.length && <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 20 }}>Sin datos</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Fallas recientes */}
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Fallas recientes</span>
                        <span className="see-all" onClick={() => setPage('fallas')}>Ver todas</span>
                    </div>
                    <div className="table-wrap">
                        <table>
                            <thead><tr><th>Descripción</th><th>Gravedad</th><th>Estado</th></tr></thead>
                            <tbody>
                            {data.ultimasFallas?.map((f, i) => (
                                <tr key={i}>
                                    <td>{f.descripcion || `Falla #${i + 1}`}</td>
                                    <td><GravedadBadge g={f.gravedad} /></td>
                                    <td>{f.activa ? <span className="badge badge-danger">Abierta</span> : <span className="badge badge-success">Cerrada</span>}</td>
                                </tr>
                            ))}
                            {!data.ultimasFallas?.length && <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 20 }}>Sin datos</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Accesos rápidos */}
            <div className="card">
                <div className="card-header"><span className="card-title">Accesos rápidos</span></div>
                <div className="card-body">
                    <div className="quick-grid">
                        <QuickItem icon={Cpu}           label="Nueva Maquinaria"    color="#1a56db" onClick={() => setPage('maquinarias')} />
                        <QuickItem icon={Wrench}        label="Nuevo Mantenimiento" color="#0891b2" onClick={() => setPage('mantenimientos')} />
                        <QuickItem icon={AlertTriangle} label="Reportar Falla"      color="#d97706" onClick={() => setPage('fallas')} />
                        <QuickItem icon={FileBarChart}  label="Nuevo Reporte"       color="#7c3aed" onClick={() => setPage('reportes')} />
                        <QuickItem icon={Package}       label="Nuevo Repuesto"      color="#16a34a" onClick={() => setPage('repuestos')} />
                        <QuickItem icon={Users}         label="Administrar Usuarios" color="#0891b2" onClick={() => setPage('usuarios')} />
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── TECNICO Dashboard ─────────────────────────────────────────────────────────
function TecnicoDashboard({ setPage }) {
    const { user } = useAuth();
    const [data, setData] = useState({});
    useEffect(() => {
        Promise.allSettled([mantenimientoApi.getAll(), fallaApi.getAll()]).then(([mant, fal]) => {
            const todos = mant.value?.data ?? [];
            setData({
                asignados: todos.length,
                enProceso: todos.filter(m => m.estado === 'En Proceso').length,
                completados: todos.filter(m => m.estado === 'Completado').length,
                pendientes: todos.filter(m => m.estado === 'Pendiente').length,
                fallasReg: fal.value?.data?.length ?? 0,
                mantenimientos: todos.slice(0, 5),
                fallas: fal.value?.data?.slice(0, 4) ?? [],
            });
        });
    }, []);

    return (
        <div>
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Dashboard Técnico</h1>
                    <p>Bienvenido, {user?.nombre}</p>
                </div>
            </div>

            <div className="stat-grid">
                <StatCard icon={Wrench}       value={data.asignados}   label="Asignados a mí"   sub="Mantenimientos"  color="#1a56db" />
                <StatCard icon={Clock}        value={data.enProceso}   label="En Proceso"        sub="Mantenimientos"  color="#d97706" />
                <StatCard icon={CheckCircle}  value={data.completados} label="Completados"       sub="Este mes"        color="#16a34a" />
                <StatCard icon={AlertTriangle}value={data.pendientes}  label="Pendientes"        sub="Por iniciar"     color="#dc2626" />
                <StatCard icon={AlertTriangle}value={data.fallasReg}   label="Fallas Registradas" sub="Este mes"      color="#7c3aed" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Mantenimientos asignados</span>
                        <span className="see-all" onClick={() => setPage('mantenimientos')}>Ver todos</span>
                    </div>
                    <div className="table-wrap">
                        <table>
                            <thead><tr><th>Descripción</th><th>Tipo</th><th>Estado</th></tr></thead>
                            <tbody>
                            {data.mantenimientos?.map((m, i) => (
                                <tr key={i}>
                                    <td className="link">{m.descripcion || `Mantenimiento #${i+1}`}</td>
                                    <td><span className="badge badge-blue">{m.tipo || '—'}</span></td>
                                    <td>{getBadge(m.estado || 'Pendiente')}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Fallas asignadas</span>
                        <span className="see-all" onClick={() => setPage('fallas')}>Ver todas</span>
                    </div>
                    <div className="table-wrap">
                        <table>
                            <thead><tr><th>Descripción</th><th>Prioridad</th><th>Estado</th></tr></thead>
                            <tbody>
                            {data.fallas?.map((f, i) => (
                                <tr key={i}>
                                    <td>{f.descripcion || `Falla #${i+1}`}</td>
                                    <td><GravedadBadge g={f.gravedad} /></td>
                                    <td>{f.activa ? <span className="badge badge-danger">Abierta</span> : <span className="badge badge-success">Cerrada</span>}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header"><span className="card-title">Accesos rápidos</span></div>
                <div className="card-body">
                    <div className="quick-grid">
                        <QuickItem icon={Wrench}        label="Registrar Mantenimiento" color="#1a56db" onClick={() => setPage('mantenimientos')} />
                        <QuickItem icon={AlertTriangle} label="Registrar Falla"         color="#d97706" onClick={() => setPage('fallas')} />
                        <QuickItem icon={Cpu}           label="Ver Maquinarias"         color="#16a34a" onClick={() => setPage('maquinarias')} />
                        <QuickItem icon={Package}       label="Solicitar Repuesto"      color="#7c3aed" onClick={() => setPage('repuestos')} />
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── JEFE Dashboard ────────────────────────────────────────────────────────────
function JefeDashboard({ setPage }) {
    const [data, setData] = useState({});
    useEffect(() => {
        Promise.allSettled([mantenimientoApi.getAll(), fallaApi.getAll()]).then(([mant, fal]) => {
            const todos = mant.value?.data ?? [];
            setData({
                programados: todos.length,
                completados: todos.filter(m => m.estado === 'Completado').length,
                enProceso: todos.filter(m => m.estado === 'En Proceso').length,
                pendientes: todos.filter(m => m.estado === 'Pendiente').length,
                fallasReportadas: fal.value?.data?.length ?? 0,
                proxMantenimientos: todos.slice(0, 5),
                fallasRecientes: fal.value?.data?.slice(0, 5) ?? [],
            });
        });
    }, []);

    return (
        <div>
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Dashboard</h1>
                    <p>Bienvenido, Jefe de Mantenimiento</p>
                </div>
            </div>

            <div className="stat-grid">
                <StatCard icon={Wrench}        value={data.programados}      label="Mantenimientos"   sub="Programados"          color="#1a56db" />
                <StatCard icon={CheckCircle}   value={data.completados}      label="Completados"      sub={`${data.programados ? Math.round(data.completados/data.programados*100) : 0}% del total`} color="#16a34a" />
                <StatCard icon={Clock}         value={data.enProceso}        label="En Proceso"       sub="Del total"            color="#d97706" />
                <StatCard icon={AlertTriangle} value={data.pendientes}       label="Pendientes"       sub="Del total"            color="#dc2626" />
                <StatCard icon={TrendingUp}    value={data.fallasReportadas} label="Fallas Reportadas" sub="Este mes"            color="#7c3aed" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Mantenimientos próximos</span>
                        <span className="see-all" onClick={() => setPage('mantenimientos')}>Ver todos</span>
                    </div>
                    <div className="table-wrap">
                        <table>
                            <thead><tr><th>Descripción</th><th>Tipo</th><th>Estado</th></tr></thead>
                            <tbody>
                            {data.proxMantenimientos?.map((m, i) => (
                                <tr key={i}>
                                    <td className="link">{m.descripcion || `Mantenimiento #${i+1}`}</td>
                                    <td><span className="badge badge-blue">{m.tipo || '—'}</span></td>
                                    <td>{getBadge(m.estado || 'Programado')}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Fallas recientes</span>
                        <span className="see-all" onClick={() => setPage('fallas')}>Ver todas</span>
                    </div>
                    <div className="table-wrap">
                        <table>
                            <thead><tr><th>Descripción</th><th>Gravedad</th><th>Estado</th></tr></thead>
                            <tbody>
                            {data.fallasRecientes?.map((f, i) => (
                                <tr key={i}>
                                    <td>{f.descripcion || `Falla #${i+1}`}</td>
                                    <td><GravedadBadge g={f.gravedad} /></td>
                                    <td>{f.activa ? <span className="badge badge-danger">Abierta</span> : <span className="badge badge-success">Cerrada</span>}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header"><span className="card-title">Accesos rápidos</span></div>
                <div className="card-body">
                    <div className="quick-grid">
                        <QuickItem icon={Wrench}        label="Nuevo Mantenimiento"  color="#1a56db" onClick={() => setPage('mantenimientos')} />
                        <QuickItem icon={Users}         label="Asignar Mantenimiento" color="#0891b2" onClick={() => setPage('mantenimientos')} />
                        <QuickItem icon={AlertTriangle} label="Registrar Falla"      color="#d97706" onClick={() => setPage('fallas')} />
                        <QuickItem icon={FileBarChart}  label="Ver Reportes"         color="#7c3aed" onClick={() => setPage('reportes')} />
                        <QuickItem icon={Package}       label="Gestionar Repuestos"  color="#16a34a" onClick={() => setPage('repuestos')} />
                        <QuickItem icon={Cpu}           label="Ver Maquinarias"      color="#0891b2" onClick={() => setPage('maquinarias')} />
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── CONSULTOR Dashboard ───────────────────────────────────────────────────────
function
ConsultorDashboard({ setPage }) {
    const [data, setData] = useState({});
    useEffect(() => {
        Promise.allSettled([
            maquinariaApi.getAll(), mantenimientoApi.getAll(),
            fallaApi.getAll(), repuestoApi.getAll(),
            reporteApi.getAll(), usuarioApi.getAll(),
        ]).then(([maq, mant, fal, rep, rept, usr]) => {
            setData({
                maquinarias: maq.value?.data?.length ?? 0,
                mantenimientos: mant.value?.data?.length ?? 0,
                fallas: fal.value?.data?.length ?? 0,
                repuestos: rep.value?.data?.length ?? 0,
                reportes: rept.value?.data?.length ?? 0,
                usuarios: usr.value?.data?.length ?? 0,
                ultimosMant: mant.value?.data?.slice(0, 5) ?? [],
                ultimasFallas: fal.value?.data?.slice(0, 5) ?? [],
                ultimosReportes: rept.value?.data?.slice(0, 5) ?? [],
            });
        });
    }, []);

    return (
        <div>
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Dashboard Consultor</h1>
                    <p>Bienvenido, Consultor</p>
                </div>
            </div>

            <div className="stat-grid">
                <StatCard icon={Cpu}           value={data.maquinarias}   label="Maquinarias"   sub="Registradas"   color="#1a56db" />
                <StatCard icon={Wrench}        value={data.mantenimientos} label="Mantenimientos" sub="Este mes"      color="#0891b2" />
                <StatCard icon={AlertTriangle} value={data.fallas}         label="Fallas"        sub="Este mes"      color="#d97706" />
                <StatCard icon={FileBarChart}  value={data.reportes}       label="Reportes"      sub="Este mes"      color="#7c3aed" />
                <StatCard icon={Package}       value={data.repuestos}      label="Repuestos"     sub="En inventario" color="#16a34a" />
                <StatCard icon={Users}         value={data.usuarios}       label="Usuarios"      sub="Registrados"   color="#0891b2" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Mantenimientos recientes</span>
                        <span className="see-all" onClick={() => setPage('mantenimientos')}>Ver todos</span>
                    </div>
                    <div className="table-wrap">
                        <table>
                            <thead><tr><th>Descripción</th><th>Tipo</th><th>Estado</th></tr></thead>
                            <tbody>
                            {data.ultimosMant?.map((m, i) => (
                                <tr key={i}>
                                    <td>{m.descripcion || `Mantenimiento #${i+1}`}</td>
                                    <td><span className="badge badge-blue">{m.tipo || '—'}</span></td>
                                    <td>{getBadge(m.estado || 'Pendiente')}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Fallas recientes</span>
                        <span className="see-all" onClick={() => setPage('fallas')}>Ver todas</span>
                    </div>
                    <div className="table-wrap">
                        <table>
                            <thead><tr><th>Descripción</th><th>Gravedad</th><th>Estado</th></tr></thead>
                            <tbody>
                            {data.ultimasFallas?.map((f, i) => (
                                <tr key={i}>
                                    <td>{f.descripcion || `Falla #${i+1}`}</td>
                                    <td><GravedadBadge g={f.gravedad} /></td>
                                    <td>{f.activa ? <span className="badge badge-danger">Abierta</span> : <span className="badge badge-success">Cerrada</span>}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header"><span className="card-title">Accesos de consulta</span></div>
                <div className="card-body">
                    <div className="quick-grid">
                        <QuickItem icon={Cpu}          label="Ver Maquinarias"   color="#1a56db" onClick={() => setPage('maquinarias')} />
                        <QuickItem icon={Wrench}       label="Ver Mantenimientos" color="#0891b2" onClick={() => setPage('mantenimientos')} />
                        <QuickItem icon={AlertTriangle}label="Ver Fallas"         color="#d97706" onClick={() => setPage('fallas')} />
                        <QuickItem icon={FileBarChart} label="Ver Reportes"       color="#7c3aed" onClick={() => setPage('reportes')} />
                        <QuickItem icon={Package}      label="Ver Repuestos"      color="#16a34a" onClick={() => setPage('repuestos')} />
                        <QuickItem icon={Users}        label="Ver Usuarios"       color="#0891b2" onClick={() => setPage('usuarios')} />
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Gravedad badge helper ─────────────────────────────────────────────────────
function GravedadBadge({ g }) {
    const map = { ALTA: 'badge-danger', MEDIA: 'badge-warning', BAJA: 'badge-success', CRITICA: 'badge-danger' };
    return <span className={`badge ${map[g] || 'badge-gray'}`}>{g || '—'}</span>;
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function DashboardPage({ setPage }) {
    const { user } = useAuth();
    const rol = user?.rol;
    if (rol === 'TECNICO') return <TecnicoDashboard setPage={setPage} />;
    if (rol === 'JEFE_MANTENIMIENTO') return <JefeDashboard setPage={setPage} />;
    if (rol === 'CONSULTOR') return <ConsultorDashboard setPage={setPage} />;
    return <AdminDashboard setPage={setPage} />;
}
