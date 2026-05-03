import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mantenimientoApi, usuarioApi, maquinariaApi } from '../services/api';
import { Plus, Search, Eye, Pencil, Trash2, Wrench } from 'lucide-react';

const ESTADOS_MANT = ['ACTIVO','FINALIZADO','CANCELADO'];
const TIPOS_MANT   = ['Preventivo','Correctivo','Predictivo'];

function getBadge(estado) {
    const m = {
        'ACTIVO':     'badge-warning',
        'FINALIZADO': 'badge-success',
        'CANCELADO':  'badge-danger',
        'Programado': 'badge-blue',
        'En Proceso': 'badge-warning',
        'Completado': 'badge-success',
        'Pendiente':  'badge-gray',
    };
    return <span className={`badge ${m[estado]||'badge-gray'}`}>{estado}</span>;
}

function MantModal({ item, onClose, onSave }) {
    const isEdit = !!item?.idMantenimiento;
    const [maquinas, setMaquinas] = useState([]);
    const [tecnicos, setTecnicos] = useState([]);
    const [form, setForm] = useState(item || {
        descripcion:'', tipo:'Preventivo', estado:'ACTIVO',
        fecha:'', idMaquinaria:'', idTecnicoPrincipal:'', observaciones:''
    });
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');
    const f = k => e => setForm({ ...form, [k]: e.target.value });

    useEffect(() => {
        maquinariaApi.getAll().then(r => setMaquinas(r.data || r || [])).catch(()=>{});
        usuarioApi.getTecnicos().then(r => setTecnicos(r.data || r || [])).catch(()=>{});
    }, []);

    const handleSave = async () => {
        if (!form.descripcion) { setErr('La descripción es requerida'); return; }
        setLoading(true);
        try {
            const payload = {
                ...form,
                idMaquinaria: form.idMaquinaria ? parseInt(form.idMaquinaria) : null,
                idTecnicoPrincipal: form.idTecnicoPrincipal ? parseInt(form.idTecnicoPrincipal) : null,
            };
            if (isEdit) await mantenimientoApi.update(form.idMantenimiento, payload);
            else await mantenimientoApi.create(payload);
            onSave();
        } catch { setErr('Error al guardar'); }
        finally { setLoading(false); }
    };

    return (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget&&onClose()}>
            <div className="modal">
                <div className="modal-header">
                    <span className="modal-title">{isEdit ? 'Editar Mantenimiento' : 'Registrar nuevo mantenimiento'}</span>
                    <button className="btn btn-secondary btn-icon" onClick={onClose}>✕</button>
                </div>
                <div className="modal-body">
                    {err && <div style={{ background:'#fee2e2',color:'#dc2626',padding:'8px 12px',borderRadius:8,marginBottom:14,fontSize:13 }}>{err}</div>}
                    <div className="form-group">
                        <label className="form-label">Maquinaria <span className="req">*</span></label>
                        <select className="form-select" value={form.maquinariaId} onChange={f('maquinariaId')}>
                            <option value="">Seleccione una maquinaria</option>
                            {maquinas.map(m => <option key={m.idMaquinaria} value={m.idMaquinaria}>{m.nombre} ({m.codigo})</option>)}
                        </select>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Tipo <span className="req">*</span></label>
                            <select className="form-select" value={form.tipo} onChange={f('tipo')}>
                                {TIPOS_MANT.map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Fecha programada <span className="req">*</span></label>
                            <input type="date" className="form-input" value={form.fechaInicio||''} onChange={f('fechaInicio')} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Técnico asignado</label>
                        <select className="form-select" value={form.tecnicoId||''} onChange={f('tecnicoId')}>
                            <option value="">Seleccione un técnico</option>
                            {tecnicos.map(t => <option key={t.idTecnico} value={t.idTecnico}>{t.nombre}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Descripción <span className="req">*</span></label>
                        <textarea className="form-textarea" value={form.descripcion} onChange={f('descripcion')} placeholder="Descripción del mantenimiento..." />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Observaciones</label>
                        <textarea className="form-textarea" value={form.observaciones||''} onChange={f('observaciones')} placeholder="Observaciones opcionales..." style={{ minHeight:60 }} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Estado <span className="req">*</span></label>
                        <select className="form-select" value={form.estado} onChange={f('estado')}>
                            {ESTADOS_MANT.map(s => <option key={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                    <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
                        {loading ? 'Guardando...' : (isEdit ? 'Guardar cambios' : 'Guardar mantenimiento')}
                    </button>
                </div>
            </div>
        </div>
    );
}

export function MantenimientosPage() {
    const { user } = useAuth();
    const canCreate = ['ADMIN','JEFE_MANTENIMIENTO','TECNICO'].includes(user?.rol);
    const canDelete = ['ADMIN','JEFE_MANTENIMIENTO'].includes(user?.rol);

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('');
    const [modal, setModal] = useState(null);
    const [detail, setDetail] = useState(null);
    const [page, setPage] = useState(1);
    const PER_PAGE = 8;

    const load = async () => {
        setLoading(true);
        try { const r = await mantenimientoApi.getAll(); setItems(r.data || []); }
        catch { setItems([]); } finally { setLoading(false); }
    };
    useEffect(() => { load(); }, []);

    const filtered = items.filter(m => {
        const q = search.toLowerCase();
        return (!q || m.descripcion?.toLowerCase().includes(q))
            && (!filtroEstado || m.estado === filtroEstado)
            && (!filtroTipo   || m.tipo === filtroTipo);
    });
    const totalPages = Math.ceil(filtered.length / PER_PAGE);
    const paged = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);

    return (
        <div>
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Mantenimientos</h1>
                    <p>Consulta y gestiona los mantenimientos registrados.</p>
                </div>
                {canCreate && <button className="btn btn-primary" onClick={() => setModal('new')}><Plus size={16} />Nuevo Mantenimiento</button>}
            </div>

            <div className="card">
                <div className="card-body" style={{ paddingBottom:0 }}>
                    <div className="filter-row">
                        <div className="search-bar" style={{ flex:1 }}>
                            <Search size={15} /><input placeholder="Buscar..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} />
                        </div>
                        <select className="form-select" style={{ width:160 }} value={filtroEstado} onChange={e=>{setFiltroEstado(e.target.value);setPage(1);}}>
                            <option value="">Todos los estados</option>
                            {ESTADOS_MANT.map(s=><option key={s}>{s}</option>)}
                        </select>
                        <select className="form-select" style={{ width:140 }} value={filtroTipo} onChange={e=>{setFiltroTipo(e.target.value);setPage(1);}}>
                            <option value="">Todos los tipos</option>
                            {TIPOS_MANT.map(t=><option key={t}>{t}</option>)}
                        </select>
                    </div>
                </div>
                <div className="table-wrap">
                    <table>
                        <thead><tr><th>ID</th><th>Código</th><th>Descripción</th><th>Tipo</th><th>Fecha</th><th>Estado</th><th>Acción</th></tr></thead>
                        <tbody>
                        {loading && <tr><td colSpan={7} style={{ textAlign:'center',padding:30,color:'var(--text-muted)' }}>Cargando...</td></tr>}
                        {!loading && paged.map((m,i) => (
                            <tr key={m.idMantenimiento||i}>
                                <td style={{ color:'var(--text-muted)',fontSize:12 }}>{(page-1)*PER_PAGE+i+1}</td>
                                <td><span className="badge badge-blue" style={{ fontFamily:'monospace' }}>MTO-{String(m.idMantenimiento||i+1).padStart(3,'0')}</span></td>
                                <td><span className="link" onClick={()=>setDetail(m)}>{m.descripcion||'—'}</span></td>
                                <td><span className="badge badge-info">{m.tipo||'—'}</span></td>
                                <td>{m.fechaInicio||'—'}</td>
                                <td>{getBadge(m.estado||'Pendiente')}</td>
                                <td>
                                    <div style={{ display:'flex',gap:6 }}>
                                        <button className="btn btn-secondary btn-icon" onClick={()=>setDetail(m)}><Eye size={14}/></button>
                                        {canCreate && <button className="btn btn-secondary btn-icon" onClick={()=>setModal(m)}><Pencil size={14}/></button>}
                                        {canDelete && <button className="btn btn-danger btn-icon" onClick={async()=>{ if(confirm('¿Eliminar?'))await mantenimientoApi.delete(m.idMantenimiento).then(load); }}><Trash2 size={14}/></button>}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {!loading&&!paged.length&&<tr><td colSpan={7} style={{ textAlign:'center',padding:30,color:'var(--text-muted)' }}>Sin resultados</td></tr>}
                        </tbody>
                    </table>
                </div>
                {totalPages>1&&(
                    <div style={{ padding:'14px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',borderTop:'1px solid var(--border)' }}>
                        <span className="page-info">Mostrando {(page-1)*PER_PAGE+1}-{Math.min(page*PER_PAGE,filtered.length)} de {filtered.length}</span>
                        <div className="pagination">
                            <button className="page-btn" onClick={()=>setPage(p=>Math.max(1,p-1))}>‹</button>
                            {Array.from({length:totalPages},(_,i)=><button key={i} className={`page-btn ${page===i+1?'active':''}`} onClick={()=>setPage(i+1)}>{i+1}</button>)}
                            <button className="page-btn" onClick={()=>setPage(p=>Math.min(totalPages,p+1))}>›</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Detail modal */}
            {detail && (
                <div className="modal-overlay" onClick={()=>setDetail(null)}>
                    <div className="modal" style={{ maxWidth:580 }} onClick={e=>e.stopPropagation()}>
                        <div className="modal-header">
                            <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                                <div style={{ width:36,height:36,borderRadius:9,background:'rgba(245,195,0,.15)',color:'#f5c300',display:'flex',alignItems:'center',justifyContent:'center' }}>
                                    <Wrench size={18}/>
                                </div>
                                <div>
                                    <div style={{ fontWeight:800,color:'var(--text-primary)' }}>{detail.descripcion}</div>
                                    <div style={{ fontSize:12,color:'var(--text-muted)' }}>
                                        MTO-{String(detail.idMantenimiento||'').padStart(3,'0')} · {detail.tipo}
                                    </div>
                                </div>
                            </div>
                            <button className="btn btn-secondary btn-icon" onClick={()=>setDetail(null)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div style={{ display:'flex',gap:8,marginBottom:16,flexWrap:'wrap' }}>
                                {getBadge(detail.estado||'ACTIVO')}
                                <span className="badge badge-blue">{detail.tipo}</span>
                            </div>
                            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16 }}>
                                {[
                                    ['Fecha',          detail.fecha||detail.fechaInicio||'—'],
                                    ['Maquinaria ID',  detail.idMaquinaria ? `#${detail.idMaquinaria}` : '—'],
                                    ['Técnico ID',     detail.idTecnicoPrincipal ? `#${detail.idTecnicoPrincipal}` : '—'],
                                    ['Estado',         detail.estado||'—'],
                                ].map(([k,v])=>(
                                    <div key={k} style={{ background:'#181818',borderRadius:8,padding:'10px 12px' }}>
                                        <div style={{ fontSize:11,color:'#666',fontWeight:600,textTransform:'uppercase',letterSpacing:.5,marginBottom:4 }}>{k}</div>
                                        <div style={{ fontSize:13,fontWeight:600,color:'#f0f0f0' }}>{v}</div>
                                    </div>
                                ))}
                            </div>
                            {detail.observaciones && (
                                <div style={{ background:'#181818',borderRadius:8,padding:'12px' }}>
                                    <div style={{ fontSize:11,color:'#666',fontWeight:600,textTransform:'uppercase',letterSpacing:.5,marginBottom:6 }}>Observaciones</div>
                                    <p style={{ fontSize:13,color:'#aaa',lineHeight:1.7,margin:0 }}>{detail.observaciones}</p>
                                </div>
                            )}
                            {canCreate && detail.estado === 'ACTIVO' && (
                                <div style={{ marginTop:16,paddingTop:16,borderTop:'1px solid #2d2d2d',display:'flex',gap:10 }}>
                                    <button className="btn btn-primary" style={{ flex:1 }}
                                            onClick={async()=>{
                                                if(confirm('¿Marcar como finalizado?')) {
                                                    await mantenimientoApi.finalizar(detail.idMantenimiento).catch(()=>{});
                                                    setDetail(null); load();
                                                }
                                            }}>
                                        ✓ Finalizar mantenimiento
                                    </button>
                                    <button className="btn btn-secondary" onClick={()=>{ setModal(detail); setDetail(null); }}>
                                        <Pencil size={14}/> Editar
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {modal&&<MantModal item={modal==='new'?null:modal} onClose={()=>setModal(null)} onSave={()=>{setModal(null);load();}} />}
        </div>
    );
}
