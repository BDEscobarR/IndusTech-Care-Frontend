import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fallaApi, maquinariaApi } from '../services/api';
import { Plus, Search, Eye, Pencil, Trash2, AlertTriangle } from 'lucide-react';

const GRAVEDADES = ['Alta','Media','Baja','Crítica'];

function GravedadBadge({ g }) {
    const m = { 'Alta':'badge-danger','ALTA':'badge-danger','Media':'badge-warning','MEDIA':'badge-warning','Baja':'badge-success','BAJA':'badge-success','Crítica':'badge-danger','CRITICA':'badge-danger' };
    return <span className={`badge ${m[g]||'badge-gray'}`}>{g}</span>;
}

function FallaModal({ item, onClose, onSave }) {
    const isEdit = !!item?.idFalla;
    const [maquinas, setMaquinas] = useState([]);
    const [form, setForm] = useState(item || { descripcion:'', gravedad:'Media', maquinariaId:'', ubicacion:'', reportadoPor:'' });
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');
    const f = k => e => setForm({ ...form, [k]: e.target.value });

    useEffect(() => { maquinariaApi.getAll().then(r=>setMaquinas(r.data||[])).catch(()=>{}); }, []);

    const handleSave = async () => {
        if (!form.descripcion) { setErr('La descripción es requerida'); return; }
        setLoading(true);
        try {
            if (isEdit) await fallaApi.update(form.idFalla, form);
            else await fallaApi.create({ ...form, activa: true, fechaDeteccion: new Date().toISOString().slice(0,10) });
            onSave();
        } catch { setErr('Error al guardar'); } finally { setLoading(false); }
    };

    return (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
            <div className="modal">
                <div className="modal-header">
                    <span className="modal-title">{isEdit?'Editar falla':'Reportar Nueva Falla'}</span>
                    <button className="btn btn-secondary btn-icon" onClick={onClose}>✕</button>
                </div>
                <div className="modal-body">
                    {err&&<div style={{ background:'#fee2e2',color:'#dc2626',padding:'8px 12px',borderRadius:8,marginBottom:14,fontSize:13 }}>{err}</div>}
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Maquinaria <span className="req">*</span></label>
                            <select className="form-select" value={form.maquinariaId||''} onChange={f('maquinariaId')}>
                                <option value="">Seleccione una maquinaria</option>
                                {maquinas.map(m=><option key={m.idMaquinaria} value={m.idMaquinaria}>{m.nombre}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Prioridad <span className="req">*</span></label>
                            <select className="form-select" value={form.gravedad} onChange={f('gravedad')}>
                                {GRAVEDADES.map(g=><option key={g}>{g}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Descripción de la Falla <span className="req">*</span></label>
                        <textarea className="form-textarea" value={form.descripcion} onChange={f('descripcion')} placeholder="Describa detalladamente la falla encontrada..." />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Ubicación</label>
                            <input className="form-input" value={form.ubicacion||''} onChange={f('ubicacion')} placeholder="Área o zona" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Reportado por <span className="req">*</span></label>
                            <input className="form-input" value={form.reportadoPor||''} onChange={f('reportadoPor')} placeholder="Nombre del reportante" />
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                    <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
                        {loading?'Guardando...':(isEdit?'Guardar cambios':'Guardar falla')}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function FallasPage() {
    const { user } = useAuth();
    const canCreate = ['ADMIN','JEFE_MANTENIMIENTO','TECNICO','CONSULTOR'].includes(user?.rol);
    const canEdit   = ['ADMIN','JEFE_MANTENIMIENTO'].includes(user?.rol);
    const canCerrar = ['ADMIN','JEFE_MANTENIMIENTO','TECNICO'].includes(user?.rol);
    const canDelete = canEdit;

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');
    const [filtroGravedad, setFiltroGravedad] = useState('');
    const [modal, setModal] = useState(null);
    const [detail, setDetail] = useState(null);
    const [page, setPage] = useState(1);
    const PER_PAGE = 8;

    const load = async () => {
        setLoading(true);
        try { const r = await fallaApi.getAll(); setItems(r.data||[]); }
        catch { setItems([]); } finally { setLoading(false); }
    };
    useEffect(()=>{ load(); },[]);

    const filtered = items.filter(f => {
        const q = search.toLowerCase();
        return (!q||f.descripcion?.toLowerCase().includes(q))
            && (!filtroEstado||(filtroEstado==='Activa'?f.activa:!f.activa))
            && (!filtroGravedad||f.gravedad===filtroGravedad);
    });
    const totalPages = Math.ceil(filtered.length/PER_PAGE);
    const paged = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);

    return (
        <div>
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Fallas</h1>
                    <p>Consulta y gestiona las fallas reportadas en el sistema.</p>
                </div>
                {canCreate&&<button className="btn btn-primary" onClick={()=>setModal('new')}><Plus size={16}/>Reportar Falla</button>}
            </div>

            <div className="card">
                <div className="card-body" style={{ paddingBottom:0 }}>
                    <div className="filter-row">
                        <div className="search-bar" style={{ flex:1 }}>
                            <Search size={15}/><input placeholder="Buscar falla..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} />
                        </div>
                        <select className="form-select" style={{ width:150 }} value={filtroEstado} onChange={e=>{setFiltroEstado(e.target.value);setPage(1);}}>
                            <option value="">Todos los estados</option>
                            <option value="Activa">Activa</option>
                            <option value="Cerrada">Cerrada</option>
                        </select>
                        <select className="form-select" style={{ width:140 }} value={filtroGravedad} onChange={e=>{setFiltroGravedad(e.target.value);setPage(1);}}>
                            <option value="">Todas las prioridades</option>
                            {GRAVEDADES.map(g=><option key={g}>{g}</option>)}
                        </select>
                    </div>
                </div>
                <div className="table-wrap">
                    <table>
                        <thead><tr><th>ID</th><th>Código</th><th>Descripción</th><th>Prioridad</th><th>Fecha</th><th>Estado</th><th>Acción</th></tr></thead>
                        <tbody>
                        {loading&&<tr><td colSpan={7} style={{ textAlign:'center',padding:30,color:'var(--text-muted)' }}>Cargando...</td></tr>}
                        {!loading&&paged.map((f,i)=>(
                            <tr key={f.idFalla||i}>
                                <td style={{ color:'var(--text-muted)',fontSize:12 }}>{(page-1)*PER_PAGE+i+1}</td>
                                <td><span className="badge badge-blue" style={{ fontFamily:'monospace' }}>FAL-{String(f.idFalla||i+1).padStart(3,'0')}</span></td>
                                <td><span className="link" onClick={()=>setDetail(f)}>{f.descripcion||'—'}</span></td>
                                <td><GravedadBadge g={f.gravedad}/></td>
                                <td>{f.fechaDeteccion||'—'}</td>
                                <td>{f.activa?<span className="badge badge-danger">Abierta</span>:<span className="badge badge-success">Cerrada</span>}</td>
                                <td>
                                    <div style={{ display:'flex',gap:6 }}>
                                        <button className="btn btn-secondary btn-icon" onClick={()=>setDetail(f)}><Eye size={14}/></button>
                                        {canCerrar && f.activa && (
                                            <button className="btn btn-secondary btn-icon" title="Cerrar falla"
                                                    style={{ color:'#16a34a',borderColor:'#16a34a' }}
                                                    onClick={async()=>{
                                                        if(confirm('¿Marcar esta falla como cerrada/resuelta?'))
                                                            await fallaApi.cerrar(f.idFalla).then(load).catch(()=>{});
                                                    }}>✓</button>
                                        )}
                                        {canEdit&&<button className="btn btn-secondary btn-icon" onClick={()=>setModal(f)}><Pencil size={14}/></button>}
                                        {canDelete&&<button className="btn btn-danger btn-icon" onClick={async()=>{if(confirm('¿Eliminar?'))await fallaApi.delete(f.idFalla).then(load);}}><Trash2 size={14}/></button>}
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

            {detail&&(
                <div className="modal-overlay" onClick={()=>setDetail(null)}>
                    <div className="modal" style={{ maxWidth:600 }} onClick={e=>e.stopPropagation()}>
                        <div className="modal-header">
                            <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                                <div style={{ width:36,height:36,borderRadius:9,background:'#fee2e2',color:'#dc2626',display:'flex',alignItems:'center',justifyContent:'center' }}><AlertTriangle size={18}/></div>
                                <div>
                                    <div style={{ fontWeight:800 }}>FAL-{String(detail.idFalla||'').padStart(3,'0')}</div>
                                    <div style={{ fontSize:12,color:'var(--text-muted)' }}>Falla Reportada</div>
                                </div>
                                <GravedadBadge g={detail.gravedad}/>
                            </div>
                            <button className="btn btn-secondary btn-icon" onClick={()=>setDetail(null)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="info-section-title">Información General</div>
                            {[['Descripción',detail.descripcion],['Gravedad',detail.gravedad],['Fecha',detail.fechaDeteccion],['Maquinaria ID',detail.maquinariaId],['Ubicación',detail.ubicacion||'—'],['Reportado por',detail.reportadoPor||'—'],['Estado',detail.activa?'Abierta':'Cerrada']].map(([k,v])=>(
                                <div className="info-row" key={k}><span className="info-key">{k}:</span><span className="info-val">{v||'—'}</span></div>
                            ))}
                        </div>
                        {canCerrar && detail.activa && (
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={()=>setDetail(null)}>Cerrar ventana</button>
                                <button className="btn btn-primary" style={{ background:'#16a34a' }}
                                        onClick={async()=>{
                                            if(confirm('¿Marcar esta falla como resuelta?')) {
                                                await fallaApi.cerrar(detail.idFalla).catch(()=>{});
                                                setDetail(null);
                                                load();
                                            }
                                        }}>
                                    ✓ Marcar como resuelta
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {modal&&<FallaModal item={modal==='new'?null:modal} onClose={()=>setModal(null)} onSave={()=>{setModal(null);load();}} />}
        </div>
    );
}
