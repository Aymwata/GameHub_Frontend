import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Carousel } from 'bootstrap';

import { productos } from '../data/productos.js';
import { categorias } from '../data/categorias.js';
import TarjetaProducto from '../components/TarjetaProducto.jsx';

// Define las imágenes del carrusel original.
const banners = [
    { imagen: 'banner-1.jpg', descripcion: 'Monitores gamer' },
    { imagen: 'banner-2.jpg', descripcion: 'Tarjetas gráficas' },
    { imagen: 'banner-3.jpg', descripcion: 'Notebooks gamer' },
    { imagen: 'banner-4.jpg', descripcion: 'Equipos de escritorio gamer' }
];

// Presenta el carrusel, los productos destacados y las categorías.
function Inicio() {
    const destacados = productos
        .filter(producto => producto.stock > 0)
        .slice(0, 4);

    // Inicia el carrusel al entrar a Inicio y lo detiene al salir.
    useEffect(() => {
        const elemento = document.getElementById('carrusel-inicio');

        const carrusel = new Carousel(elemento, {
            interval: 5000,
            ride: 'carousel'
        });

        return () => carrusel.dispose();
    }, []);

    const filaDestacados = useRef(null);
    const [mostrarFlechas, setMostrarFlechas] = useState(false);

    // Comprueba si hay productos fuera del espacio visible.
    useEffect(() => {
        function comprobarEspacio() {
            const fila = filaDestacados.current;
            setMostrarFlechas(fila.scrollWidth > fila.clientWidth);
        }

        comprobarEspacio();
        window.addEventListener('resize', comprobarEspacio);

        return () => {
            window.removeEventListener('resize', comprobarEspacio);
        };
    }, []);

    // Desplaza la fila aproximadamente el ancho de una tarjeta.
    function deslizarDestacados(direccion) {
        filaDestacados.current.scrollBy({
            left: direccion * 270,
            behavior: 'smooth'
        });
    }

    return (
        <main>
            <h1 className="visually-hidden">GameHub Store</h1>

            <section aria-label="Promociones de la tienda">
                <div
                    id="carrusel-inicio"
                    className="carousel slide carrusel-inicio"
                >
                    <div className="carousel-indicators">
                        {banners.map((banner, indice) => (
                            <button
                                key={banner.imagen}
                                type="button"
                                data-bs-target="#carrusel-inicio"
                                data-bs-slide-to={indice}
                                className={indice === 0 ? 'active' : ''}
                                aria-current={indice === 0 ? 'true' : undefined}
                                aria-label={'Mostrar promoción ' + (indice + 1)}
                            />
                        ))}
                    </div>

                    <div className="carousel-inner">
                        {banners.map((banner, indice) => (
                            <div
                                key={banner.imagen}
                                className={
                                    indice === 0
                                        ? 'carousel-item active'
                                        : 'carousel-item'
                                }
                            >
                                <Link to="/catalogo">
                                    <img
                                        src={'/assets/images/' + banner.imagen}
                                        alt={banner.descripcion}
                                        className="d-block w-100"
                                    />
                                </Link>
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        className="carousel-control-prev"
                        data-bs-target="#carrusel-inicio"
                        data-bs-slide="prev"
                    >
                        <span
                            className="carousel-control-prev-icon"
                            aria-hidden="true"
                        />
                        <span className="visually-hidden">Anterior</span>
                    </button>

                    <button
                        type="button"
                        className="carousel-control-next"
                        data-bs-target="#carrusel-inicio"
                        data-bs-slide="next"
                    >
                        <span
                            className="carousel-control-next-icon"
                            aria-hidden="true"
                        />
                        <span className="visually-hidden">Siguiente</span>
                    </button>
                </div>
            </section>

            <section className="mt-5">
                <div className="encabezado-destacados">
                    <h2 className="titulo-seccion">Productos destacados</h2>

                    {mostrarFlechas && (
                        <div className="controles-destacados">
                            <button
                                type="button"
                                className="btn btn-outline-success"
                                aria-label="Ver productos destacados anteriores"
                                onClick={() => deslizarDestacados(-1)}
                            >
                                ←
                            </button>

                            <button
                                type="button"
                                className="btn btn-outline-success"
                                aria-label="Ver siguientes productos destacados"
                                onClick={() => deslizarDestacados(1)}
                            >
                                →
                            </button>
                        </div>
                    )}
                </div>

                <div className="fila-destacados" ref={filaDestacados}>
                    {destacados.map(producto => (
                        <TarjetaProducto
                            key={producto.id}
                            producto={producto}
                            destacado
                        />
                    ))}
                </div>
            </section>

            <section className="mt-5">
                <h2 className="titulo-seccion">Explora por categorías</h2>

                <div className="row">
                    {categorias.map(categoria => (
                        <div
                            className="col-12 col-md-4 mb-3"
                            key={categoria.id}
                        >
                            <Link
                                to={'/catalogo?categoria=' + categoria.id}
                                className="card tarjeta-categoria"
                            >
                                <div className="card-body">
                                    <h3>{categoria.nombre}</h3>
                                    <p className="mb-0">
                                        {categoria.descripcion}
                                    </p>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </section>

            <section className="mt-5">
                <h2 className="titulo-seccion">
                    Descubre la nueva generación
                </h2>

                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="ratio ratio-16x9">
                            <iframe
                                src="https://www.youtube.com/embed/hrAYDFj7Qnc"
                                title="Presentación de productos gamer"
                                allowFullScreen
                            />
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default Inicio;