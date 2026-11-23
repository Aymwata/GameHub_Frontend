import { Link, Navigate, useLocation } from 'react-router-dom';
import { useSesion } from '../services/sesion.js';

export default function AccesoRequerido({ rol, children }) {
    const { estado, usuario, renovar } = useSesion();
    const ubicacion = useLocation();
    if (estado === 'autenticado' && usuario.rol === rol) return children;
    if (estado === 'invitado') {
        return <Navigate to={rol === 'ADMIN' ? '/admin/login' : '/login'}
            state={{ continuar: ubicacion.pathname }} replace />;
    }

    return (
        <main className="container py-4">
            <h1 className="h3">Acceso {rol === 'ADMIN' ? 'de administración' : 'de clientes'}</h1>
            {estado === 'cargando' && <p role="status">Comprobando tu sesión…</p>}
            {estado === 'autenticado' && (
                <p>
                    Tu cuenta no tiene acceso a esta página.{' '}
                    <Link to={rol === 'ADMIN' ? '/admin/login' : '/login'} state={{ continuar: ubicacion.pathname }}>
                        Entrar como {rol === 'ADMIN' ? 'administrador' : 'cliente'}
                    </Link>
                </p>
            )}
            {estado === 'error' && (
                <div role="alert">
                    <p>No pudimos comprobar tu sesión.</p>
                    <button type="button" className="btn btn-outline-dark me-2" onClick={() => renovar().catch(() => {})}>
                        Reintentar
                    </button>
                </div>
            )}
            <Link to="/catalogo">Volver al catálogo</Link>
        </main>
    );
}