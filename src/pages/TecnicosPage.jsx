import { useState, useEffect } from 'react';
import { usuarioApi } from '../services/api';
import { Plus, Pencil, Trash2, Phone, MapPin, Wrench, CheckCircle, XCircle } from 'lucide-react';

const AC = ['#1a56db','#0d9488','#9333ea','#dc2626','#b45309','#0891b2','#16a34a'];
const initials = n => (n||'?').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();

const ESPECIALIDADES = [
    'Mecánica Industrial','Electricidad','Hidráulica y Neumática',
    'Soldadura Industrial','Instrumentación','Electrónica','Refrigeración','Otro'
];

// ── Modal Crear/Editar técnico ────────────────────────────────────────────────
function TecnicoModal({ item, onClose, onSave }) {
    const isEdit = !!item?.idUsuario;
    const [form, setForm] = useState(item || {
        nombre:'', direccion:'', telefono:'',
        rol:'TECNICO', contrasena:'', especialidad:''
    });
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');
    const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

    const handleSave = async () => {
        if (!form.nombre) { setErr('El nombre es requerido'); return; }
        if (!isEdit && !form.contrasena) { setErr('La contraseña es requerida'); return; }
        setLoading(true);
        try {
            const payload = { ...form, rol: 'TECNICO' };
            if (isEdit) await usuarioApi.update(form.idUsuario, payload);
            else await usuarioApi.create(payload);
            onSave();
        } catch (e) {
            setErr(e.response?.data?.message || 'Error al guardar');
        } finally { setLoading(false); }
    };

    return (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget&&onClose()}>
            <div className="modal">
                <div className="modal-header">
                    <span className="modal-title">{isEdit ? 'Editar técnico' : 'Nuevo técnico'}</span>
                    <button className="btn btn-secondary btn-icon" onClick={onClose}>✕</button>
                </div>
                <div className="modal-body">
                    {err && <div style={{ background:'#fee2e2',color:'#dc2626',padding:'8px 12px',borderRadius:8,marginBottom:14,fontSize:13 }}>{err}</div>}

                    <div className="form-group">
                        <label className="form-label">Nombre completo <span className="req">*</span></label>
                        <input className="form-input" value={form.nombre} onChange={f('nombre')} placeholder="Ej. Carlos Pérez" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Especialidad <span className="req">*</span></label>
                        <select className="form-select" value={form.especialidad||''} onChange={f('especialidad')}>
                            <option value="">Seleccione especialidad</option>
                            {ESPECIALIDADES.map(e => <option key={e}>{e}</option>)}
                        </select>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Teléfono</label>
                            <input className="form-input" value={form.telefono||''} onChange={f('telefono')} placeholder="310-555-0000" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Dirección</label>
                            <input className="form-input" value={form.direccion||''} onChange={f('direccion')} placeholder="Ciudad, Dirección" />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">
                            Contraseña {!isEdit && <span className="req">*</span>}
                            {isEdit && <span style={{ fontSize:11,color:'var(--text-muted)',fontWeight:400 }}> (dejar vacío para no cambiar)</span>}
                        </label>
                        <div style={{ position:'relative' }}>
                            <input
                                className="form-input"
                                type={showPwd ? 'text' : 'password'}
                                value={form.contrasena||''}
                                onChange={f('contrasena')}
                                placeholder={isEdit ? '••••••••' : 'Contraseña de acceso'}
                                style={{ paddingRight:44 }}
                            />
                            <button type="button" onClick={() => setShowPwd(!showPwd)}
                                    style={{ position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#94a3b8' }}>
                                {showPwd ? '🙈' : '👁'}
                            </button>
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                    <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
                        {loading ? 'Guardando...' : 'Guardar'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Card de técnico ───────────────────────────────────────────────────────────
function TecnicoCard({ tecnico, index, onEdit, onDelete }) {
    const color = AC[index % AC.length];
    // disponible viene calculado por la vista v_tecnicos en el backend
    const disponible = tecnico.disponible ?? tecnico.disponibleCalc ?? false;

    return (
        <div style={{
            background:'#fff', border:'1px solid #e2e8f0', borderRadius:16,
            padding:22, boxShadow:'0 1px 3px rgba(0,0,0,.06)',
            display:'flex', flexDirection:'column', gap:0,
        }}>
            {/!* Header *!/}
            <div style={{ display:'flex', alignItems:'flex-start', gap:14, marginBottom:16 }}>
                <div style={{
                    width:52, height:52, borderRadius:'50%',
                    background: color + '20', color,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontWeight:800, fontSize:16, flexShrink:0,
                    border:`2px solid ${color}30`,
                }}>
                    {initials(tecnico.nombre)}
                </div>
                <div style={{ flex:1 }}>
                    <div style={{ fontWeight:800, fontSize:15, color:'#0f172a', marginBottom:3 }}>
                        {tecnico.nombre}
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'#64748b' }}>
                        <Wrench size={12} />
                        {tecnico.especialidad || 'Sin especialidad asignada'}
                    </div>
                </div>
            </div>

            {/!* ID y disponibilidad *!/}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    {disponible
                        ? <span className="badge badge-success" style={{ display:'flex',alignItems:'center',gap:4 }}>
                <CheckCircle size={11}/> Disponible
              </span>
                        : <span className="badge badge-danger" style={{ display:'flex',alignItems:'center',gap:4 }}>
                <XCircle size={11}/> Ocupado
              </span>
                    }
                    <span style={{ background:'#f0f4ff',color:'#1a56db',fontSize:11,fontWeight:600,padding:'2px 8px',borderRadius:20 }}>
            USR-{String(tecnico.idUsuario).padStart(3,'0')}
          </span>
                </div>
                <div style={{ display:'flex', gap:6 }}>
                    <button className="btn btn-secondary btn-icon" onClick={() => onEdit(tecnico)}><Pencil size={14}/></button>
                    <button className="btn btn-danger btn-icon" onClick={() => onDelete(tecnico.idUsuario)}><Trash2 size={14}/></button>
                </div>
            </div>

            {/!* Contacto *!/}
            <div style={{ borderTop:'1px solid #f1f5f9', paddingTop:12, display:'flex', flexDirection:'column', gap:6 }}>
                {tecnico.telefono
                    ? <div style={{ display:'flex',alignItems:'center',gap:8,fontSize:13,color:'#475569' }}>
                        <Phone size={13} color="#1a56db"/> {tecnico.telefono}
                    </div>
                    : null
                }
                {tecnico.direccion
                    ? <div style={{ display:'flex',alignItems:'center',gap:8,fontSize:12,color:'#94a3b8' }}>
                        <MapPin size={12}/> <span style={{ overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{tecnico.direccion}</span>
                    </div>
                    : null
                }
                {!tecnico.telefono && !tecnico.direccion && (
                    <div style={{ fontSize:12,color:'#cbd5e1' }}>Sin datos de contacto</div>
                )}
            </div>
        </div>
    );
}

// ── Vista principal ───────────────────────────────────────────────────────────
export function TecnicosPage() {
    const [tecnicos, setTecnicos] = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [modal,    setModal]    = useState(null);
    const [filtro,   setFiltro]   = useState('todos');
    const [search,   setSearch]   = useState('');

    const load = async () => {
        setLoading(true);
        try {
            const r = await usuarioApi.getTecnicos();
            setTecnicos(r.data || []);
        } catch { setTecnicos([]); }
        finally { setLoading(false); }
    };
    useEffect(() => { load(); }, []);

    const handleDelete = async (id) => {
        if (!confirm('¿Desactivar este técnico? Podrá reactivarse desde Usuarios.')) return;
        try { await usuarioApi.delete(id); load(); } catch {}
    };

    const filtered = tecnicos.filter(t => {
        const q = search.toLowerCase();
        const matchQ = !q || t.nombre?.toLowerCase().includes(q) || t.especialidad?.toLowerCase().includes(q);
        const disponible = t.disponible ?? false;
        const matchF = filtro === 'todos'
            || (filtro === 'disponibles' && disponible)
            || (filtro === 'ocupados' && !disponible);
        return matchQ && matchF;
    });

    const stats = {
        total:       tecnicos.length,
        disponibles: tecnicos.filter(t => t.disponible).length,
        ocupados:    tecnicos.filter(t => !t.disponible).length,
    };

    return (
        <div>
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Técnicos</h1>
                    <p>Usuarios con rol Técnico — disponibilidad calculada en tiempo real.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setModal('new')}><Plus size={16}/>Nuevo Técnico</button>
            </div>

            {/!* Stats *!/}
            <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' }}>
                {[['Total',stats.total,'#1a56db'],['Disponibles',stats.disponibles,'#16a34a'],['Ocupados',stats.ocupados,'#d97706']].map(([l,v,c])=>(
                    <div key={l} style={{ background:'#fff',border:'1px solid #e2e8f0',borderRadius:12,padding:'14px 20px',display:'flex',alignItems:'center',gap:12,boxShadow:'0 1px 3px rgba(0,0,0,.05)' }}>
                        <div style={{ fontSize:24,fontWeight:900,color:c }}>{v}</div>
                        <div style={{ fontSize:12,color:'#64748b' }}>{l}</div>
                    </div>
                ))}
            </div>

            {/!* Filtros *!/}
            <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap', alignItems:'center' }}>
                <div className="search-bar" style={{ flex:1, minWidth:200 }}>
                    <input placeholder="Buscar por nombre o especialidad..." value={search}
                           onChange={e => setSearch(e.target.value)} style={{ border:'none',outline:'none',background:'none',fontSize:13,flex:1,fontFamily:'inherit' }} />
                </div>
                {[['todos','Todos'],['disponibles','Disponibles'],['ocupados','Ocupados']].map(([v,l])=>(
                    <button key={v} onClick={() => setFiltro(v)} style={{
                        padding:'7px 16px', borderRadius:20, border:'1.5px solid',
                        borderColor: filtro===v ? '#1a56db' : '#e2e8f0',
                        background: filtro===v ? '#1a56db' : '#fff',
                        color: filtro===v ? '#fff' : '#64748b',
                        fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit',
                    }}>{l}</button>
                ))}
            </div>

            {/!* Cards *!/}
            {loading ? (
                <div style={{ textAlign:'center',padding:48,color:'#94a3b8' }}>Cargando técnicos...</div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign:'center',padding:48,color:'#94a3b8' }}>
                    <div style={{ fontSize:36,marginBottom:10 }}>👷</div>
                    <div>{search ? 'Sin resultados para la búsqueda.' : 'No hay técnicos registrados.'}</div>
                </div>
            ) : (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
                    {filtered.map((t,i) => (
                        <TecnicoCard
                            key={t.idUsuario}
                            tecnico={t}
                            index={i}
                            onEdit={tec => setModal(tec)}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            <div style={{ marginTop:16, fontSize:12, color:'#94a3b8' }}>
                💡 La disponibilidad se calcula automáticamente — un técnico es "Ocupado" cuando tiene mantenimientos activos asignados.
            </div>

            {modal && (
                <TecnicoModal
                    item={modal === 'new' ? null : modal}
                    onClose={() => setModal(null)}
                    onSave={() => { setModal(null); load(); }}
                />
            )}
        </div>
    );
}

