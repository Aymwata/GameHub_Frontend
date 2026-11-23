import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useSesion } from '../services/sesion.js';

function Login({ perfil }) {
    const { iniciarSesion } = useSesion();
    const [correo, setCorreo] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    const navegar = useNavigate();
    const ubicacion = useLocation();
    const [parametros] = useSearchParams();
    const administrador = perfil === 'ADMIN';
    const registroExitoso = !administrador && parametros.get('registrado') === 'true';

    async function manejarEnvio(evento) {
        evento.preventDefault();
        setError('');

        if (!correo.trim() || !password.trim()) {
            setError('Ingresa tu correo y contraseña.');
            return;
        }

        setCargando(true);

        try {
            await iniciarSesion({ email: correo.trim(), password, perfil });
            const continuar = ubicacion.state?.continuar;
            const rutasPermitidas = administrador ? ['/admin', '/admin/categorias'] : ['/checkout', '/ordenes'];
            const destino = rutasPermitidas.includes(continuar) ? continuar : administrador ? '/admin' : '/';
            navegar(destino, { replace: true });
        } catch (err) {
            setError(err.status ? err.message : 'No pudimos iniciar sesión. Intenta nuevamente.');
        } finally {
            setCargando(false);
        }
    }

    return (
        <main>
            <div className="row justify-content-center">
                <div className="col-12 col-md-6 col-lg-5">
                    <div className="card p-4">
                        <h1 className="h2 text-center mb-3">{administrador ? 'Acceso de administradores' : 'Iniciar sesión'}</h1>
                        <p className="text-muted text-center mb-4">
                            Ingresa a tu cuenta de GameHub Store
                        </p>

                        {registroExitoso && !error && (
                            <div className="alert alert-success" role="status">
                                Cuenta creada correctamente. Ya puedes iniciar sesión.
                            </div>
                        )}

                        {error && (
                            <div className="alert alert-danger" role="alert">
                                {error}
                            </div>
                        )}

                        <form onSubmit={manejarEnvio} noValidate>
                            <div className="mb-3">
                                <label htmlFor="login-correo" className="form-label fw-bold">
                                    Correo electrónico
                                </label>
                                <input
                                    id="login-correo"
                                    type="email"
                                    className="form-control"
                                    placeholder="ejemplo@correo.cl"
                                    value={correo}
                                    autoComplete="username"
                                    maxLength={100}
                                    onChange={e => setCorreo(e.target.value)}
                                    disabled={cargando}
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="login-password" className="form-label fw-bold">
                                    Contraseña
                                </label>
                                <input
                                    id="login-password"
                                    type="password"
                                    className="form-control"
                                    placeholder="••••••••"
                                    value={password}
                                    autoComplete="current-password"
                                    maxLength={255}
                                    onChange={e => setPassword(e.target.value)}
                                    disabled={cargando}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-success btn-lg w-100"
                                disabled={cargando}
                            >
                                {cargando ? 'Ingresando...' : 'Ingresar'}
                            </button>
                        </form>

                        {!administrador && <p className="text-center mt-4 mb-0">
                            ¿No tienes cuenta?{' '}
                            <Link to="/registro" state={ubicacion.state} className="fw-bold text-success">
                                Regístrate aquí
                            </Link>
                        </p>}
                        <p className="text-center mt-3 mb-0">
                            <Link to={administrador ? '/login' : '/admin/login'}>
                                {administrador ? 'Acceso de clientes' : 'Acceso de administradores'}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default Login;
