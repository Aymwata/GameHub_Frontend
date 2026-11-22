import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registrarUsuario, guardarSesion } from '../services/autenticacion.js';

function Registro({ alIniciarSesion }) {
    const [nombre, setNombre] = useState('');
    const [correo, setCorreo] = useState('');
    const [password, setPassword] = useState('');
    const [confirmarPassword, setConfirmarPassword] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    const navegar = useNavigate();

    function validar() {
        if (!nombre.trim()) return 'El nombre es obligatorio.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
            return 'Ingresa un correo electrónico válido.';
        }
        if (password.length < 6) {
            return 'La contraseña debe tener al menos 6 caracteres.';
        }
        if (password !== confirmarPassword) {
            return 'Las contraseñas no coinciden.';
        }
        return '';
    }

    async function manejarEnvio(evento) {
        evento.preventDefault();
        setError('');

        const errorValidacion = validar();
        if (errorValidacion) {
            setError(errorValidacion);
            return;
        }

        setCargando(true);

        try {
            const respuesta = await registrarUsuario({ nombre, correo, password });

            if (respuesta && respuesta.token) {
                const sesion = guardarSesion({
                    token: respuesta.token,
                    rol: respuesta.rol || 'CLIENTE',
                    nombre: respuesta.nombre || nombre.trim(),
                    correo: respuesta.correo || correo.trim()
                });

                if (typeof alIniciarSesion === 'function') {
                    alIniciarSesion(sesion);
                }
                navegar('/');
            } else {
                navegar('/login?registrado=true');
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
                        <h1 className="h2 text-center mb-3">Crear cuenta</h1>
                        <p className="text-muted text-center mb-4">
                            Regístrate como cliente en GameHub Store
                        </p>

                        {error && (
                            <div className="alert alert-danger" role="alert">
                                {error}
                            </div>
                        )}

                        <form onSubmit={manejarEnvio} noValidate>
                            <div className="mb-3">
                                <label htmlFor="reg-nombre" className="form-label fw-bold">
                                    Nombre completo
                                </label>
                                <input
                                    id="reg-nombre"
                                    type="text"
                                    className="form-control"
                                    placeholder="Juan Pérez"
                                    value={nombre}
                                    onChange={e => setNombre(e.target.value)}
                                    disabled={cargando}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label htmlFor="reg-correo" className="form-label fw-bold">
                                    Correo electrónico
                                </label>
                                <input
                                    id="reg-correo"
                                    type="email"
                                    className="form-control"
                                    placeholder="juan@correo.cl"
                                    value={correo}
                                    onChange={e => setCorreo(e.target.value)}
                                    disabled={cargando}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label htmlFor="reg-password" className="form-label fw-bold">
                                    Contraseña
                                </label>
                                <input
                                    id="reg-password"
                                    type="password"
                                    className="form-control"
                                    placeholder="Mínimo 6 caracteres"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    disabled={cargando}
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="reg-confirmar" className="form-label fw-bold">
                                    Confirmar contraseña
                                </label>
                                <input
                                    id="reg-confirmar"
                                    type="password"
                                    className="form-control"
                                    placeholder="Repite tu contraseña"
                                    value={confirmarPassword}
                                    onChange={e => setConfirmarPassword(e.target.value)}
                                    disabled={cargando}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-success btn-lg w-100"
                                disabled={cargando}
                            >
                                {cargando ? 'Registrando...' : 'Registrarse'}
                            </button>
                        </form>

                        <p className="text-center mt-4 mb-0">
                            ¿Ya tienes cuenta?{' '}
                            <Link to="/login" className="fw-bold text-success">
                                Inicia sesión
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default Registro;