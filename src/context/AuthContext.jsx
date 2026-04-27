import { createContext, useContext, useState } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const stored = sessionStorage.getItem('it_user');
        return stored ? JSON.parse(stored) : null;
    });

    const login = async (nombre, contrasena) => {
        const res = await authApi.login(nombre, contrasena);
        if (res.success) {
            const userData = res.data;
            // CONSULTOR no puede acceder a la web — bloquear antes de setUser
            if (userData.rol === 'CONSULTOR') {
                throw new Error('⚠️ Los consultores no tienen acceso a la versión web. Por favor usa la app móvil IndusTech Care.');
            }
            sessionStorage.setItem('it_token', userData.token);
            sessionStorage.setItem('it_user', JSON.stringify(userData));
            setUser(userData);
            return userData;
        }
        throw new Error(res.message || 'Credenciales inválidas');
    };

    const logout = () => {
        sessionStorage.clear();
        setUser(null);
    };

    // Permission check
    const can = (action) => {
        if (!user) return false;
        const rol = user.rol;
        const perms = {
            ADMIN: ['*'],
            JEFE_MANTENIMIENTO: ['view_all', 'create_mant', 'edit_mant', 'create_falla', 'view_tecnicos', 'view_reportes'],
            TECNICO: ['view_maq', 'create_mant', 'edit_mant', 'view_falla', 'create_falla', 'view_repuestos'],
            CONSULTOR: ['view_maq', 'view_mant', 'view_falla', 'create_falla', 'view_repuestos', 'view_reportes', 'view_usuarios'],
        };
        const p = perms[rol] || [];
        return p.includes('*') || p.includes(action);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, can }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
