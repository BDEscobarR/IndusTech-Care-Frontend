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
        <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'DM Sans', sans-serif" }}>

            {/* Left — industrial photo panel */}
            <div style={{
                flex: '0 0 45%',
                background: 'linear-gradient(160deg, #0f172a 0%, #1e3a5f 50%, #1a56db22 100%)',
                position: 'relative', overflow: 'hidden',
                display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 40,
            }}
                 className="login-left"
            >
                {/* Geometric overlay */}
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231a56db' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />

                {/* Industrial towers illustration via CSS */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to bottom, transparent 30%, rgba(15,23,42,.85) 100%)',
                }} />

                {/* Content over photo */}
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: '#1a56db', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Settings2 size={22} color="#fff" />
                        </div>
                        <div>
                            <div style={{ color: '#fff', fontSize: 20, fontWeight: 900, letterSpacing: -.3 }}>
                                INDUSTECH <span style={{ color: '#60a5fa' }}>CARE</span>
                            </div>
                            <div style={{ color: '#94a3b8', fontSize: 11 }}>Sistema de Gestión de Mantenimiento Industrial</div>
                        </div>
                    </div>

                    <p style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.7, maxWidth: 320 }}>
                        Gestión centralizada de maquinaria, mantenimientos preventivos y correctivos, control de fallas y repuestos.
                    </p>

                    <div style={{ display: 'flex', gap: 20, marginTop: 24 }}>
                        {[['24', 'Máquinas'], ['56', 'Mant. activos'], ['18', 'Técnicos']].map(([n, l]) => (
                            <div key={l}>
                                <div style={{ color: '#fff', fontSize: 22, fontWeight: 800 }}>{n}</div>
                                <div style={{ color: '#64748b', fontSize: 11 }}>{l}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right — login form */}
            <div style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '40px 20px', background: '#f8fafc',
            }}>
                <div style={{ width: '100%', maxWidth: 400 }}>

                    {/* Mobile logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}
                         className="login-mobile-logo">
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#1a56db', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Settings2 size={20} color="#fff" />
                        </div>
                        <div>
                            <div style={{ fontSize: 18, fontWeight: 900, color: '#0f172a' }}>
                                INDUSTECH <span style={{ color: '#1a56db' }}>CARE</span>
                            </div>
                            <div style={{ fontSize: 11, color: '#94a3b8' }}>Sistema de Gestión de Mantenimiento</div>
                        </div>
                    </div>

                    <h2 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', marginBottom: 4 }}>Iniciar sesión</h2>
                    <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 32 }}>Ingresa tus credenciales para continuar</p>

                    <form onSubmit={handleSubmit}>
                        {/* Usuario */}
                        <div style={{ marginBottom: 18 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 7 }}>
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
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 7 }}>
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
                                <button
                                    type="button"
                                    onClick={() => setShow(!show)}
                                    style={{
                                        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8',
                                        display: 'flex', alignItems: 'center',
                                    }}
                                >
                                    {show ? <EyeOff size={17} /> : <Eye size={17} />}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {err && (
                            <div style={{
                                background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca',
                                borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16,
                            }}>
                                {err}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%', padding: '13px 20px', borderRadius: 10,
                                background: loading ? '#93c5fd' : '#1a56db', color: '#fff',
                                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                                fontWeight: 700, fontSize: 15, fontFamily: 'inherit',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                transition: 'background .15s',
                            }}
                        >
                            <LogIn size={18} />
                            {loading ? 'Verificando...' : 'Ingresar'}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: 32 }}>
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
