import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { maquinariaApi } from '../services/api';
import { Plus, Search, Eye, Pencil, Trash2, Cpu, ArrowLeft } from 'lucide-react';

const ESTADOS = ['OPERATIVO','EN_REPARACION','FUERA_DE_SERVICIO','INACTIVO'];
const TIPOS   = ['Torno CNC','Fresadora','Compresor','Soldadora','Taladro','Prensa','Generador','Extractor','Grúa','Bomba','Otro'];

const ESTADO_MAP = {
    OPERATIVO:         { label:'Operativo',         cls:'badge-success'  },
    EN_REPARACION:     { label:'En reparación',      cls:'badge-warning'  },
    FUERA_DE_SERVICIO: { label:'Fuera de servicio',  cls:'badge-danger'   },
    INACTIVO:          { label:'Inactivo',           cls:'badge-gray'     },
};

function EstadoBadge({ e }) {
    const s = ESTADO_MAP[e] || { label: e, cls:'badge-gray' };
    return <span className={`badge ${s.cls}`}>{s.label}</span>;
}

// ── Modal Crear/Editar ────────────────────────────────────────────────────────
function MaquinariaModal({ item, onClose, onSave }) {
    const isEdit = !!item?.idMaquinaria;
    const [form, setForm] = useState(item || {
        codigo:'', nombre:'', tipo:'', marca:'', modelo:'',
        ubicacion:'', descripcion:'', fechaAdquisicion:'', estado:'OPERATIVO'
    });
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');
    const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

    const handleSave = async () => {
        if (!form.codigo || !form.nombre) { setErr('Código y nombre son requeridos'); return; }
        setLoading(true);
        try {
            if (isEdit) await maquinariaApi.update(form.idMaquinaria, form);
            else await maquinariaApi.create(form);
            onSave();
        } catch (e) {
            setErr(e.response?.data?.message || 'Error al guardar');
        } finally { setLoading(false); }
    };

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal" style={{ maxWidth: 580 }}>
                <div className="modal-header">
                    <span className="modal-title">{isEdit ? 'Editar maquinaria' : 'Registrar nueva maquinaria'}</span>
                    <button className="btn btn-secondary btn-icon" onClick={onClose}>✕</button>
                </div>
                <div className="modal-body">
                    {err && <div style={{ background:'#fee2e2',color:'#dc2626',padding:'8px 12px',borderRadius:8,marginBottom:14,fontSize:13 }}>{err}</div>}
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Código <span className="req">*</span></label>
                            <input className="form-input" value={form.codigo} onChange={f('codigo')} placeholder="Ej. MAQ-011" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Nombre <span className="req">*</span></label>
                            <input className="form-input" value={form.nombre} onChange={f('nombre')} placeholder="Nombre de la maquinaria" />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Tipo <span className="req">*</span></label>
                            <select className="form-select" value={form.tipo} onChange={f('tipo')}>
                                <option value="">Seleccione el tipo</option>
                                {TIPOS.map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Estado <span className="req">*</span></label>
                            <select className="form-select" value={form.estado} onChange={f('estado')}>
                                {ESTADOS.map(s => <option key={s} value={s}>{ESTADO_MAP[s]?.label || s}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Marca</label>
                            <input className="form-input" value={form.marca||''} onChange={f('marca')} placeholder="Ej. Atlas Copco" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Modelo</label>
                            <input className="form-input" value={form.modelo||''} onChange={f('modelo')} placeholder="Ej. GA-30" />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Ubicación</label>
                            <input className="form-input" value={form.ubicacion||''} onChange={f('ubicacion')} placeholder="Planta / Área" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Fecha de adquisición</label>
                            <input type="date" className="form-input" value={form.fechaAdquisicion||''} onChange={f('fechaAdquisicion')} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Descripción</label>
                        <textarea className="form-textarea" value={form.descripcion||''} onChange={f('descripcion')} placeholder="Descripción técnica opcional..." />
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                    <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
                        {loading ? 'Guardando...' : (isEdit ? 'Guardar cambios' : 'Guardar maquinaria')}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Vista de detalle ──────────────────────────────────────────────────────────
function MaquinariaDetail({ item, onBack, onEdit, canEdit }) {
    return (
        <div>
            <div className="breadcrumb" style={{ marginBottom:20 }}>
                <span onClick={onBack} style={{ cursor:'pointer', color:'var(--primary)' }}>Maquinarias</span>
                <span className="sep">›</span>
                <span>Detalle</span>
            </div>
            <div className="card">
                <div className="card-body">
                    <div className="detail-header">
                        <div className="detail-title-block">
                            <div className="detail-icon"><Cpu size={28} /></div>
                            <div>
                                <div className="detail-name">{item.nombre}</div>
                                <div className="detail-code">Código: {item.codigo}</div>
                            </div>
                            <EstadoBadge e={item.estado} />
                        </div>
                        <div style={{ display:'flex', gap:10 }}>
                            {canEdit && <button className="btn btn-primary" onClick={() => onEdit(item)}><Pencil size={15}/>Editar</button>}
                            <button className="btn btn-secondary" onClick={onBack}><ArrowLeft size={15}/>Volver</button>
                        </div>
                    </div>

                    <div className="info-grid">
                        <div>
                            <div className="info-section-title">Información General</div>
                            {[
                                ['Código',       item.codigo],
                                ['Nombre',       item.nombre],
                                ['Tipo',         item.tipo],
                                ['Estado',       ESTADO_MAP[item.estado]?.label || item.estado],
                                ['Ubicación',    item.ubicacion || '—'],
                            ].map(([k,v]) => (
                                <div className="info-row" key={k}>
                                    <span className="info-key">{k}:</span>
                                    <span className="info-val">{v || '—'}</span>
                                </div>
                            ))}
                        </div>
                        <div>
                            <div className="info-section-title">Especificaciones</div>
                            {[
                                ['Marca',            item.marca    || '—'],
                                ['Modelo',           item.modelo   || '—'],
                                ['Fecha adquisición',item.fechaAdquisicion || '—'],
                            ].map(([k,v]) => (
                                <div className="info-row" key={k}>
                                    <span className="info-key">{k}:</span>
                                    <span className="info-val">{v}</span>
                                </div>
                            ))}
                            {item.descripcion && (
                                <div style={{ marginTop:14 }}>
                                    <div className="info-section-title">Descripción</div>
                                    <p style={{ fontSize:13,color:'var(--text-secondary)',lineHeight:1.7 }}>{item.descripcion}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Lista ─────────────────────────────────────────────────────────────────────
export default function MaquinariasPage() {
    const { user } = useAuth();
    const canWrite = ['ADMIN','JEFE_MANTENIMIENTO'].includes(user?.rol);

    const [items,   setItems]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [search,  setSearch]  = useState('');
    const [filtroE, setFiltroE] = useState('');
    const [modal,   setModal]   = useState(null);
    const [detail,  setDetail]  = useState(null);
    const [page,    setPage]    = useState(1);
    const PER = 8;

    const load = async () => {
        setLoading(true);
        try { const r = await maquinariaApi.getAll(); setItems(r.data || []); }
        catch { setItems([]); }
        finally { setLoading(false); }
    };
    useEffect(() => { load(); }, []);

    const filtered = items.filter(m => {
        const q = search.toLowerCase();
        return (!q || m.nombre?.toLowerCase().includes(q) || m.codigo?.toLowerCase().includes(q) || m.tipo?.toLowerCase().includes(q))
            && (!filtroE || m.estado === filtroE);
    });
    const totalPages = Math.ceil(filtered.length / PER);
    const paged = filtered.slice((page-1)*PER, page*PER);

    if (detail) return (
        <MaquinariaDetail
            item={detail}
            onBack={() => setDetail(null)}
            onEdit={item => { setDetail(null); setModal(item); }}
            canEdit={canWrite}
        />
    );

    return (
        <div>
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Maquinarias</h1>
                    <p>Administra las maquinarias registradas en el sistema.</p>
                </div>
                {canWrite && <button className="btn btn-primary" onClick={() => setModal('new')}><Plus size={16}/>Nueva Maquinaria</button>}
            </div>

            <div className="card">
                <div className="card-body" style={{ paddingBottom:0 }}>
                    <div className="filter-row">
                        <div className="search-bar" style={{ flex:1 }}>
                            <Search size={15}/>
                            <input placeholder="Buscar por nombre, código o tipo..." value={search}
                                   onChange={e => { setSearch(e.target.value); setPage(1); }} />
                        </div>
                        <select className="form-select" style={{ width:200 }} value={filtroE}
                                onChange={e => { setFiltroE(e.target.value); setPage(1); }}>
                            <option value="">Todos los estados</option>
                            {ESTADOS.map(s => <option key={s} value={s}>{ESTADO_MAP[s]?.label || s}</option>)}
                        </select>
                    </div>
                </div>

                <div className="table-wrap">
                    <table>
                        <thead>
                        <tr>
                            <th>Código</th><th>Nombre</th><th>Tipo</th>
                            <th>Marca / Modelo</th><th>Ubicación</th><th>Estado</th><th>Acción</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading && <tr><td colSpan={7} style={{ textAlign:'center',padding:30,color:'var(--text-muted)' }}>Cargando...</td></tr>}
                        {!loading && paged.map((m,i) => (
                            <tr key={m.idMaquinaria||i}>
                                <td><span className="badge badge-blue" style={{ fontFamily:'monospace' }}>{m.codigo}</span></td>
                                <td><span className="link" onClick={() => setDetail(m)}>{m.nombre}</span></td>
                                <td>{m.tipo || '—'}</td>
                                <td style={{ color:'var(--text-secondary)',fontSize:12 }}>
                                    {[m.marca, m.modelo].filter(Boolean).join(' / ') || '—'}
                                </td>
                                <td>{m.ubicacion || '—'}</td>
                                <td><EstadoBadge e={m.estado} /></td>
                                <td>
                                    <div style={{ display:'flex', gap:6 }}>
                                        <button className="btn btn-secondary btn-icon" onClick={() => setDetail(m)}><Eye size={14}/></button>
                                        {canWrite && <button className="btn btn-secondary btn-icon" onClick={() => setModal(m)}><Pencil size={14}/></button>}
                                        {canWrite && (
                                            <button className="btn btn-danger btn-icon"
                                                    onClick={async () => { if (confirm('¿Eliminar esta maquinaria?')) await maquinariaApi.delete(m.idMaquinaria).then(load); }}>
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
                        <span className="page-info">Mostrando {(page-1)*PER+1}–{Math.min(page*PER,filtered.length)} de {filtered.length} maquinarias</span>
                        <div className="pagination">
                            <button className="page-btn" onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}>‹</button>
                            {Array.from({length:totalPages},(_,i) => (
                                <button key={i} className={`page-btn ${page===i+1?'active':''}`} onClick={() => setPage(i+1)}>{i+1}</button>
                            ))}
                            <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}>›</button>
                        </div>
                    </div>
                )}
            </div>

            {modal && (
                <MaquinariaModal
                    item={modal === 'new' ? null : modal}
                    onClose={() => setModal(null)}
                    onSave={() => { setModal(null); load(); }}
                />
            )}
        </div>
    );
}
