import { Link } from 'react-router-dom';
import { productos, categorias } from '../data/datos.js';
import TarjetaProducto from '../components/TarjetaProducto.jsx';

// Presenta la tienda, los productos destacados y los accesos por categoría.
export default function Inicio() {
    const destacados = productos.filter((producto) => producto.stock > 0).slice(0, 3);

    return (
        <>
            <section className="banner-principal">
                <h1 className="visually-hidden">GameHub Store: tienda gamer</h1>
                <Link to="/catalogo">
                    <img
                        src="/assets/images/banner-1.jpg"
                        className="banner-imagen"
                        alt="Explora nuestros productos gamer"
                    />
                </Link>
            </section>
            <section className="contenedor-pagina">
                <h2 className="titulo-seccion">Productos destacados</h2>
                <div className="row">
                    {destacados.map((producto) => (
                        <TarjetaProducto key={producto.id} producto={producto} />
                    ))}
                </div>
            </section>
            <section className="contenedor-pagina">
                <h2 className="titulo-seccion">Explora por categorías</h2>
                <div className="row">
                    {categorias.map((categoria) => (
                        <div className="col-12 col-md-4 mb-3" key={categoria.id}>
                            <Link
                                className="card tarjeta-categoria"
                                to={'/catalogo?categoria=' + categoria.id}
                            >
                                <div className="card-body">
                                    <h3>{categoria.nombre}</h3>
                                    <p>{categoria.descripcion}</p>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </section>
            <section className="contenedor-pagina">
                <h2 className="titulo-seccion">Descubre la nueva generación</h2>
                <div className="ratio ratio-16x9">
                    <iframe
                        src="https://www.youtube.com/embed/hrAYDFj7Qnc"
                        title="Presentación de productos gamer"
                        allowFullScreen
                    />
                </div>
            </section>
        </>
    );
}
