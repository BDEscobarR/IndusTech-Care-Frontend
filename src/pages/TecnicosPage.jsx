import { useState, useEffect } from 'react';
import { usuarioApi } from '../services/api';
import { Pencil, Trash2, Phone, MapPin, Wrench, CheckCircle, XCircle, Search } from 'lucide-react';

const AC = ['#1a56db','#0d9488','#9333ea','#dc2626','#b45309','#0891b2','#16a34a'];
const initials = n => (n||'?').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();

function TecnicoCard({ tecnico, index, onEdit, onDelete }) {
    const color = AC[index % AC.length];
    const disponible = tecnico.disponible ?? false;

    return (
        <div style={{
            background:'#fff', border:'1px solid #e2e8f0', borderRadius:16,
            padding:22, boxShadow:'0 1px 3px rgba(0,0,0,.06)',
            display:'flex', flexDirection:'column',
        }}>
            {/* Header */}
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

            {/* ID y disponibilidad */}
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
            USR-{String(tecnico.idUsuario||0).padStart(3,'0')}
          </span>
                </div>
                <div style={{ display:'flex', gap:6 }}>
                    <button className="btn btn-secondary btn-icon" onClick={() => onEdit(tecnico)}><Pencil size={14}/></button>
                    <button className="btn btn-danger btn-icon" onClick={() => onDelete(tecnico.idUsuario)}><Trash2 size={14}/></button>
                </div>
            </div>

            {/* Contacto */}
            <div style={{ borderTop:'1px solid #f1f5f9', paddingTop:12, display:'flex', flexDirection:'column', gap:6 }}>
                {tecnico.telefono && (
                    <div style={{ display:'flex',alignItems:'center',gap:8,fontSize:13,color:'#475569' }}>
                        <Phone size={13} color="#1a56db"/> {tecnico.telefono}
                    </div>
                )}
                {tecnico.direccion && (
                    <div style={{ display:'flex',alignItems:'center',gap:8,fontSize:12,color:'#94a3b8' }}>
                        <MapPin size={12}/>
                        <span style={{ overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{tecnico.direccion}</span>
                    </div>
                )}
                {!tecnico.telefono && !tecnico.direccion && (
                    <div style={{ fontSize:12,color:'#cbd5e1' }}>Sin datos de contacto</div>
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
            // getTecnicos ya devuelve r.data desde api.js
            setTecnicos(r.data || r || []);
        } catch {
            setTecnicos([]);
        } finally {
            setLoading(false);
        }
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
                {/* Botón eliminado — técnicos se crean desde Usuarios */}
            </div>

            {/* Stats */}
            <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' }}>
                {[['Total',stats.total,'#1a56db'],['Disponibles',stats.disponibles,'#16a34a'],['Ocupados',stats.ocupados,'#d97706']].map(([l,v,c])=>(
                    <div key={l} style={{ background:'#fff',border:'1px solid #e2e8f0',borderRadius:12,padding:'14px 20px',display:'flex',alignItems:'center',gap:12 }}>
                        <div style={{ fontSize:24,fontWeight:900,color:c }}>{v}</div>
                        <div style={{ fontSize:12,color:'#64748b' }}>{l}</div>
                    </div>
                ))}
            </div>

            {/* Filtros */}
            <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap', alignItems:'center' }}>
                <div className="search-bar" style={{ flex:1, minWidth:200 }}>
                    <Search size={15}/>
                    <input
                        placeholder="Buscar por nombre o especialidad..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
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

            {/* Cards */}
            {loading ? (
                <div style={{ textAlign:'center',padding:48,color:'#94a3b8' }}>Cargando técnicos...</div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign:'center',padding:48,color:'#94a3b8' }}>
                    <div style={{ fontSize:36,marginBottom:10 }}>👷</div>
                    <div>{search ? 'Sin resultados.' : 'No hay técnicos registrados.'}</div>
                </div>
            ) : (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
                    {filtered.map((t,i) => (
                        <TecnicoCard
                            key={t.idUsuario||i}
                            tecnico={t}
                            index={i}
                            onEdit={() => {}}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            <div style={{ marginTop:16, fontSize:12, color:'#94a3b8' }}>
                💡 La disponibilidad se calcula automáticamente. Para crear técnicos ve a <strong>Usuarios</strong>.
            </div>
        </div>
    );
}
