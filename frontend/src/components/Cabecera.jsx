import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { categorias } from '../data/categorias.js';

// Muestra el logo, las categorías, el buscador y los accesos de la tienda.
function Cabecera({ cantidad }) {
    const [busqueda, setBusqueda] = useState('');
    const navegar = useNavigate();

    // Abre el catálogo con el término escrito en el buscador.
    function buscar(evento) {
        evento.preventDefault();
        navegar('/catalogo?buscar=' + encodeURIComponent(busqueda.trim()));
    }

    return (
        <header className="cabecera">
            <div className="cabecera-contenido">
                <Link to="/" className="cabecera-logo">
                    <img
                        src="/assets/images/logo.png"
                        alt="GameHub Store: inicio"
                    />
                </Link>

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

                <nav className="navegacion" aria-label="Navegación principal">
                    <Link to="/ordenes">Mis órdenes</Link>

                    <Link to="/carrito" className="enlace-carrito">
                        Carrito ({cantidad})
                    </Link>
                </nav>
            </div>
        </header>
    );
}

export default Cabecera;