import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { iniciarSesion } from '../services/autenticacion.js';

function Login({ alIniciarSesion }) {
    const [correo, setCorreo] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    const navegar = useNavigate();
    const [parametros] = useSearchParams();
    const registroExitoso = parametros.get('registrado') === 'true';

    async function manejarEnvio(evento) {
        evento.preventDefault();
        setError('');

        if (!correo.trim() || !password.trim()) {
            setError('Ingresa tu correo y contraseña.');
            return;
        }

        setCargando(true);

        try {
            const sesion = await iniciarSesion(correo, password);

            if (typeof alIniciarSesion === 'function') {
                alIniciarSesion(sesion);
            }


            if (sesion.rol === 'ADMIN') {
                navegar('/admin');
            } else {
                navegar('/');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    }

    return (
        <main>
            <div className="row justify-content-center">
                <div className="col-12 col-md-6 col-lg-5">
                    <div className="card p-4">
                        <h1 className="h2 text-center mb-3">Iniciar sesión</h1>
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

                        <p className="text-center mt-4 mb-0">
                            ¿No tienes cuenta?{' '}
                            <Link to="/registro" className="fw-bold text-success">
                                Regístrate aquí
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default Login;