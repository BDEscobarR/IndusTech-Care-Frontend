// ════════════════════════════════════════════════════════════════════════════
// RepuestosPage — fix: stock usa stockDisponible del backend
// ════════════════════════════════════════════════════════════════════════════
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { repuestoApi, reporteApi, usuarioApi, maquinariaApi, mantenimientoApi, fallaApi } from '../services/api';
import { Plus, Search, Pencil, Trash2, FileBarChart, Eye as EyeIcon } from 'lucide-react';

function RepuestoModal({ item, onClose, onSave }) {
    const isEdit = !!item?.idRepuesto;
    const [form, setForm] = useState(item || {
        nombre:'', codigo:'', categoria:'', marca:'',
        stockDisponible:0, stockMinimo:0, unidad:'Unidad', descripcion:'', proveedor:''
    });
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');
    const f = k => e => setForm({ ...form, [k]: e.target.value });

    const handleSave = async () => {
        if (!form.nombre) { setErr('El nombre es requerido'); return; }
        setLoading(true);
        try {
            if (isEdit) await repuestoApi.update(form.idRepuesto, form);
            else await repuestoApi.create(form);
            onSave();
        } catch { setErr('Error al guardar'); } finally { setLoading(false); }
    };

    return (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
            <div className="modal">
                <div className="modal-header">
                    <span className="modal-title">{isEdit?'Editar Repuesto':'Nuevo Repuesto'}</span>
                    <button className="btn btn-secondary btn-icon" onClick={onClose}>✕</button>
                </div>
                <div className="modal-body">
                    {err && <div style={{ background:'#fee2e2',color:'#dc2626',padding:'8px 12px',borderRadius:8,marginBottom:12,fontSize:13 }}>{err}</div>}
                    <div className="form-row">
                        <div className="form-group"><label className="form-label">Código</label><input className="form-input" value={form.codigo||''} onChange={f('codigo')} placeholder="REP-001"/></div>
                        <div className="form-group"><label className="form-label">Nombre <span className="req">*</span></label><input className="form-input" value={form.nombre} onChange={f('nombre')}/></div>
                    </div>
                    <div className="form-row">
                        <div className="form-group"><label className="form-label">Categoría</label><input className="form-input" value={form.categoria||''} onChange={f('categoria')}/></div>
                        <div className="form-group"><label className="form-label">Marca</label><input className="form-input" value={form.marca||''} onChange={f('marca')}/></div>
                    </div>
                    <div className="form-row">
                        {/* FIX: campo stockDisponible en vez de stock */}
                        <div className="form-group"><label className="form-label">Stock disponible</label><input type="number" className="form-input" value={form.stockDisponible||0} onChange={f('stockDisponible')}/></div>
                        <div className="form-group"><label className="form-label">Stock mínimo</label><input type="number" className="form-input" value={form.stockMinimo||0} onChange={f('stockMinimo')}/></div>
                    </div>
                    <div className="form-row">
                        <div className="form-group"><label className="form-label">Unidad</label><input className="form-input" value={form.unidad||'Unidad'} onChange={f('unidad')}/></div>
                        <div className="form-group"><label className="form-label">Proveedor</label><input className="form-input" value={form.proveedor||''} onChange={f('proveedor')}/></div>
                    </div>
                    <div className="form-group"><label className="form-label">Descripción</label><textarea className="form-textarea" value={form.descripcion||''} onChange={f('descripcion')}/></div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                    <button className="btn btn-primary" onClick={handleSave} disabled={loading}>{loading?'Guardando...':'Guardar'}</button>
                </div>
            </div>
        </div>
    );
}

export function RepuestosPage() {
    const { user } = useAuth();
    const canEdit = ['ADMIN','JEFE_MANTENIMIENTO'].includes(user?.rol);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState(null);
    const [page, setPage] = useState(1);
    const PER = 10;

    const load = async () => {
        setLoading(true);
        try { const r = await repuestoApi.getAll(); setItems(r.data||[]); }
        catch { setItems([]); } finally { setLoading(false); }
    };
    useEffect(()=>{ load(); },[]);

    const filtered = items.filter(r => !search ||
        r.nombre?.toLowerCase().includes(search.toLowerCase()) ||
        r.codigo?.toLowerCase().includes(search.toLowerCase()));
    const totalPages = Math.ceil(filtered.length/PER);
    const paged = filtered.slice((page-1)*PER, page*PER);

    // FIX: usa stockDisponible (campo real del backend)
    const getEstadoBadge = (r) => {
        const stock = r.stockDisponible ?? r.stock ?? 0;
        const minimo = r.stockMinimo ?? 0;
        if (!stock || stock === 0) return <span className="badge badge-danger">Sin stock</span>;
        if (minimo && stock <= minimo) return <span className="badge badge-warning">Stock bajo</span>;
        return <span className="badge badge-success">Disponible</span>;
    };

    return (
        <div>
            <div className="page-header">
                <div className="page-header-left"><h1>Repuestos</h1><p>Consulta y gestiona los repuestos disponibles en el inventario.</p></div>
                {canEdit && <button className="btn btn-primary" onClick={()=>setModal('new')}><Plus size={16}/>Nuevo Repuesto</button>}
            </div>
            <div className="card">
                <div className="card-body" style={{ paddingBottom:0 }}>
                    <div className="filter-row">
                        <div className="search-bar" style={{ flex:1 }}><Search size={15}/><input placeholder="Buscar por código o nombre..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}/></div>
                    </div>
                </div>
                <div className="table-wrap">
                    <table>
                        <thead><tr><th>#</th><th>Código</th><th>Nombre</th><th>Categoría</th><th>Marca</th><th>Stock disponible</th><th>Stock mínimo</th><th>Unidad</th><th>Estado</th><th>Acción</th></tr></thead>
                        <tbody>
                        {loading && <tr><td colSpan={10} style={{ textAlign:'center',padding:30,color:'var(--text-muted)' }}>Cargando...</td></tr>}
                        {!loading && paged.map((r,i)=>(
                            <tr key={r.idRepuesto||i}>
                                <td style={{ fontSize:12,color:'var(--text-muted)' }}>{(page-1)*PER+i+1}</td>
                                <td><span className="badge badge-blue" style={{ fontFamily:'monospace' }}>{r.codigo||'—'}</span></td>
                                <td style={{ fontWeight:500 }}>{r.nombre}</td>
                                <td>{r.categoria||'—'}</td>
                                <td>{r.marca||'—'}</td>
                                <td style={{ fontWeight:700, color: (r.stockDisponible??r.stock??0) === 0 ? 'var(--danger)' : 'inherit' }}>
                                    {r.stockDisponible ?? r.stock ?? 0}
                                </td>
                                <td>{r.stockMinimo ?? 0}</td>
                                <td>{r.unidad||r.unidadMedida||'Unidad'}</td>
                                <td>{getEstadoBadge(r)}</td>
                                <td>
                                    {canEdit && <div style={{ display:'flex',gap:6 }}>
                                        <button className="btn btn-secondary btn-icon" onClick={()=>setModal(r)}><Pencil size={14}/></button>
                                        <button className="btn btn-danger btn-icon" onClick={async()=>{if(confirm('¿Eliminar?'))await repuestoApi.delete(r.idRepuesto).then(load);}}><Trash2 size={14}/></button>
                                    </div>}
                                </td>
                            </tr>
                        ))}
                        {!loading && !paged.length && <tr><td colSpan={10} style={{ textAlign:'center',padding:30,color:'var(--text-muted)' }}>Sin resultados</td></tr>}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                    <div style={{ padding:'14px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',borderTop:'1px solid var(--border)' }}>
                        <span className="page-info">Mostrando {(page-1)*PER+1}–{Math.min(page*PER,filtered.length)} de {filtered.length}</span>
                        <div className="pagination">
                            <button className="page-btn" onClick={()=>setPage(p=>Math.max(1,p-1))}>‹</button>
                            {Array.from({length:totalPages},(_,i)=><button key={i} className={`page-btn ${page===i+1?'active':''}`} onClick={()=>setPage(i+1)}>{i+1}</button>)}
                            <button className="page-btn" onClick={()=>setPage(p=>Math.min(totalPages,p+1))}>›</button>
                        </div>
                    </div>
                )}
            </div>
            {modal && <RepuestoModal item={modal==='new'?null:modal} onClose={()=>setModal(null)} onSave={()=>{setModal(null);load();}}/>}
        </div>
    );
}

// ════════════════════════════════════════════════════════════════════════════
// TecnicosPage — FIX: eliminar botón "Nuevo Técnico" (se gestiona desde Usuarios)
// ════════════════════════════════════════════════════════════════════════════
/*export function TecnicosPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const AC = ['#1a56db','#0d9488','#9333ea','#dc2626','#b45309','#0891b2','#16a34a'];
    const initials = n => (n||'?').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();

    const load = async () => {
        setLoading(true);
        try { const r = await usuarioApi.getTecnicos(); setItems(r.data||[]); }
        catch { setItems([]); } finally { setLoading(false); }
    };
    useEffect(()=>{ load(); },[]);

    const filtered = items.filter(t => !search ||
        t.nombre?.toLowerCase().includes(search.toLowerCase()) ||
        t.especialidad?.toLowerCase().includes(search.toLowerCase()));

    const stats = {
        total: items.length,
        disponibles: items.filter(t => t.disponible).length,
        ocupados: items.filter(t => !t.disponible).length,
    };

    return (
        <div>
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Técnicos</h1>
                    <p>Usuarios con rol Técnico — gestión desde la sección Usuarios.</p>
                </div>
                {/!* FIX: botón eliminado — técnicos se crean desde Usuarios con rol TECNICO *!/}
            </div>

            {/!* Stats *!/}
            <div style={{ display:'flex',gap:12,marginBottom:20,flexWrap:'wrap' }}>
                {[['Total',stats.total,'#1a56db'],['Disponibles',stats.disponibles,'#16a34a'],['Ocupados',stats.ocupados,'#d97706']].map(([l,v,c])=>(
                    <div key={l} style={{ background:'#fff',border:'1px solid #e2e8f0',borderRadius:12,padding:'14px 20px',display:'flex',alignItems:'center',gap:12 }}>
                        <div style={{ fontSize:24,fontWeight:900,color:c }}>{v}</div>
                        <div style={{ fontSize:12,color:'#64748b' }}>{l}</div>
                    </div>
                ))}
            </div>

            {/!* Búsqueda *!/}
            <div className="search-bar" style={{ marginBottom:20 }}>
                <Search size={15}/>
                <input placeholder="Buscar por nombre o especialidad..." value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>

            {loading ? <div style={{ textAlign:'center',padding:40,color:'var(--text-muted)' }}>Cargando...</div> : (
                <>
                    {filtered.length === 0 && <div style={{ textAlign:'center',padding:40,color:'var(--text-muted)' }}>Sin técnicos</div>}
                    <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:16 }}>
                        {filtered.map((t,i)=>(
                            <div key={t.idUsuario||i} style={{ background:'#fff',border:'1px solid #e2e8f0',borderRadius:16,padding:20,boxShadow:'0 1px 3px rgba(0,0,0,.06)' }}>
                                <div style={{ display:'flex',alignItems:'flex-start',gap:14,marginBottom:14 }}>
                                    <div style={{ width:50,height:50,borderRadius:'50%',background:AC[i%AC.length]+'20',color:AC[i%AC.length],display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:15,flexShrink:0 }}>
                                        {initials(t.nombre)}
                                    </div>
                                    <div style={{ flex:1 }}>
                                        <div style={{ fontWeight:800,fontSize:15,color:'#0f172a',marginBottom:3 }}>{t.nombre}</div>
                                        <div style={{ fontSize:12,color:'#64748b' }}>🔧 {t.especialidad||'Sin especialidad'}</div>
                                    </div>
                                </div>
                                <div style={{ display:'flex',alignItems:'center',gap:8,flexWrap:'wrap' }}>
                  <span className={`badge ${t.disponible?'badge-success':'badge-danger'}`}>
                    {t.disponible ? '✓ Disponible' : '× Ocupado'}
                  </span>
                                    <span style={{ background:'#f0f4ff',color:'#1a56db',fontSize:11,fontWeight:600,padding:'2px 8px',borderRadius:20 }}>
                    USR-{String(t.idUsuario||0).padStart(3,'0')}
                  </span>
                                </div>
                                {t.telefono && <div style={{ marginTop:10,fontSize:12,color:'#475569' }}>📞 {t.telefono}</div>}
                                {t.direccion && <div style={{ fontSize:12,color:'#94a3b8',marginTop:4 }}>📍 {t.direccion}</div>}
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop:16,fontSize:12,color:'#94a3b8' }}>
                        💡 Para crear un nuevo técnico ve a <strong>Usuarios</strong> y selecciona el rol "Técnico".
                    </div>
                </>
            )}
        </div>
    );
}*/

// ════════════════════════════════════════════════════════════════════════════
// UsuariosPage — FIX: mostrar campo especialidad cuando rol = TECNICO
// ════════════════════════════════════════════════════════════════════════════
const ROLES = ['ADMIN','JEFE_MANTENIMIENTO','TECNICO','CONSULTOR'];
const ROLE_LABELS = { ADMIN:'Administrador', JEFE_MANTENIMIENTO:'Jefe de Mantenimiento', TECNICO:'Técnico', CONSULTOR:'Consultor' };
const ESPECIALIDADES = ['Mecánica Industrial','Electricidad','Hidráulica y Neumática','Soldadura Industrial','Instrumentación','Electrónica','Refrigeración','Otro'];

function UsuarioModal({ item, onClose, onSave }) {
    const isEdit = !!item?.idUsuario;
    const [form, setForm] = useState(item || { nombre:'', direccion:'', telefono:'', rol:'TECNICO', contrasena:'', especialidad:'' });
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');
    const f = k => e => setForm({ ...form, [k]: e.target.value });

    const handleSave = async () => {
        if (!form.nombre) { setErr('El nombre es requerido'); return; }
        if (!isEdit && !form.contrasena) { setErr('La contraseña es requerida'); return; }
        setLoading(true);
        try {
            if (isEdit) await usuarioApi.update(form.idUsuario, form);
            else await usuarioApi.create(form);
            onSave();
        } catch(e) { setErr(e.response?.data?.message || 'Error al guardar'); } finally { setLoading(false); }
    };

    return (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
            <div className="modal" style={{ maxWidth:540 }}>
                <div className="modal-header">
                    <span className="modal-title">{isEdit?'Editar Usuario':'Crear nuevo usuario'}</span>
                    <button className="btn btn-secondary btn-icon" onClick={onClose}>✕</button>
                </div>
                <div className="modal-body">
                    {err && <div style={{ background:'#fee2e2',color:'#dc2626',padding:'8px 12px',borderRadius:8,marginBottom:12,fontSize:13 }}>{err}</div>}

                    <div className="form-group">
                        <label className="form-label">Nombre completo <span className="req">*</span></label>
                        <input className="form-input" value={form.nombre} onChange={f('nombre')} placeholder="Nombre completo"/>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Rol <span className="req">*</span></label>
                            <select className="form-select" value={form.rol} onChange={f('rol')}>
                                {ROLES.map(r=><option key={r} value={r}>{ROLE_LABELS[r]||r}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Teléfono</label>
                            <input className="form-input" value={form.telefono||''} onChange={f('telefono')} placeholder="310-555-0000"/>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Dirección</label>
                        <input className="form-input" value={form.direccion||''} onChange={f('direccion')} placeholder="Ciudad, Dirección"/>
                    </div>

                    {/* FIX: especialidad solo aparece cuando el rol es TECNICO */}
                    {form.rol === 'TECNICO' && (
                        <div className="form-group">
                            <label className="form-label">Especialidad técnica <span className="req">*</span></label>
                            <select className="form-select" value={form.especialidad||''} onChange={f('especialidad')}>
                                <option value="">Seleccione especialidad</option>
                                {ESPECIALIDADES.map(e=><option key={e}>{e}</option>)}
                            </select>
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">
                            Contraseña {!isEdit && <span className="req">*</span>}
                            {isEdit && <span style={{ fontSize:11,color:'var(--text-muted)',fontWeight:400 }}> (dejar vacío para no cambiar)</span>}
                        </label>
                        <div style={{ position:'relative' }}>
                            <input className="form-input" type={show?'text':'password'} value={form.contrasena||''} onChange={f('contrasena')}
                                   placeholder={isEdit?'••••••••':'Contraseña de acceso'} style={{ paddingRight:44 }}/>
                            <button type="button" onClick={()=>setShow(!show)}
                                    style={{ position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#94a3b8' }}>
                                {show?'🙈':'👁'}
                            </button>
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                    <button className="btn btn-primary" onClick={handleSave} disabled={loading}>{loading?'Guardando...':'Guardar usuario'}</button>
                </div>
            </div>
        </div>
    );
}

export function UsuariosPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null);
    const [search, setSearch] = useState('');
    const AC = ['#1a56db','#0d9488','#9333ea','#dc2626','#b45309'];
    const initials = n => (n||'?').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();

    const load = async () => {
        setLoading(true);
        try { const r = await usuarioApi.getAll(); setItems(r.data||[]); }
        catch { setItems([]); } finally { setLoading(false); }
    };
    useEffect(()=>{ load(); },[]);

    const filtered = items.filter(u => !search || u.nombre?.toLowerCase().includes(search.toLowerCase()) || u.rol?.toLowerCase().includes(search.toLowerCase()));

    return (
        <div>
            <div className="page-header">
                <div className="page-header-left"><h1>Usuarios</h1><p>Gestiona los usuarios y sus roles en el sistema.</p></div>
                <button className="btn btn-primary" onClick={()=>setModal('new')}><Plus size={16}/>Crear Usuario</button>
            </div>
            <div className="card">
                <div className="card-body" style={{ paddingBottom:0 }}>
                    <div className="search-bar"><Search size={15}/><input placeholder="Buscar por nombre o rol..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
                </div>
                <div className="table-wrap" style={{ marginTop:16 }}>
                    <table>
                        <thead><tr><th>Usuario</th><th>Especialidad</th><th>Dirección</th><th>Teléfono</th><th>Rol</th><th>Acción</th></tr></thead>
                        <tbody>
                        {loading && <tr><td colSpan={6} style={{ textAlign:'center',padding:30,color:'var(--text-muted)' }}>Cargando...</td></tr>}
                        {!loading && filtered.map((u,i)=>(
                            <tr key={u.idUsuario||i}>
                                <td>
                                    <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                                        <div style={{ width:34,height:34,borderRadius:'50%',background:AC[i%AC.length]+'20',color:AC[i%AC.length],display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:12,flexShrink:0 }}>
                                            {initials(u.nombre)}
                                        </div>
                                        <span style={{ fontWeight:600 }}>{u.nombre}</span>
                                    </div>
                                </td>
                                <td style={{ fontSize:13,color:'var(--text-secondary)' }}>{u.especialidad||'—'}</td>
                                <td>{u.direccion||'—'}</td>
                                <td>{u.telefono||'—'}</td>
                                <td><span className="badge badge-blue">{ROLE_LABELS[u.rol]||u.rol}</span></td>
                                <td>
                                    <div style={{ display:'flex',gap:6 }}>
                                        <button className="btn btn-secondary btn-icon" onClick={()=>setModal(u)}><Pencil size={14}/></button>
                                        <button className="btn btn-danger btn-icon" onClick={async()=>{if(confirm('¿Eliminar usuario?'))await usuarioApi.delete(u.idUsuario).then(load);}}><Trash2 size={14}/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {!loading && !filtered.length && <tr><td colSpan={6} style={{ textAlign:'center',padding:30,color:'var(--text-muted)' }}>Sin usuarios</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
            {modal && <UsuarioModal item={modal==='new'?null:modal} onClose={()=>setModal(null)} onSave={()=>{setModal(null);load();}}/>}
        </div>
    );
}

// ════════════════════════════════════════════════════════════════════════════
// ReportesPage — reportes dinámicos con estadísticas reales por tipo
// ════════════════════════════════════════════════════════════════════════════

const TIPOS_REPORTE = [
    { value:'Maquinaria',      label:'🏭 Maquinaria',      desc:'Estado y estadísticas de todas las maquinarias' },
    { value:'Mantenimientos',  label:'🔧 Mantenimientos',   desc:'Resumen de mantenimientos preventivos y correctivos' },
    { value:'Fallas',          label:'⚠️ Fallas',           desc:'Registro de fallas activas y cerradas' },
    { value:'Inventario',      label:'📦 Inventario',       desc:'Estado del stock de repuestos' },
];

// ── Sección de estadísticas del reporte ───────────────────────────────────────
function StatRow({ label, value, color }) {
    return (
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid #f1f5f9' }}>
            <span style={{ fontSize:13,color:'#475569' }}>{label}</span>
            <span style={{ fontWeight:800,fontSize:16,color: color||'#0f172a' }}>{value ?? '—'}</span>
        </div>
    );
}

// ── Modal generar reporte con datos reales ────────────────────────────────────
function ReporteModal({ onClose, onSave, usuario }) {
    const [tipo,     setTipo]     = useState('Maquinaria');
    const [titulo,   setTitulo]   = useState('');
    const [periodo,  setPeriodo]  = useState('');
    const [desc,     setDesc]     = useState('');
    const [stats,    setStats]    = useState(null);
    const [loadingS, setLoadingS] = useState(false);
    const [saving,   setSaving]   = useState(false);
    const [err,      setErr]      = useState('');

    // Carga las estadísticas cuando cambia el tipo
    useEffect(() => {
        const cargar = async () => {
            setLoadingS(true); setStats(null);
            try {
                if (tipo === 'Maquinaria') {
                    const r = await maquinariaApi.getAll();
                    const data = r.data || [];
                    setStats({
                        tipo: 'Maquinaria',
                        rows: [
                            { label:'Total maquinarias',             value: data.length,                                              color:'#1a56db' },
                            { label:'Operativas',                    value: data.filter(m=>m.estado==='OPERATIVO').length,           color:'#16a34a' },
                            { label:'En reparación',                 value: data.filter(m=>m.estado==='EN_REPARACION').length,       color:'#d97706' },
                            { label:'Fuera de servicio',             value: data.filter(m=>m.estado==='FUERA_DE_SERVICIO').length,   color:'#dc2626' },
                            { label:'Inactivas',                     value: data.filter(m=>m.estado==='INACTIVO').length,            color:'#94a3b8' },
                        ],
                        lista: data.map(m => `${m.codigo} — ${m.nombre} (${m.estado})`),
                    });
                } else if (tipo === 'Mantenimientos') {
                    const r = await mantenimientoApi.getAll();
                    const data = r.data || [];
                    setStats({
                        tipo: 'Mantenimientos',
                        rows: [
                            { label:'Total mantenimientos',  value: data.length,                                         color:'#1a56db' },
                            { label:'Activos',               value: data.filter(m=>m.estado==='ACTIVO').length,          color:'#d97706' },
                            { label:'Finalizados',           value: data.filter(m=>m.estado==='FINALIZADO').length,      color:'#16a34a' },
                            { label:'Cancelados',            value: data.filter(m=>m.estado==='CANCELADO').length,       color:'#dc2626' },
                            { label:'Preventivos',           value: data.filter(m=>m.tipo==='Preventivo').length,        color:'#0891b2' },
                            { label:'Correctivos',           value: data.filter(m=>m.tipo==='Correctivo').length,        color:'#7c3aed' },
                        ],
                        lista: data.slice(0,10).map(m => `MTO-${String(m.idMantenimiento).padStart(3,'0')} — ${m.descripcion||'Sin descripción'} (${m.estado})`),
                    });
                } else if (tipo === 'Fallas') {
                    const r = await fallaApi.getAll();
                    const data = r.data || [];
                    setStats({
                        tipo: 'Fallas',
                        rows: [
                            { label:'Total fallas',          value: data.length,                                    color:'#1a56db' },
                            { label:'Abiertas / Activas',    value: data.filter(f=>f.activa).length,                color:'#dc2626' },
                            { label:'Cerradas / Resueltas',  value: data.filter(f=>!f.activa).length,               color:'#16a34a' },
                            { label:'Gravedad Alta',         value: data.filter(f=>f.gravedad==='ALTA').length,     color:'#dc2626' },
                            { label:'Gravedad Crítica',      value: data.filter(f=>f.gravedad==='CRITICA').length,  color:'#7f1d1d' },
                            { label:'Gravedad Media',        value: data.filter(f=>f.gravedad==='MEDIA').length,    color:'#d97706' },
                            { label:'Gravedad Baja',         value: data.filter(f=>f.gravedad==='BAJA').length,     color:'#16a34a' },
                        ],
                        lista: data.slice(0,10).map(f => `FAL-${String(f.idFalla).padStart(3,'0')} — ${f.descripcion} (${f.activa?'Abierta':'Cerrada'})`),
                    });
                } else if (tipo === 'Inventario') {
                    const r = await repuestoApi.getAll();
                    const data = r.data || [];
                    const conStock    = data.filter(r => (r.stockDisponible??r.stock??0) > 0);
                    const stockBajo   = data.filter(r => { const s=r.stockDisponible??r.stock??0; return s>0 && r.stockMinimo && s<=r.stockMinimo; });
                    const sinStock    = data.filter(r => (r.stockDisponible??r.stock??0) === 0);
                    setStats({
                        tipo: 'Inventario',
                        rows: [
                            { label:'Total repuestos',      value: data.length,         color:'#1a56db' },
                            { label:'Con stock disponible', value: conStock.length,     color:'#16a34a' },
                            { label:'Stock bajo',           value: stockBajo.length,    color:'#d97706' },
                            { label:'Sin stock',            value: sinStock.length,     color:'#dc2626' },
                        ],
                        lista: data.map(r => `${r.codigo||'—'} — ${r.nombre} | Stock: ${r.stockDisponible??r.stock??0} ${r.unidad||'uds'}`),
                    });
                }
            } catch { setStats(null); } finally { setLoadingS(false); }
        };
        cargar();
    }, [tipo]);

    const handleGenerar = async () => {
        if (!titulo) { setErr('El título es requerido'); return; }
        setSaving(true); setErr('');
        try {
            const resumen = stats?.rows?.map(r=>`${r.label}: ${r.value}`).join(' | ') || '';
            await reporteApi.create({
                titulo,
                tipo,
                descripcion: desc || resumen,
                periodo,
                idUsuario: usuario?.id || usuario?.idUsuario,
                fecha: new Date().toISOString().slice(0,10),
                estado: 'ABIERTO',
            });
            onSave();
        } catch(e) {
            setErr(e.response?.data?.message || 'Error al guardar el reporte');
        } finally { setSaving(false); }
    };

    const tipoInfo = TIPOS_REPORTE.find(t=>t.value===tipo);

    return (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
            <div className="modal" style={{ maxWidth:700 }}>
                <div className="modal-header">
                    <span className="modal-title">Generar Nuevo Reporte</span>
                    <button className="btn btn-secondary btn-icon" onClick={onClose}>✕</button>
                </div>
                <div className="modal-body">
                    {err && <div style={{ background:'#fee2e2',color:'#dc2626',padding:'8px 12px',borderRadius:8,marginBottom:12,fontSize:13 }}>{err}</div>}

                    {/* Selector de tipo */}
                    <div className="form-group">
                        <label className="form-label">Tipo de reporte <span className="req">*</span></label>
                        <div style={{ display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10,marginTop:6 }}>
                            {TIPOS_REPORTE.map(t=>(
                                <div key={t.value}
                                     onClick={()=>setTipo(t.value)}
                                     style={{
                                         padding:'12px 14px', borderRadius:10, cursor:'pointer',
                                         border: `2px solid ${tipo===t.value ? '#1a56db' : '#e2e8f0'}`,
                                         background: tipo===t.value ? '#eff6ff' : '#fff',
                                         transition:'all .15s',
                                     }}>
                                    <div style={{ fontWeight:700,fontSize:13,color: tipo===t.value?'#1a56db':'#0f172a' }}>{t.label}</div>
                                    <div style={{ fontSize:11,color:'#64748b',marginTop:3 }}>{t.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Estadísticas del tipo seleccionado */}
                    <div style={{ background:'#f8fafc',borderRadius:12,padding:16,marginBottom:16,border:'1px solid #e2e8f0' }}>
                        <div style={{ fontWeight:700,fontSize:13,color:'#0f172a',marginBottom:12 }}>
                            📊 Vista previa — {tipoInfo?.label}
                        </div>
                        {loadingS ? (
                            <div style={{ textAlign:'center',padding:20,color:'#94a3b8',fontSize:13 }}>Cargando datos...</div>
                        ) : stats ? (
                            <>
                                {stats.rows.map(r=><StatRow key={r.label} label={r.label} value={r.value} color={r.color}/>)}
                                {stats.lista?.length > 0 && (
                                    <details style={{ marginTop:12 }}>
                                        <summary style={{ fontSize:12,color:'#64748b',cursor:'pointer' }}>Ver detalle ({stats.lista.length} registros)</summary>
                                        <div style={{ marginTop:8,maxHeight:120,overflowY:'auto' }}>
                                            {stats.lista.map((item,i)=>(
                                                <div key={i} style={{ fontSize:11,color:'#475569',padding:'3px 0',borderBottom:'1px solid #f1f5f9' }}>{item}</div>
                                            ))}
                                        </div>
                                    </details>
                                )}
                            </>
                        ) : (
                            <div style={{ textAlign:'center',padding:16,color:'#94a3b8',fontSize:13 }}>Sin datos disponibles</div>
                        )}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Título <span className="req">*</span></label>
                            <input className="form-input" value={titulo} onChange={e=>setTitulo(e.target.value)} placeholder={`Reporte de ${tipo} — ${new Date().toLocaleDateString('es-CO',{month:'long',year:'numeric'})}`}/>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Período</label>
                            <input className="form-input" value={periodo} onChange={e=>setPeriodo(e.target.value)} placeholder="Ej. Abril 2025"/>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Descripción (opcional)</label>
                        <textarea className="form-textarea" value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Observaciones adicionales del reporte..."/>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                    <button className="btn btn-primary" onClick={handleGenerar} disabled={saving||loadingS}>
                        {saving ? 'Guardando...' : '📊 Generar Reporte'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Vista de detalle de reporte ───────────────────────────────────────────────
function ReporteDetail({ reporte, onClose }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargar = async () => {
            setLoading(true);
            try {
                let data = [], rows = [], lista = [];
                if (reporte.tipo === 'Maquinaria') {
                    const r = await maquinariaApi.getAll(); data = r.data||[];
                    rows = [
                        { label:'Total',          value:data.length,                                             color:'#1a56db' },
                        { label:'Operativas',     value:data.filter(m=>m.estado==='OPERATIVO').length,           color:'#16a34a' },
                        { label:'En reparación',  value:data.filter(m=>m.estado==='EN_REPARACION').length,       color:'#d97706' },
                        { label:'Fuera servicio', value:data.filter(m=>m.estado==='FUERA_DE_SERVICIO').length,   color:'#dc2626' },
                        { label:'Inactivas',      value:data.filter(m=>m.estado==='INACTIVO').length,            color:'#94a3b8' },
                    ];
                    lista = data.map(m=>`${m.codigo} — ${m.nombre} (${m.estado})`);
                } else if (reporte.tipo === 'Mantenimientos') {
                    const r = await mantenimientoApi.getAll(); data = r.data||[];
                    rows = [
                        { label:'Total',         value:data.length,                                        color:'#1a56db' },
                        { label:'Activos',       value:data.filter(m=>m.estado==='ACTIVO').length,         color:'#d97706' },
                        { label:'Finalizados',   value:data.filter(m=>m.estado==='FINALIZADO').length,     color:'#16a34a' },
                        { label:'Preventivos',   value:data.filter(m=>m.tipo==='Preventivo').length,       color:'#0891b2' },
                        { label:'Correctivos',   value:data.filter(m=>m.tipo==='Correctivo').length,       color:'#7c3aed' },
                    ];
                    lista = data.slice(0,20).map(m=>`MTO-${String(m.idMantenimiento).padStart(3,'0')} — ${m.descripcion||'Sin desc'} (${m.estado})`);
                } else if (reporte.tipo === 'Fallas') {
                    const r = await fallaApi.getAll(); data = r.data||[];
                    rows = [
                        { label:'Total',         value:data.length,                                    color:'#1a56db' },
                        { label:'Abiertas',      value:data.filter(f=>f.activa).length,                color:'#dc2626' },
                        { label:'Cerradas',      value:data.filter(f=>!f.activa).length,               color:'#16a34a' },
                        { label:'Crítica/Alta',  value:data.filter(f=>['ALTA','CRITICA'].includes(f.gravedad)).length, color:'#dc2626' },
                        { label:'Media',         value:data.filter(f=>f.gravedad==='MEDIA').length,    color:'#d97706' },
                        { label:'Baja',          value:data.filter(f=>f.gravedad==='BAJA').length,     color:'#16a34a' },
                    ];
                    lista = data.map(f=>`FAL-${String(f.idFalla).padStart(3,'0')} — ${f.descripcion} (${f.activa?'Abierta':'Cerrada'})`);
                } else if (reporte.tipo === 'Inventario') {
                    const r = await repuestoApi.getAll(); data = r.data||[];
                    rows = [
                        { label:'Total repuestos',  value:data.length,                                                                             color:'#1a56db' },
                        { label:'Disponibles',      value:data.filter(r=>(r.stockDisponible??r.stock??0)>0).length,                               color:'#16a34a' },
                        { label:'Stock bajo',       value:data.filter(r=>{const s=r.stockDisponible??r.stock??0;return s>0&&r.stockMinimo&&s<=r.stockMinimo;}).length, color:'#d97706' },
                        { label:'Sin stock',        value:data.filter(r=>(r.stockDisponible??r.stock??0)===0).length,                             color:'#dc2626' },
                    ];
                    lista = data.map(r=>`${r.codigo||'—'} — ${r.nombre} | Stock: ${r.stockDisponible??r.stock??0} ${r.unidad||'uds'}`);
                }
                setStats({ rows, lista });
            } catch { setStats(null); } finally { setLoading(false); }
        };
        cargar();
    }, [reporte.tipo]);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" style={{ maxWidth:650 }} onClick={e=>e.stopPropagation()}>
                <div className="modal-header">
                    <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                        <div style={{ width:36,height:36,borderRadius:9,background:'#ede9fe',color:'#7c3aed',display:'flex',alignItems:'center',justifyContent:'center' }}>
                            <FileBarChart size={18}/>
                        </div>
                        <div>
                            <div style={{ fontWeight:800 }}>{reporte.titulo}</div>
                            <div style={{ fontSize:12,color:'var(--text-muted)' }}>{reporte.fecha} · {reporte.tipo}</div>
                        </div>
                    </div>
                    <button className="btn btn-secondary btn-icon" onClick={onClose}>✕</button>
                </div>
                <div className="modal-body">
                    {/* Metadata */}
                    <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16 }}>
                        {[['Título',reporte.titulo],['Tipo',reporte.tipo],['Período',reporte.periodo||'—'],['Fecha',reporte.fecha||'—']].map(([k,v])=>(
                            <div key={k}>
                                <div style={{ fontSize:11,color:'#94a3b8',fontWeight:600,textTransform:'uppercase',letterSpacing:.5 }}>{k}</div>
                                <div style={{ fontSize:13,fontWeight:600,color:'#0f172a',marginTop:2 }}>{v}</div>
                            </div>
                        ))}
                    </div>

                    {/* Estadísticas en tiempo real */}
                    <div style={{ background:'#f8fafc',borderRadius:12,padding:16,border:'1px solid #e2e8f0' }}>
                        <div style={{ fontWeight:700,fontSize:13,color:'#0f172a',marginBottom:12 }}>📊 Estadísticas actuales</div>
                        {loading ? (
                            <div style={{ textAlign:'center',padding:20,color:'#94a3b8' }}>Cargando datos...</div>
                        ) : stats ? (
                            <>
                                {stats.rows.map(r=><StatRow key={r.label} label={r.label} value={r.value} color={r.color}/>)}
                                {stats.lista?.length > 0 && (
                                    <details style={{ marginTop:12 }}>
                                        <summary style={{ fontSize:12,color:'#64748b',cursor:'pointer' }}>Ver detalle completo ({stats.lista.length} registros)</summary>
                                        <div style={{ marginTop:8,maxHeight:200,overflowY:'auto' }}>
                                            {stats.lista.map((item,i)=>(
                                                <div key={i} style={{ fontSize:11,color:'#475569',padding:'4px 0',borderBottom:'1px solid #f1f5f9' }}>{item}</div>
                                            ))}
                                        </div>
                                    </details>
                                )}
                            </>
                        ) : (
                            <div style={{ textAlign:'center',padding:16,color:'#94a3b8' }}>No hay datos para este tipo de reporte</div>
                        )}
                    </div>

                    {reporte.descripcion && (
                        <div style={{ marginTop:14 }}>
                            <div style={{ fontSize:11,color:'#94a3b8',fontWeight:600,textTransform:'uppercase',letterSpacing:.5,marginBottom:4 }}>Descripción</div>
                            <p style={{ fontSize:13,color:'#475569',lineHeight:1.7 }}>{reporte.descripcion}</p>
                        </div>
                    )}
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cerrar</button>
                </div>
            </div>
        </div>
    );
}

export function ReportesPage() {
    const { user } = useAuth();
    const canCreate = ['ADMIN','JEFE_MANTENIMIENTO'].includes(user?.rol);
    const [items,   setItems]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal,   setModal]   = useState(false);
    const [detail,  setDetail]  = useState(null);
    const [search,  setSearch]  = useState('');

    const load = async () => {
        setLoading(true);
        try { const r = await reporteApi.getAll(); setItems(r.data||[]); }
        catch { setItems([]); } finally { setLoading(false); }
    };
    useEffect(()=>{ load(); },[]);

    const filtered = items.filter(r => !search || r.titulo?.toLowerCase().includes(search.toLowerCase()));

    return (
        <div>
            <div className="page-header">
                <div className="page-header-left"><h1>Reportes</h1><p>Genera y consulta reportes con estadísticas en tiempo real.</p></div>
                {canCreate && <button className="btn btn-primary" onClick={()=>setModal(true)}><Plus size={16}/>Generar Reporte</button>}
            </div>
            <div className="card">
                <div className="card-body" style={{ paddingBottom:0 }}>
                    <div className="search-bar"><Search size={15}/><input placeholder="Buscar por título..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
                </div>
                <div className="table-wrap">
                    <table>
                        <thead><tr><th>#</th><th>Título</th><th>Tipo</th><th>Período</th><th>Fecha</th><th>Generado por</th><th>Acción</th></tr></thead>
                        <tbody>
                        {loading && <tr><td colSpan={7} style={{ textAlign:'center',padding:30,color:'var(--text-muted)' }}>Cargando...</td></tr>}
                        {!loading && filtered.map((r,i)=>(
                            <tr key={r.idReporte||i}>
                                <td style={{ fontSize:12,color:'var(--text-muted)' }}>{i+1}</td>
                                <td><span className="link" onClick={()=>setDetail(r)}>{r.titulo||`Reporte #${i+1}`}</span></td>
                                <td><span className="badge badge-blue">{r.tipo||'General'}</span></td>
                                <td>{r.periodo||'—'}</td>
                                <td>{r.fecha||'—'}</td>
                                <td>{r.idUsuario||'—'}</td>
                                <td>
                                    <div style={{ display:'flex',gap:6 }}>
                                        <button className="btn btn-secondary btn-icon" onClick={()=>setDetail(r)}><EyeIcon size={14}/></button>
                                        {canCreate && <button className="btn btn-danger btn-icon" onClick={async()=>{ if(confirm('¿Eliminar este reporte?')) await reporteApi.delete(r.idReporte).then(load); }}><Trash2 size={14}/></button>}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {!loading && !filtered.length && <tr><td colSpan={7} style={{ textAlign:'center',padding:30,color:'var(--text-muted)' }}>Sin reportes registrados</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            {modal && <ReporteModal usuario={user} onClose={()=>setModal(false)} onSave={()=>{ setModal(false); load(); }}/>}
            {detail && <ReporteDetail reporte={detail} onClose={()=>setDetail(null)}/>}
        </div>
    );
}
