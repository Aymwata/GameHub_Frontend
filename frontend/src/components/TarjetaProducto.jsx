import { Link } from 'react-router-dom';

// Presenta un producto del catálogo.
function TarjetaProducto({ producto, destacado = false }) {
    return (
        <article
            className={
                destacado
                    ? 'tarjeta-destacada'
                    : 'col-12 col-md-6 col-lg-4 mb-4'
            }
        >
            <div className="card h-100">
                <img
                    src={'/' + producto.imagen}
                    alt={producto.nombre}
                    className="producto-imagen"
                />

                <div className="card-body d-flex flex-column">
                    <h2 className="h5">{producto.nombre}</h2>
                    <p className="fw-bold">
                        ${producto.precio.toLocaleString('es-CL')}
                    </p>
                    <p>
                        {producto.stock > 0
                            ? 'Stock: ' + producto.stock
                            : 'Sin stock'}
                    </p>

                    <Link
                        to={'/producto/' + producto.id}
                        className="btn btn-success mt-auto"
                    >
                        Ver detalle
                    </Link>
                </div>
            </div>
        </article>
    );
}

export default TarjetaProducto;