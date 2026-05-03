import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Settings2, LogIn } from 'lucide-react';

export default function LoginPage() {
    const { login } = useAuth();
    const [form, setForm]   = useState({ nombre: '', contrasena: '' });
    const [show, setShow]   = useState(false);
    const [err, setErr]     = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.nombre || !form.contrasena) { setErr('Completa todos los campos'); return; }
        setLoading(true); setErr('');
        try {
            await login(form.nombre, form.contrasena);
        } catch (e) {
            setErr(e.message || 'Usuario o contraseña incorrectos');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'DM Sans', sans-serif", background: '#141414' }}>

            {/* Left panel */}
            <div style={{
                flex: '0 0 45%',
                background: 'linear-gradient(160deg, #0d0d0d 0%, #1a1a1a 50%, #1e1e1e 100%)',
                position: 'relative', overflow: 'hidden',
                display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 40,
                borderRight: '1px solid #2d2d2d',
            }} className="login-left">

                {/* Grid pattern */}
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f5c300' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />

                {/* Gradient overlay */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to bottom, transparent 30%, rgba(13,13,13,.95) 100%)',
                }} />

                {/* Decorative circles */}
                <div style={{ position:'absolute', top:-80, right:-80, width:320, height:320, borderRadius:'50%', background:'rgba(245,195,0,.04)', border:'1px solid rgba(245,195,0,.08)' }}/>
                <div style={{ position:'absolute', top:40, right:40, width:180, height:180, borderRadius:'50%', background:'rgba(245,195,0,.03)', border:'1px solid rgba(245,195,0,.06)' }}/>

                {/* Content */}
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 14, background: '#f5c300', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(245,195,0,.3)' }}>
                            <Settings2 size={24} color="#111" />
                        </div>
                        <div>
                            <div style={{ color: '#f0f0f0', fontSize: 22, fontWeight: 900, letterSpacing: -.3 }}>
                                INDUSTECH <span style={{ color: '#f5c300' }}>CARE</span>
                            </div>
                            <div style={{ color: '#555', fontSize: 11 }}>Sistema de Gestión de Mantenimiento Industrial</div>
                        </div>
                    </div>

                    <p style={{ color: '#666', fontSize: 13, lineHeight: 1.8, maxWidth: 320, marginBottom: 28 }}>
                        Gestión centralizada de maquinaria, mantenimientos preventivos y correctivos, control de fallas y repuestos.
                    </p>

                    <div style={{ display: 'flex', gap: 24 }}>
                        {[['24', 'Máquinas'], ['56', 'Mant. activos'], ['18', 'Técnicos']].map(([n, l]) => (
                            <div key={l}>
                                <div style={{ color: '#f5c300', fontSize: 24, fontWeight: 900, lineHeight: 1 }}>{n}</div>
                                <div style={{ color: '#555', fontSize: 11, marginTop: 4 }}>{l}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right — login form */}
            <div style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '40px 20px', background: '#141414',
            }}>
                <div style={{ width: '100%', maxWidth: 400 }}>

                    {/* Mobile logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}
                         className="login-mobile-logo">
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f5c300', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Settings2 size={20} color="#111" />
                        </div>
                        <div>
                            <div style={{ fontSize: 18, fontWeight: 900, color: '#f0f0f0' }}>
                                INDUSTECH <span style={{ color: '#f5c300' }}>CARE</span>
                            </div>
                            <div style={{ fontSize: 11, color: '#555' }}>Sistema de Gestión de Mantenimiento</div>
                        </div>
                    </div>

                    <h2 style={{ fontSize: 26, fontWeight: 900, color: '#f0f0f0', marginBottom: 4 }}>Iniciar sesión</h2>
                    <p style={{ fontSize: 14, color: '#666', marginBottom: 32 }}>Ingresa tus credenciales para continuar</p>

                    <form onSubmit={handleSubmit}>
                        {/* Usuario */}
                        <div style={{ marginBottom: 18 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#aaa', marginBottom: 7 }}>
                                Usuario
                            </label>
                            <input
                                className="form-input"
                                type="text"
                                placeholder="Ingrese su usuario"
                                value={form.nombre}
                                onChange={e => setForm({ ...form, nombre: e.target.value })}
                                autoComplete="username"
                            />
                        </div>

                        {/* Contraseña */}
                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#aaa', marginBottom: 7 }}>
                                Contraseña
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    className="form-input"
                                    type={show ? 'text' : 'password'}
                                    placeholder="Ingrese su contraseña"
                                    value={form.contrasena}
                                    onChange={e => setForm({ ...form, contrasena: e.target.value })}
                                    style={{ paddingRight: 44 }}
                                    autoComplete="current-password"
                                />
                                <button type="button" onClick={() => setShow(!show)} style={{
                                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', cursor: 'pointer', color: '#666',
                                    display: 'flex', alignItems: 'center',
                                }}>
                                    {show ? <EyeOff size={17} /> : <Eye size={17} />}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {err && (
                            <div style={{
                                background: 'rgba(239,68,68,.12)', color: '#f87171',
                                border: '1px solid rgba(239,68,68,.25)',
                                borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16,
                            }}>
                                {err}
                            </div>
                        )}

                        <button type="submit" disabled={loading} style={{
                            width: '100%', padding: '14px 20px', borderRadius: 10,
                            background: loading ? '#c49a00' : '#f5c300',
                            color: '#111', border: 'none',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontWeight: 800, fontSize: 15, fontFamily: 'inherit',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            transition: 'all .15s',
                            boxShadow: loading ? 'none' : '0 0 20px rgba(245,195,0,.25)',
                        }}>
                            <LogIn size={18} />
                            {loading ? 'Verificando...' : 'Ingresar'}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', fontSize: 12, color: '#444', marginTop: 32 }}>
                        © 2024 INDUSTECH CARE. Todos los derechos reservados.
                    </p>
                </div>
            </div>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        @media (max-width: 768px) {
          .login-left { display: none !important; }
        }
      `}</style>
        </div>
    );
}
