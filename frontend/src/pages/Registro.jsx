import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSesion } from '../services/sesion.js';

function Registro() {
    const { registrar } = useSesion();
    const [nombre, setNombre] = useState('');
    const [correo, setCorreo] = useState('');
    const [telefono, setTelefono] = useState('');
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
        if (!/^\d{9}$/.test(telefono.trim())) {
            return 'Ingresa un teléfono de 9 dígitos.';
        }
        if (password.trim().length < 8) {
            return 'La contraseña debe tener al menos 8 caracteres.';
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
            await registrar({ nombre: nombre.trim(), email: correo.trim(), telefono: telefono.trim(), password });
            navegar('/login?registrado=true', { replace: true });
        } catch (err) {
            setError(err.status ? err.message : 'No pudimos completar el registro. Intenta nuevamente.');
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
                                    autoComplete="name"
                                    maxLength={100}
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
                                    autoComplete="email"
                                    maxLength={100}
                                    onChange={e => setCorreo(e.target.value)}
                                    disabled={cargando}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label htmlFor="reg-telefono" className="form-label fw-bold">Teléfono</label>
                                <input id="reg-telefono" type="tel" inputMode="numeric" autoComplete="tel-national"
                                    className="form-control" maxLength={9} value={telefono}
                                    onChange={e => setTelefono(e.target.value)} disabled={cargando} required />
                            </div>

                            <div className="mb-3">
                                <label htmlFor="reg-password" className="form-label fw-bold">
                                    Contraseña
                                </label>
                                <input
                                    id="reg-password"
                                    type="password"
                                    className="form-control"
                                    placeholder="Mínimo 8 caracteres"
                                    value={password}
                                    autoComplete="new-password"
                                    maxLength={255}
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
                                    autoComplete="new-password"
                                    maxLength={255}
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
