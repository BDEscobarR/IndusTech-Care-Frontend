import { useState, useEffect } from 'react';
import { usuarioApi } from '../services/api';
import { Pencil, Trash2, Phone, MapPin, Wrench, CheckCircle, XCircle, Search } from 'lucide-react';

const AC = ['#f5c300','#60a5fa','#34d399','#f87171','#a78bfa','#fb923c','#38bdf8'];
const initials = n => (n||'?').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();

function TecnicoCard({ tecnico, index, onEdit, onDelete }) {
    const color = AC[index % AC.length];
    const disponible = tecnico.disponible ?? false;

    return (
        <div style={{
            background:'#1e1e1e', border:'1px solid #2d2d2d', borderRadius:16,
            padding:22, boxShadow:'0 2px 8px rgba(0,0,0,.3)',
            display:'flex', flexDirection:'column',
            transition:'border-color .2s',
        }}>
            {/* Header */}
            <div style={{ display:'flex', alignItems:'flex-start', gap:14, marginBottom:16 }}>
                <div style={{
                    width:52, height:52, borderRadius:'50%',
                    background: color + '22', color,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontWeight:800, fontSize:16, flexShrink:0,
                    border:`2px solid ${color}55`,
                }}>
                    {initials(tecnico.nombre)}
                </div>
                <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:15, color:'#f0f0f0', marginBottom:3 }}>
                        {tecnico.nombre}
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'#888' }}>
                        <Wrench size={12} color="#888"/>
                        {tecnico.especialidad || 'Sin especialidad asignada'}
                    </div>
                </div>
            </div>

            {/* ID y disponibilidad */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                    {disponible
                        ? <span style={{ display:'flex',alignItems:'center',gap:4,background:'rgba(34,197,94,.15)',color:'#22c55e',fontSize:11,fontWeight:600,padding:'3px 10px',borderRadius:99 }}>
                <CheckCircle size={11}/> Disponible
              </span>
                        : <span style={{ display:'flex',alignItems:'center',gap:4,background:'rgba(239,68,68,.15)',color:'#ef4444',fontSize:11,fontWeight:600,padding:'3px 10px',borderRadius:99 }}>
                <XCircle size={11}/> Ocupado
              </span>
                    }
                    <span style={{ background:'rgba(245,195,0,.12)',color:'#f5c300',fontSize:11,fontWeight:600,padding:'3px 10px',borderRadius:99 }}>
            USR-{String(tecnico.idUsuario||0).padStart(3,'0')}
          </span>
                </div>
                <div style={{ display:'flex', gap:6 }}>
                    <button className="btn btn-secondary btn-icon" onClick={() => onEdit(tecnico)}><Pencil size={14}/></button>
                    <button className="btn btn-danger btn-icon" onClick={() => onDelete(tecnico.idUsuario)}><Trash2 size={14}/></button>
                </div>
            </div>

            {/* Contacto */}
            <div style={{ borderTop:'1px solid #2d2d2d', paddingTop:12, display:'flex', flexDirection:'column', gap:6 }}>
                {tecnico.telefono && (
                    <div style={{ display:'flex',alignItems:'center',gap:8,fontSize:13,color:'#aaa' }}>
                        <Phone size={13} color="#f5c300"/> {tecnico.telefono}
                    </div>
                )}
                {tecnico.direccion && (
                    <div style={{ display:'flex',alignItems:'center',gap:8,fontSize:12,color:'#666' }}>
                        <MapPin size={12} color="#666"/>
                        <span style={{ overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{tecnico.direccion}</span>
                    </div>
                )}
                {!tecnico.telefono && !tecnico.direccion && (
                    <div style={{ fontSize:12,color:'#555' }}>Sin datos de contacto</div>
                )}
            </div>
        </div>
    );
}

export function TecnicosPage() {
    const [tecnicos, setTecnicos] = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [filtro,   setFiltro]   = useState('todos');
    const [search,   setSearch]   = useState('');

    const load = async () => {
        setLoading(true);
        try {
            const r = await usuarioApi.getTecnicos();
            setTecnicos(r.data || r || []);
        } catch { setTecnicos([]); }
        finally { setLoading(false); }
    };
    useEffect(() => { load(); }, []);

    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar este técnico?')) return;
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
            </div>

            {/* Stats */}
            <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' }}>
                {[
                    ['Total',       stats.total,       '#f5c300'],
                    ['Disponibles', stats.disponibles, '#22c55e'],
                    ['Ocupados',    stats.ocupados,    '#f87171'],
                ].map(([l,v,c])=>(
                    <div key={l} style={{
                        background:'#1e1e1e', border:'1px solid #2d2d2d', borderRadius:12,
                        padding:'14px 24px', display:'flex', alignItems:'center', gap:14,
                        boxShadow:'0 2px 8px rgba(0,0,0,.3)',
                    }}>
                        <div style={{ fontSize:28, fontWeight:900, color:c, lineHeight:1 }}>{v}</div>
                        <div style={{ fontSize:12, color:'#888', fontWeight:500 }}>{l}</div>
                    </div>
                ))}
            </div>

            {/* Filtros */}
            <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap', alignItems:'center' }}>
                <div className="search-bar" style={{ flex:1, minWidth:200 }}>
                    <Search size={15}/>
                    <input placeholder="Buscar por nombre o especialidad..." value={search}
                           onChange={e => setSearch(e.target.value)}/>
                </div>
                {[['todos','Todos'],['disponibles','Disponibles'],['ocupados','Ocupados']].map(([v,l])=>(
                    <button key={v} onClick={() => setFiltro(v)} style={{
                        padding:'8px 18px', borderRadius:20, border:'1.5px solid',
                        borderColor: filtro===v ? '#f5c300' : '#2d2d2d',
                        background: filtro===v ? '#f5c300' : 'transparent',
                        color: filtro===v ? '#111' : '#888',
                        fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit',
                        transition:'all .15s',
                    }}>{l}</button>
                ))}
            </div>

            {/* Cards */}
            {loading ? (
                <div style={{ textAlign:'center',padding:48,color:'#555' }}>Cargando técnicos...</div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign:'center',padding:48,color:'#555' }}>
                    <div style={{ fontSize:36,marginBottom:10 }}>👷</div>
                    <div>{search ? 'Sin resultados.' : 'No hay técnicos registrados.'}</div>
                </div>
            ) : (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))', gap:16 }}>
                    {filtered.map((t,i) => (
                        <TecnicoCard key={t.idUsuario||i} tecnico={t} index={i}
                                     onEdit={() => {}} onDelete={handleDelete}/>
                    ))}
                </div>
            )}

            <div style={{ marginTop:16, fontSize:12, color:'#555' }}>
                💡 Para crear técnicos ve a <strong style={{ color:'#f5c300' }}>Usuarios</strong>.
            </div>
        </div>
    );
}
