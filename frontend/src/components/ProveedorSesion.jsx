import { useCallback, useEffect, useRef, useState } from 'react';
import { ContextoSesion } from '../services/sesion.js';
import { solicitar } from '../services/api.js';

const cabeceraSesion = { 'X-GameHub-Session': '1' };

export default function ProveedorSesion({ children }) {
    const [estado, setEstado] = useState('cargando');
    const [usuario, setUsuario] = useState(null);
    const acceso = useRef(null);
    const renovacion = useRef(null);

    const actualizar = useCallback((datos, estadoSinSesion = 'invitado') => {
        acceso.current = datos ? { token: datos.accessToken, vence: Date.now() + datos.expiresIn * 1000 } : null;
        setUsuario(datos?.usuario ?? null);
        setEstado(datos ? 'autenticado' : estadoSinSesion);
    }, []);

    const renovar = useCallback(() => {
        if (!renovacion.current) {
            renovacion.current = solicitar('/auth/refresh', { method: 'POST', headers: cabeceraSesion })
                .then(datos => {
                    actualizar(datos);
                    return acceso.current;
                })
                .catch(error => {
                    actualizar(null, error.status === 401 ? 'invitado' : 'error');
                    throw error;
                })
                .finally(() => { renovacion.current = null; });
        }
        return renovacion.current;
    }, [actualizar]);

    useEffect(() => {
        renovar().catch(() => {});
    }, [renovar]);

    async function iniciarSesion(credenciales) {
        await renovacion.current?.catch(() => {});
        const datos = await solicitar('/auth/login', { method: 'POST', body: credenciales });
        actualizar(datos);
        return datos.usuario;
    }

    function registrar(datos) {
        return solicitar('/auth/registro', { method: 'POST', body: datos });
    }

    async function cerrarSesion() {
        await renovacion.current?.catch(() => {});
        await solicitar('/auth/logout', { method: 'POST', headers: cabeceraSesion });
        actualizar(null);
    }

    const solicitarConSesion = useCallback(async (ruta, opciones) => {
        const vigente = acceso.current?.vence > Date.now() ? acceso.current : await renovar();
        try {
            return await solicitar(ruta, { ...opciones, token: vigente.token });
        } catch (error) {
            if (error.status !== 401 || opciones?.signal?.aborted) throw error;
            const nuevo = acceso.current && acceso.current !== vigente ? acceso.current : await renovar();
            return solicitar(ruta, { ...opciones, token: nuevo.token });
        }
    }, [renovar]);

    return (
        <ContextoSesion.Provider value={{ estado, usuario, iniciarSesion, registrar, cerrarSesion, renovar, solicitarConSesion }}>
            {children}
        </ContextoSesion.Provider>
    );
}
