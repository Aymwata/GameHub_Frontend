import { Link } from 'react-router-dom';
import { useSesion } from '../services/sesion.js';

export default function AccesoRequerido({ rol, children }) {
    const { estado, usuario, renovar } = useSesion();
    if (estado === 'autenticado' && usuario.rol === rol) return children;

    return (
        <main className="container py-4">
            <h1 className="h3">Acceso {rol === 'ADMIN' ? 'de administración' : 'de clientes'}</h1>
            {estado === 'cargando' && <p role="status">Comprobando tu sesión…</p>}
            {estado === 'invitado' && <p>Inicia sesión como {rol === 'ADMIN' ? 'administrador' : 'cliente'} para continuar.</p>}
            {estado === 'autenticado' && <p>Tu cuenta no tiene acceso a esta página.</p>}
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
