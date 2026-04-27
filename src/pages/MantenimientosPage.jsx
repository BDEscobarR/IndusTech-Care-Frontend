import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mantenimientoApi, usuarioApi, maquinariaApi } from '../services/api';
import { Plus, Search, Eye, Pencil, Trash2, Wrench, Play, CheckSquare } from 'lucide-react';

const ESTADOS = ['ACTIVO','FINALIZADO','CANCELADO'];
const TIPOS   = ['Preventivo','Correctivo','Predictivo'];

const ESTADO_MAP = {
    ACTIVO:     { label:'Activo',     cls:'badge-warning' },
    FINALIZADO: { label:'Finalizado', cls:'badge-success' },
    CANCELADO:  { label:'Cancelado',  cls:'badge-danger'  },
};

function EstadoBadge({ e }) {
    const s = ESTADO_MAP[e] || { label:e, cls:'badge-gray' };
    return <span className={`badge ${s.cls}`}>{s.label}</span>;
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function MantModal({ item, onClose, onSave }) {
    const isEdit = !!item?.idMantenimiento;
    const [maquinas,  setMaquinas]  = useState([]);
    const [tecnicos,  setTecnicos]  = useState([]);
    const [form, setForm] = useState(item || {
        tipo:'Preventivo', fecha:'', descripcion:'',
        observaciones:'', estado:'ACTIVO',
        idMaquinaria:'', idTecnicoPrincipal:''
    });
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');
    const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

    useEffect(() => {
        maquinariaApi.getAll().then(r => setMaquinas(r.data||[])).catch(()=>{});
        usuarioApi.getTecnicos().then(r => setTecnicos(r.data||[])).catch(()=>{});
    }, []);

    const handleSave = async () => {
        if (!form.descripcion || !form.idMaquinaria) {
            setErr('Descripción y maquinaria son requeridos'); return;
        }
        setLoading(true);
        try {
            const payload = {
                ...form,
                idMaquinaria: parseInt(form.idMaquinaria),
                idTecnicoPrincipal: form.idTecnicoPrincipal ? parseInt(form.idTecnicoPrincipal) : null,
            };
            if (isEdit) await mantenimientoApi.update(form.idMantenimiento, payload);
            else await mantenimientoApi.create(payload);
            onSave();
        } catch (e) {
            setErr(e.response?.data?.message || 'Error al guardar');
        } finally { setLoading(false); }
    };

    return (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget&&onClose()}>
            <div className="modal" style={{ maxWidth:600 }}>
                <div className="modal-header">
                    <span className="modal-title">{isEdit?'Editar mantenimiento':'Registrar nuevo mantenimiento'}</span>
                    <button className="btn btn-secondary btn-icon" onClick={onClose}>✕</button>
                </div>
                <div className="modal-body">
                    {err && <div style={{ background:'#fee2e2',color:'#dc2626',padding:'8px 12px',borderRadius:8,marginBottom:14,fontSize:13 }}>{err}</div>}

                    <div className="form-group">
                        <label className="form-label">Maquinaria <span className="req">*</span></label>
                        <select className="form-select" value={form.idMaquinaria||''} onChange={f('idMaquinaria')}>
                            <option value="">Seleccione una maquinaria</option>
                            {maquinas.map(m => (
                                <option key={m.idMaquinaria} value={m.idMaquinaria}>
                                    {m.codigo} — {m.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Tipo <span className="req">*</span></label>
                            <select className="form-select" value={form.tipo} onChange={f('tipo')}>
                                {TIPOS.map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Fecha programada <span className="req">*</span></label>
                            <input type="date" className="form-input" value={form.fecha||''} onChange={f('fecha')} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Técnico asignado</label>
                        <select className="form-select" value={form.idTecnicoPrincipal||''} onChange={f('idTecnicoPrincipal')}>
                            <option value="">Sin técnico asignado</option>
                            {tecnicos.map(t => (
                                <option key={t.idUsuario} value={t.idUsuario}>
                                    {t.nombre} {t.especialidad ? `— ${t.especialidad}` : ''}
                                    {t.disponible === false ? ' (Ocupado)' : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Descripción <span className="req">*</span></label>
                        <textarea className="form-textarea" value={form.descripcion||''} onChange={f('descripcion')} placeholder="Describe el mantenimiento a realizar..." />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Observaciones</label>
                        <textarea className="form-textarea" value={form.observaciones||''} onChange={f('observaciones')} placeholder="Notas adicionales (opcional)..." style={{ minHeight:60 }} />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Estado</label>
                        <select className="form-select" value={form.estado} onChange={f('estado')}>
                            {ESTADOS.map(s => <option key={s} value={s}>{ESTADO_MAP[s]?.label||s}</option>)}
                        </select>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                    <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
                        {loading?'Guardando...':(isEdit?'Guardar cambios':'Guardar mantenimiento')}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Modal detalle ─────────────────────────────────────────────────────────────
function MantDetail({ item, onClose, onEdit, canEdit, onIniciar, onFinalizar }) {
    const [tecnicos, setTecnicos] = useState([]);
    useEffect(() => {
        mantenimientoApi.getTecnicos(item.idMantenimiento)
            .then(r => setTecnicos(r.data||[])).catch(()=>{});
    }, [item]);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" style={{ maxWidth:640 }} onClick={e=>e.stopPropagation()}>
                <div className="modal-header">
                    <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                        <div style={{ width:36,height:36,borderRadius:9,background:'var(--primary-light)',color:'var(--primary)',display:'flex',alignItems:'center',justifyContent:'center' }}>
                            <Wrench size={18}/>
                        </div>
                        <div>
                            <div style={{ fontWeight:800 }}>{item.descripcion}</div>
                            <div style={{ fontSize:12,color:'var(--text-muted)' }}>MTO-{String(item.idMantenimiento).padStart(3,'0')}</div>
                        </div>
                    </div>
                    <button className="btn btn-secondary btn-icon" onClick={onClose}>✕</button>
                </div>
                <div className="modal-body">
                    <div style={{ display:'flex',gap:8,marginBottom:16,flexWrap:'wrap' }}>
                        <span className="badge badge-blue">{item.tipo}</span>
                        <EstadoBadge e={item.estado} />
                    </div>

                    <div className="info-grid">
                        <div>
                            <div className="info-section-title">Información</div>
                            {[
                                ['Fecha', item.fecha],
                                ['Maquinaria ID', item.idMaquinaria ? `#${item.idMaquinaria}` : '—'],
                                ['Costo mano obra', item.costoManoObra ? `$${Number(item.costoManoObra).toLocaleString()}` : '—'],
                                ['Costo repuestos', item.costoRepuestos ? `$${Number(item.costoRepuestos).toLocaleString()}` : '—'],
                            ].map(([k,v]) => (
                                <div className="info-row" key={k}><span className="info-key">{k}:</span><span className="info-val">{v||'—'}</span></div>
                            ))}
                        </div>
                        <div>
                            <div className="info-section-title">Observaciones</div>
                            <p style={{ fontSize:13,color:'var(--text-secondary)',lineHeight:1.7 }}>
                                {item.observaciones || 'Sin observaciones.'}
                            </p>
                            {tecnicos.length > 0 && (
                                <div style={{ marginTop:14 }}>
                                    <div className="info-section-title">Técnicos asignados</div>
                                    {tecnicos.map(t => (
                                        <div key={t.idUsuario} style={{ fontSize:13,color:'var(--text-primary)',padding:'4px 0',borderBottom:'1px solid #f1f5f9' }}>
                                            {t.nombre} {t.especialidad && <span style={{ color:'var(--text-muted)',fontSize:12 }}>— {t.especialidad}</span>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Acciones de ciclo de vida */}
                    {canEdit && (
                        <div style={{ display:'flex',gap:10,marginTop:16,paddingTop:16,borderTop:'1px solid var(--border)' }}>
                            {item.estado !== 'FINALIZADO' && item.estado !== 'CANCELADO' && (
                                <button className="btn btn-primary" onClick={() => onFinalizar(item.idMantenimiento)}>
                                    <CheckSquare size={15}/> Finalizar
                                </button>
                            )}
                            <button className="btn btn-secondary" onClick={() => onEdit(item)}>
                                <Pencil size={15}/> Editar
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Lista ─────────────────────────────────────────────────────────────────────
export function MantenimientosPage() {
    const { user } = useAuth();
    const canWrite  = ['ADMIN','JEFE_MANTENIMIENTO','TECNICO'].includes(user?.rol);
    const canDelete = ['ADMIN','JEFE_MANTENIMIENTO'].includes(user?.rol);

    const [items,   setItems]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [search,  setSearch]  = useState('');
    const [filtroE, setFiltroE] = useState('');
    const [filtroT, setFiltroT] = useState('');
    const [modal,   setModal]   = useState(null);
    const [detail,  setDetail]  = useState(null);
    const [page,    setPage]    = useState(1);
    const PER = 8;

    const load = async () => {
        setLoading(true);
        try { const r = await mantenimientoApi.getAll(); setItems(r.data||[]); }
        catch { setItems([]); }
        finally { setLoading(false); }
    };
    useEffect(() => { load(); }, []);

    const handleFinalizar = async (id) => {
        if (!confirm('¿Marcar este mantenimiento como finalizado?')) return;
        await mantenimientoApi.finalizar(id).then(() => { setDetail(null); load(); }).catch(()=>{});
    };

    const filtered = items.filter(m => {
        const q = search.toLowerCase();
        return (!q || m.descripcion?.toLowerCase().includes(q))
            && (!filtroE || m.estado === filtroE)
            && (!filtroT || m.tipo === filtroT);
    });
    const totalPages = Math.ceil(filtered.length/PER);
    const paged = filtered.slice((page-1)*PER, page*PER);

    return (
        <div>
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Mantenimientos</h1>
                    <p>Gestiona y da seguimiento a los mantenimientos del sistema.</p>
                </div>
                {canWrite && <button className="btn btn-primary" onClick={() => setModal('new')}><Plus size={16}/>Nuevo Mantenimiento</button>}
            </div>

            <div className="card">
                <div className="card-body" style={{ paddingBottom:0 }}>
                    <div className="filter-row">
                        <div className="search-bar" style={{ flex:1 }}>
                            <Search size={15}/>
                            <input placeholder="Buscar por descripción..." value={search}
                                   onChange={e => { setSearch(e.target.value); setPage(1); }} />
                        </div>
                        <select className="form-select" style={{ width:160 }} value={filtroE}
                                onChange={e => { setFiltroE(e.target.value); setPage(1); }}>
                            <option value="">Todos los estados</option>
                            {ESTADOS.map(s => <option key={s} value={s}>{ESTADO_MAP[s]?.label||s}</option>)}
                        </select>
                        <select className="form-select" style={{ width:150 }} value={filtroT}
                                onChange={e => { setFiltroT(e.target.value); setPage(1); }}>
                            <option value="">Todos los tipos</option>
                            {TIPOS.map(t => <option key={t}>{t}</option>)}
                        </select>
                    </div>
                </div>

                <div className="table-wrap">
                    <table>
                        <thead>
                        <tr><th>Código</th><th>Descripción</th><th>Tipo</th><th>Fecha</th><th>Maq.</th><th>Estado</th><th>Acción</th></tr>
                        </thead>
                        <tbody>
                        {loading && <tr><td colSpan={7} style={{ textAlign:'center',padding:30,color:'var(--text-muted)' }}>Cargando...</td></tr>}
                        {!loading && paged.map((m,i) => (
                            <tr key={m.idMantenimiento||i}>
                                <td><span className="badge badge-blue" style={{ fontFamily:'monospace' }}>MTO-{String(m.idMantenimiento||i+1).padStart(3,'0')}</span></td>
                                <td><span className="link" onClick={() => setDetail(m)}>{m.descripcion||'—'}</span></td>
                                <td><span className={`badge ${m.tipo==='Preventivo'?'badge-info':m.tipo==='Correctivo'?'badge-purple':'badge-gray'}`}>{m.tipo}</span></td>
                                <td>{m.fecha||'—'}</td>
                                <td style={{ color:'var(--text-muted)',fontSize:12 }}>{m.idMaquinaria ? `#${m.idMaquinaria}` : '—'}</td>
                                <td><EstadoBadge e={m.estado||'ACTIVO'}/></td>
                                <td>
                                    <div style={{ display:'flex',gap:6 }}>
                                        <button className="btn btn-secondary btn-icon" onClick={() => setDetail(m)}><Eye size={14}/></button>
                                        {canWrite  && <button className="btn btn-secondary btn-icon" onClick={() => setModal(m)}><Pencil size={14}/></button>}
                                        {canDelete && (
                                            <button className="btn btn-danger btn-icon"
                                                    onClick={async () => { if(confirm('¿Eliminar?')) await mantenimientoApi.delete(m.idMantenimiento).then(load); }}>
                                                <Trash2 size={14}/>
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {!loading && !paged.length && <tr><td colSpan={7} style={{ textAlign:'center',padding:30,color:'var(--text-muted)' }}>Sin resultados</td></tr>}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div style={{ padding:'14px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',borderTop:'1px solid var(--border)' }}>
                        <span className="page-info">Mostrando {(page-1)*PER+1}–{Math.min(page*PER,filtered.length)} de {filtered.length}</span>
                        <div className="pagination">
                            <button className="page-btn" onClick={() => setPage(p=>Math.max(1,p-1))}>‹</button>
                            {Array.from({length:totalPages},(_,i) => (
                                <button key={i} className={`page-btn ${page===i+1?'active':''}`} onClick={() => setPage(i+1)}>{i+1}</button>
                            ))}
                            <button className="page-btn" onClick={() => setPage(p=>Math.min(totalPages,p+1))}>›</button>
                        </div>
                    </div>
                )}
            </div>

            {detail && (
                <MantDetail
                    item={detail}
                    onClose={() => setDetail(null)}
                    onEdit={item => { setDetail(null); setModal(item); }}
                    canEdit={canWrite}
                    onFinalizar={handleFinalizar}
                />
            )}

            {modal && (
                <MantModal
                    item={modal==='new'?null:modal}
                    onClose={() => setModal(null)}
                    onSave={() => { setModal(null); load(); }}
                />
            )}
        </div>
    );
}
