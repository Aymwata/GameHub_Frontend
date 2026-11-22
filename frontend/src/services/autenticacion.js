const CLAVE_SESION = 'gamehub-sesion';
const API_URL = 'http://localhost:8080/api/v1';


export function guardarSesion(datos) {
    try {
        const sesion = {
            token: datos.token,
            rol: (datos.rol || 'CLIENTE').toUpperCase(), // 'ADMIN' o 'CLIENTE'
            nombre: datos.nombre || '',
            correo: datos.correo || ''
        };
        localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
        return sesion;
    } catch {
        return null;
    }
}


export function obtenerSesion() {
    try {
        const guardado = localStorage.getItem(CLAVE_SESION);
        if (!guardado) return null;

        const sesion = JSON.parse(guardado);
        return sesion && sesion.token ? sesion : null;
    } catch {
        return null;
    }
}


export function cerrarSesion() {
    localStorage.removeItem(CLAVE_SESION);
}


export function obtenerHeadersAuth() {
    const sesion = obtenerSesion();
    const headers = { 'Content-Type': 'application/json' };

    if (sesion && sesion.token) {
        headers.Authorization = `Bearer ${sesion.token}`;
    }

    return headers;
}


export async function iniciarSesion(correo, password) {
    const respuesta = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            correo: correo.trim(),
            password
        })
    });

    const datos = await respuesta.json().catch(() => ({}));

    if (!respuesta.ok) {
        throw new Error(datos.mensaje || 'Correo o contraseña incorrectos.');
    }

    return guardarSesion({
        token: datos.token,
        rol: datos.rol,
        nombre: datos.nombre,
        correo: datos.correo || correo.trim()
    });
}


export async function registrarUsuario(datosUsuario) {
    const respuesta = await fetch(`${API_URL}/auth/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            nombre: datosUsuario.nombre.trim(),
            correo: datosUsuario.correo.trim(),
            password: datosUsuario.password
        })
    });

    const datos = await respuesta.json().catch(() => ({}));

    if (!respuesta.ok) {
        throw new Error(datos.mensaje || 'No se pudo completar el registro.');
    }

    return datos;
}