import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'https://industech-care-backend-production.up.railway.app/api';

const http = axios.create({ baseURL: BASE });

// Attach JWT to every request
http.interceptors.request.use(cfg => {
    const token = sessionStorage.getItem('it_token');
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
});

// Solo hace logout en 401 (token expirado/inválido)
// 403 = sin permisos para ESE recurso, pero la sesión sigue válida
http.interceptors.response.use(
    r => r,
    err => {
        if (err.response?.status === 401) {
            sessionStorage.clear();
            window.location.href = '/';
        }
        return Promise.reject(err);
    }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
    login: (nombre, contrasena) =>
        http.post('/auth/login', { nombre, contrasena }).then(r => r.data),
};

// ── Maquinaria ────────────────────────────────────────────────────────────────
export const maquinariaApi = {
    getAll:       ()           => http.get('/maquinarias').then(r => r.data),
    getById:      id           => http.get(`/maquinarias/${id}`).then(r => r.data),
    filtrar:      (e, t, q)    => http.get('/maquinarias/filtrar', { params: { estado: e, tipo: t, texto: q } }).then(r => r.data),
    create:       data         => http.post('/maquinarias', data).then(r => r.data),
    update:       (id, data)   => http.put(`/maquinarias/${id}`, data).then(r => r.data),
    delete:       id           => http.delete(`/maquinarias/${id}`).then(r => r.data),
    cambiarEstado:(id, estado) => http.put(`/maquinarias/${id}/estado`, null, { params: { nuevoEstado: estado } }).then(r => r.data),
};

// ── Técnicos ──────────────────────────────────────────────────────────────────
export const tecnicoApi = {
    getAll:   ()         => http.get('/tecnicos').then(r => r.data),
    getById:  id         => http.get(`/tecnicos/${id}`).then(r => r.data),
    create:   data       => http.post('/tecnicos', data).then(r => r.data),
    update:   (id, data) => http.put(`/tecnicos/${id}`, data).then(r => r.data),
    delete:   id         => http.delete(`/tecnicos/${id}`).then(r => r.data),
};

// ── Mantenimientos ────────────────────────────────────────────────────────────
export const mantenimientoApi = {
    getAll:    ()              => http.get('/mantenimientos').then(r => r.data),
    getById:   id              => http.get(`/mantenimientos/${id}`).then(r => r.data),
    filtrar:   (e, t, q)       => http.get('/mantenimientos/filtrar', { params: { estado: e, tipo: t, texto: q } }).then(r => r.data),
    create:    data            => http.post('/mantenimientos', data).then(r => r.data),
    update:    (id, data)      => http.put(`/mantenimientos/${id}`, data).then(r => r.data),
    delete:    id              => http.delete(`/mantenimientos/${id}`).then(r => r.data),
    iniciar:   id              => http.put(`/mantenimientos/${id}/iniciar`).then(r => r.data),
    finalizar: id              => http.put(`/mantenimientos/${id}/finalizar`).then(r => r.data),
};

// ── Fallas ────────────────────────────────────────────────────────────────────
export const fallaApi = {
    getAll:   ()         => http.get('/fallas').then(r => r.data),
    getById:  id         => http.get(`/fallas/${id}`).then(r => r.data),
    getActivas: ()       => http.get('/fallas/activas').then(r => r.data),
    create:   data       => http.post('/fallas', data).then(r => r.data),
    update:   (id, data) => http.put(`/fallas/${id}`, data).then(r => r.data),
    cerrar:   id         => http.put(`/fallas/${id}/cerrar`).then(r => r.data),
    delete:   id         => http.delete(`/fallas/${id}`).then(r => r.data),
};

// ── Alertas ───────────────────────────────────────────────────────────────────
export const alertaApi = {
    getAll:      ()         => http.get('/alertas').then(r => r.data),
    desactivar:  id         => http.put(`/alertas/${id}/desactivar`).then(r => r.data),
};

// ── Repuestos ─────────────────────────────────────────────────────────────────
export const repuestoApi = {
    getAll:   ()         => http.get('/repuestos').then(r => r.data),
    getById:  id         => http.get(`/repuestos/${id}`).then(r => r.data),
    buscar:   texto      => http.get('/repuestos/buscar', { params: { texto } }).then(r => r.data),
    create:   data       => http.post('/repuestos', data).then(r => r.data),
    update:   (id, data) => http.put(`/repuestos/${id}`, data).then(r => r.data),
    delete:   id         => http.delete(`/repuestos/${id}`).then(r => r.data),
};

// ── Reportes ──────────────────────────────────────────────────────────────────
export const reporteApi = {
    getAll:   ()         => http.get('/reportes').then(r => r.data),
    getById:  id         => http.get(`/reportes/${id}`).then(r => r.data),
    create:   data       => http.post('/reportes', data).then(r => r.data),
    delete:   id         => http.delete(`/reportes/${id}`).then(r => r.data),
    cerrar:   id         => http.put(`/reportes/${id}/cerrar`).then(r => r.data),
};

// ── Usuarios ──────────────────────────────────────────────────────────────────
export const usuarioApi = {
    getAll:   ()         => http.get('/usuarios').then(r => r.data),
    getById:  id         => http.get(`/usuarios/${id}`).then(r => r.data),
    create:   data       => http.post('/usuarios', data).then(r => r.data),
    update:   (id, data) => http.put(`/usuarios/${id}`, data).then(r => r.data),
    delete:   id         => http.delete(`/usuarios/${id}`).then(r => r.data),
};