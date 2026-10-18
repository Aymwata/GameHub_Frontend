import { Link } from 'react-router-dom';
import { moneda } from '../utils/precios.js';

// Presenta un producto y permite abrir su detalle.
export default function TarjetaProducto({ producto }) {
    return (
        <article className="col-12 col-sm-6 col-xl-4 mb-4">
            <div className="card tarjeta-producto">
                <p
                    className={
                        producto.stock > 0 ? 'badge badge-stock-ok' : 'badge badge-stock-out'
                    }
                >
                    {producto.stock > 0 ? 'Stock: ' + producto.stock + ' uds.' : 'Sin stock'}
                </p>
                <img
                    src={producto.imagen}
                    className="imagen-producto"
                    alt={producto.nombre}
                    loading="lazy"
                />
                <div className="card-body d-flex flex-column">
                    <h3 className="nombre-producto">{producto.nombre}</h3>
                    <p className="precio-producto">{moneda(producto.precio)}</p>
                    <Link to={'/producto/' + producto.id} className="btn btn-agregar mt-auto">
                        Ver detalle
                    </Link>
                </div>
            </div>
        </article>
    );
}
