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
    const [codigo, setCodigo] = useState(codigoCupon);
    const [aviso, setAviso] = useState('');

    const resumen = calcularResumen(carrito, codigoCupon);

    // Solicita aplicar el codigo escrito en el formulario.
    function aplicarCodigo(evento) {
        evento.preventDefault();
        setAviso('');

        if (aplicarCupon(codigo)) {
            setAviso('Cupón guardado correctamente.');
        }
    }

    // Invita al usuario a explorar el catalogo cuando el carrito esta vacio.
    if (carrito.length === 0) {
        return (
            <main className="container py-5">
                <h1 className="h2 fw-bold mb-4">Mi carrito</h1>

                <section className="carrito-vacio card border-0 shadow-sm rounded-4 p-5 text-center">
                    <span className="carrito-vacio-icono fs-1 mb-3" aria-hidden="true">
                        🛒
                    </span>

                    <h2 className="h4 fw-bold">Tu carrito está vacío</h2>

                    <p className="text-muted mb-4">
                        Explora nuestro catálogo y encuentra lo que necesitas para tu equipo.
                    </p>

                    <div>
                        <Link to="/catalogo" className="btn btn-success px-4">
                            Explorar productos
                        </Link>
                    </div>
                </section>
            </main>
        );
    }

    return (
        <main className="container py-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
                <div>
                    <h1 className="h2 fw-bold mb-1">Carrito de compras</h1>
                    <p className="text-muted mb-0">
                        Revisa los productos seleccionados antes de finalizar tu compra.
                    </p>
                </div>

                <Link to="/catalogo" className="btn btn-outline-success btn-sm">
                    Seguir comprando
                </Link>
            </div>

            <div className="row g-4 align-items-start">
                {/* Lista de productos en el carrito */}
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                        <div className="card-header bg-white border-bottom py-3 px-4">
                            <span className="fw-semibold">
                                Productos en tu carrito ({carrito.length})
                            </span>
                        </div>

                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th scope="col" className="ps-4">Producto</th>
                                        <th scope="col">Precio</th>
                                        <th scope="col">Cantidad</th>
                                        <th scope="col">Subtotal</th>
                                        <th scope="col" className="text-end pe-4">Acción</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {carrito.map(producto => (
                                        <tr key={producto.id}>
                                            <td className="ps-4 py-3">
                                                <div className="d-flex align-items-center gap-3">
                                                    {producto.imagen && (
                                                        <img
                                                            src={producto.imagen}
                                                            alt={producto.nombre}
                                                            className="rounded-3 border bg-light"
                                                            style={{
                                                                width: '56px',
                                                                height: '56px',
                                                                objectFit: 'cover'
                                                            }}
                                                        />
                                                    )}
                                                    <div>
                                                        <div className="fw-semibold text-dark">
                                                            {producto.nombre}
                                                        </div>
                                                        {typeof producto.stock === 'number' && (
                                                            <small className="text-muted">
                                                                Stock disponible: {producto.stock}
                                                            </small>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="text-nowrap text-muted">
                                                ${producto.precio.toLocaleString('es-CL')}
                                            </td>

                                            <td>
                                                <div className="btn-group btn-group-sm" role="group">
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

                                                    <span className="btn btn-light disabled text-dark fw-semibold px-3">
                                                        {producto.cantidad}
                                                    </span>

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

                                            <td className="text-nowrap fw-bold text-dark">
                                                ${(producto.precio * producto.cantidad).toLocaleString('es-CL')}
                                            </td>

                                            <td className="text-end pe-4">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-danger btn-sm"
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
                    </div>
                </div>

                {/* Panel lateral de cupon y resumen */}
                <div className="col-lg-4">
                    <section className="resumen-carrito card border-0 shadow-sm rounded-4 p-4">
                        <h2 className="h5 fw-bold mb-3">Resumen de compra</h2>

                        <form onSubmit={aplicarCodigo} className="mb-3">
                            <label htmlFor="cupon" className="form-label small fw-semibold">
                                Cupón de descuento
                            </label>

                            <div className="input-group">
                                <input
                                    id="cupon"
                                    className="form-control"
                                    placeholder="Ej: GAME20"
                                    value={codigo}
                                    onChange={evento => setCodigo(evento.target.value)}
                                />

                                <button type="submit" className="btn btn-success">
                                    Aplicar
                                </button>
                            </div>

                            <p className="small text-muted mt-2 mb-0">
                                Prueba GAME20: 20 %, máximo $100.000, vigente durante 2026.
                            </p>
                        </form>

                        {aviso && (
                            <p role="status" className="small text-success fw-medium mb-2">
                                {aviso}
                            </p>
                        )}

                        <div className="d-flex justify-content-between align-items-center bg-light rounded-3 px-3 py-2 mb-3">
                            <span className="small text-muted">
                                Cupón actual: <strong className="text-dark">{codigoCupon || 'ninguno'}</strong>
                            </span>

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
                        </div>

                        <ResumenCompra resumen={resumen} />

                        <div className="acciones-carrito d-grid gap-2 mt-4">
                            <Link to="/checkout" className="btn btn-success fw-semibold">
                                Proceder al pago
                            </Link>

                            <button
                                type="button"
                                className="btn btn-outline-danger btn-sm"
                                onClick={vaciarCarrito}
                            >
                                Vaciar carrito
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}

export default Carrito;