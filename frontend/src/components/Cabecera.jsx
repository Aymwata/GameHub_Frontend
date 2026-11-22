import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { categorias } from '../data/categorias.js';

function Cabecera({ cantidad, sesion, alCerrarSesion }) {
    const [busqueda, setBusqueda] = useState('');
    const navegar = useNavigate();

    const esAdmin = sesion?.rol === 'ADMIN';

    function buscar(evento) {
        evento.preventDefault();
        navegar('/catalogo?buscar=' + encodeURIComponent(busqueda.trim()));
    }

    function manejarSalir() {
        if (typeof alCerrarSesion === 'function') {
            alCerrarSesion();
        }
        navegar('/login');
    }

    return (
        <header className="cabecera">
            <div className="cabecera-contenido">
                <Link to={esAdmin ? '/admin' : '/'} className="cabecera-logo">
                    <img
                        src="/assets/images/logo.png"
                        alt="GameHub Store: inicio"
                    />
                </Link>

                {!esAdmin && (
                    <>
                        <div className="dropdown">
                            <button
                                type="button"
                                className="btn boton-categorias dropdown-toggle"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                Categorías
                            </button>

                            <ul className="dropdown-menu">
                                <li>
                                    <Link className="dropdown-item" to="/catalogo">
                                        Todas las categorías
                                    </Link>
                                </li>

                                {categorias.map(categoria => (
                                    <li key={categoria.id}>
                                        <Link
                                            className="dropdown-item"
                                            to={'/catalogo?categoria=' + categoria.id}
                                        >
                                            {categoria.nombre}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <form
                            className="buscador-cabecera input-group"
                            onSubmit={buscar}
                            role="search"
                        >
                            <input
                                type="search"
                                className="form-control"
                                placeholder="Buscar productos..."
                                aria-label="Buscar productos"
                                value={busqueda}
                                onChange={evento => setBusqueda(evento.target.value)}
                            />

                            <button type="submit" className="btn boton-buscar">
                                Buscar
                            </button>
                        </form>
                    </>
                )}

                <nav className="navegacion" aria-label="Navegación principal">
                    {esAdmin ? (
                        <>
                            <Link to="/admin">Panel Admin</Link>
                            <Link to="/catalogo">Ver Tienda</Link>
                        </>
                    ) : (
                        <>
                            <Link to="/ordenes">Mis órdenes</Link>
                            <Link to="/carrito" className="enlace-carrito">
                                Carrito ({cantidad})
                            </Link>
                        </>
                    )}

                    {sesion ? (
                        <>
                            <span className="text-white small">
                                {sesion.nombre || sesion.correo}{' '}
                                <span className="badge bg-light text-dark ms-1">
                                    {sesion.rol}
                                </span>
                            </span>
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-light"
                                onClick={manejarSalir}
                            >
                                Salir
                            </button>
                        </>
                    ) : (
                        <Link to="/login">Iniciar sesión</Link>
                    )}
                </nav>
            </div>
        </header>
    );
}

export default Cabecera;