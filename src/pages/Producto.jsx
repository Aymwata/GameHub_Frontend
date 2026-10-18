import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { productos } from '../data/datos.js';
import { agregarAlCarrito } from '../utils/carrito.js';
import { moneda } from '../utils/precios.js';

// Muestra un producto y permite agregar una cantidad válida al carrito.
export default function Producto({ compra, guardarCambios }) {
    const { id } = useParams();
    const navegar = useNavigate();
    const [cantidad, setCantidad] = useState('1');
    const [error, setError] = useState('');
    const producto = productos.find((item) => item.id === Number(id));

    if (!producto) {
        return (
            <div className="contenedor-pagina">
                <h1>Producto no encontrado</h1>
                <Link to="/catalogo">Volver al catálogo</Link>
            </div>
        );
    }

    // Agrega las unidades elegidas y abre el carrito si el guardado fue correcto.
    function agregar(evento) {
        evento.preventDefault();
        try {
            const carrito = agregarAlCarrito(compra.carrito, producto, Number(cantidad));
            if (guardarCambios({ ...compra, carrito })) {
                navegar('/carrito');
            }
        } catch (problema) {
            setError(problema.message);
        }
    }

    return (
        <div className="contenedor-pagina">
            <div className="row g-4">
                <div className="col-lg-6">
                    <img src={producto.imagen} alt={producto.nombre} className="galeria-img" />
                </div>
                <div className="col-lg-6">
                    <p className="marca-texto">{producto.marca}</p>
                    <h1 className="h2">{producto.nombre}</h1>
                    <p className="precio-oferta">{moneda(producto.precio)}</p>
                    <p>
                        {producto.stock > 0 ? 'Stock disponible: ' + producto.stock : 'Sin stock'}
                    </p>
                    <form onSubmit={agregar} noValidate>
                        <label htmlFor="cantidad" className="form-label">
                            Cantidad
                        </label>
                        <div className="d-flex gap-3 flex-wrap">
                            <input
                                id="cantidad"
                                type="number"
                                min="1"
                                max={producto.stock}
                                step="1"
                                className="form-control cantidad-detalle"
                                value={cantidad}
                                onChange={(evento) => setCantidad(evento.target.value)}
                                disabled={producto.stock === 0}
                                aria-describedby="error-cantidad"
                            />
                            <button
                                className="btn-comprar-detalle"
                                type="submit"
                                disabled={producto.stock === 0}
                            >
                                Agregar al carrito
                            </button>
                        </div>
                        <p id="error-cantidad" className="text-danger mt-2" role="alert">
                            {error}
                        </p>
                    </form>
                </div>
            </div>
            <section className="mt-4">
                <h2 className="h4">Características</h2>
                <div className="table-responsive">
                    <table className="table table-bordered">
                        <tbody>
                            {Object.entries(producto.especificaciones).map(([nombre, valor]) => (
                                <tr key={nombre}>
                                    <th scope="row">{nombre}</th>
                                    <td>{valor}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
