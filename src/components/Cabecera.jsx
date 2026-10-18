import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { categorias } from '../data/datos.js';

// Muestra la navegación y el contador que recibe desde App.
export default function Cabecera({ cantidad }) {
    const [busqueda, setBusqueda] = useState('');
    const navegar = useNavigate();

    // Abre el catálogo con el texto escrito en el buscador.
    function buscar(evento) {
        evento.preventDefault();
        navegar('/catalogo?buscar=' + encodeURIComponent(busqueda.trim()));
    }

    return (
        <header>
            <nav className="header-container" aria-label="Navegación principal">
                <Link to="/" className="header-logo">
                    <img src="/assets/images/logo.png" alt="GameHub Store: inicio" />
                </Link>
                <div className="dropdown">
                    <button
                        className="btn btn-menu"
                        type="button"
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
                        {categorias.map((categoria) => (
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
                <form id="form-busqueda" className="d-flex" onSubmit={buscar} role="search">
                    <input
                        id="input-busqueda"
                        className="form-control"
                        type="search"
                        placeholder="Buscar productos..."
                        aria-label="Buscar productos"
                        value={busqueda}
                        onChange={(evento) => setBusqueda(evento.target.value)}
                    />
                    <button type="submit" className="btn">
                        Buscar
                    </button>
                </form>
                <span className="modo-demo">Modo demostración</span>
                <div className="header-acciones">
                    <Link className="link-cuenta" to="/ordenes">
                        Mis órdenes
                    </Link>
                    <Link className="btn-carrito" to="/carrito">
                        Carrito ({cantidad})
                    </Link>
                </div>
            </nav>
        </header>
    );
}
