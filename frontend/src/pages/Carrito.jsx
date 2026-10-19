import { Link } from 'react-router-dom';
import { useState } from 'react';
import { calcularResumen } from '../utils/precios.js';
import ResumenCompra from '../components/ResumenCompra.jsx';

// Muestra los productos elegidos y permite modificar el carrito.
function Carrito({
    carrito,
    codigoCupon,
    aplicarCupon,
    cambiarCantidad,
    quitarProducto,
    vaciarCarrito
}) {
    let total = 0;

    const [codigo, setCodigo] = useState(codigoCupon);
    const [aviso, setAviso] = useState('');

    const resumen = calcularResumen(carrito, codigoCupon);

    // Solicita aplicar el código escrito en el formulario.
    function aplicarCodigo(evento) {
        evento.preventDefault();
        setAviso('');

        if (aplicarCupon(codigo)) {
            setAviso('Cupón guardado correctamente.');
        }
    }

    // Invita al usuario a explorar el catálogo cuando el carrito está vacío.
    if (carrito.length === 0) {
    return (
        <main>
        <h1>Mi carrito</h1>

        <section className="carrito-vacio">
            <span className="carrito-vacio-icono" aria-hidden="true">
            🛒
            </span>

            <h2>Tu carrito está vacío</h2>

            <p>
            Explora nuestro catálogo y encuentra lo que necesitas para tu equipo.
            </p>

            <Link to="/catalogo" className="btn btn-success">
            Explorar productos
            </Link>
        </section>
        </main>
    );
    }

    return (
        <main>
            <h1>Carrito de compras</h1>

            <div className="table-responsive">
                <table className="table align-middle">
                    <thead>
                        <tr>
                            <th scope="col">Producto</th>
                            <th scope="col">Precio</th>
                            <th scope="col">Cantidad</th>
                            <th scope="col">Subtotal</th>
                            <th scope="col">Acción</th>
                        </tr>
                    </thead>

                    <tbody>
                        {carrito.map(producto => (
                            <tr key={producto.id}>
                                <td>{producto.nombre}</td>

                                <td className="text-nowrap">
                                    ${producto.precio.toLocaleString('es-CL')}
                                </td>

                                <td>
                                    <div className="d-flex align-items-center gap-2">
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            aria-label={'Reducir cantidad de ' + producto.nombre}
                                            disabled={producto.cantidad === 1}
                                            onClick={() => cambiarCantidad(
                                                producto.id,
                                                producto.cantidad - 1
                                            )}
                                        >
                                            −
                                        </button>

                                        <span>{producto.cantidad}</span>

                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            aria-label={'Aumentar cantidad de ' + producto.nombre}
                                            disabled={producto.cantidad >= producto.stock}
                                            onClick={() => cambiarCantidad(
                                                producto.id,
                                                producto.cantidad + 1
                                            )}
                                        >
                                            +
                                        </button>
                                    </div>
                                </td>

                                <td className="text-nowrap">
                                    ${(producto.precio * producto.cantidad).toLocaleString('es-CL')}
                                </td>

                                <td>
                                    <button
                                        type="button"
                                        className="btn btn-outline-danger"
                                        onClick={() => quitarProducto(producto.id)}
                                    >
                                        Quitar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <section className="resumen-carrito">
                <h2 className="h4">Resumen de compra</h2>

                <form onSubmit={aplicarCodigo}>
                    <label htmlFor="cupon" className="form-label">
                        Cupón de descuento
                    </label>

                    <div className="input-group">
                        <input
                            id="cupon"
                            className="form-control"
                            value={codigo}
                            onChange={evento => setCodigo(evento.target.value)}
                        />

                        <button type="submit" className="btn btn-success">
                            Aplicar
                        </button>
                    </div>

                    <p className="small text-muted mt-2">
                        Prueba GAME20: 20 %, máximo $100.000, vigente durante 2026.
                    </p>
                </form>

                <p role="status">{aviso}</p>
                <p>Cupón actual: {codigoCupon || 'ninguno'}</p>

                {codigoCupon && (
                    <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => {
                            if (aplicarCupon('')) {
                                setCodigo('');
                                setAviso('Cupón retirado.');
                            }
                        }}
                    >
                        Retirar cupón
                    </button>
                )}

                    <ResumenCompra resumen={resumen} />

                    <div className="acciones-carrito">
                        <Link to="/checkout" className="btn btn-success">
                        Proceder al pago
                        </Link>

                        <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={vaciarCarrito}
                        >
                        Vaciar carrito
                        </button>
                    </div>
                </section>

        </main>
    );
}

export default Carrito;