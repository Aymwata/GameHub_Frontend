import { Link } from 'react-router-dom';

// Muestra las compras guardadas y sus productos.
function MisOrdenes({ ordenes }) {
    return (
        <main className="container py-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
                <div>
                    <h1 className="h2 fw-bold mb-1">Mis órdenes</h1>
                    <p className="text-muted mb-0">
                        Historial de compras realizadas y estado de preparación.
                    </p>
                </div>

                {ordenes.length > 0 && (
                    <Link to="/catalogo" className="btn btn-outline-success btn-sm">
                        Seguir comprando
                    </Link>
                )}
            </div>

            {ordenes.length === 0 && (
                <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
                    <p className="text-muted mb-3">
                        Todavía no tienes órdenes.
                    </p>
                    <div>
                        <Link to="/catalogo" className="btn btn-success px-4">
                            Explorar catálogo
                        </Link>
                    </div>
                </div>
            )}

            {ordenes.map(orden => (
                <article className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden" key={orden.id}>
                    {/* Cabecera de la orden */}
                    <div className="card-header bg-white border-bottom py-3 px-4 d-flex flex-wrap justify-content-between align-items-center gap-2">
                        <div>
                            <span className="small text-muted d-block">Código de orden</span>
                            <h2 className="h5 fw-bold mb-0 text-dark">{orden.id}</h2>
                        </div>

                        <div className="d-flex align-items-center gap-3">
                            <div className="text-end">
                                <span className="small text-muted d-block">Fecha de compra</span>
                                <span className="fw-medium">
                                    {new Date(orden.fecha).toLocaleDateString('es-CL')}
                                </span>
                            </div>

                            <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-2">
                                {orden.estado}
                            </span>
                        </div>
                    </div>

                    {/* Cuerpo con datos de pago, despacho y productos */}
                    <div className="card-body p-4">
                        <div className="row g-3 mb-4">
                            <div className="col-md-4">
                                <div className="bg-light rounded-3 p-3 h-100">
                                    <span className="small text-muted d-block">Pago</span>
                                    <span className="fw-semibold text-dark">
                                        aprobado, simulado
                                    </span>
                                </div>
                            </div>

                            <div className="col-md-4">
                                <div className="bg-light rounded-3 p-3 h-100">
                                    <span className="small text-muted d-block">Despacho</span>
                                    <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle">
                                        pendiente de preparación
                                    </span>
                                </div>
                            </div>

                            <div className="col-md-4">
                                <div className="bg-light rounded-3 p-3 h-100">
                                    <span className="small text-muted d-block">Dirección de entrega</span>
                                    <span className="small fw-medium text-dark">
                                        {orden.despacho.direccion},{' '}
                                        {orden.despacho.comuna},{' '}
                                        {orden.despacho.region}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <details open className="border rounded-3 p-3 bg-white">
                            <summary className="fw-semibold text-dark" style={{ cursor: 'pointer' }}>
                                Ver detalle ({orden.productos.length} {orden.productos.length === 1 ? 'producto' : 'productos'})
                            </summary>

                            <div className="table-responsive mt-3">
                                <table className="table table-sm align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th scope="col">Producto</th>
                                            <th scope="col" className="text-center">Cantidad</th>
                                            {orden.productos.some(p => typeof p.precio === 'number') && (
                                                <th scope="col" className="text-end">Subtotal</th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orden.productos.map(producto => (
                                            <tr key={producto.id}>
                                                <td className="py-2 fw-medium text-dark">
                                                    {producto.nombre}
                                                </td>
                                                <td className="text-center">
                                                    <span className="badge bg-secondary-subtle text-secondary-emphasis rounded-pill px-3">
                                                        × {producto.cantidad}
                                                    </span>
                                                </td>
                                                {orden.productos.some(p => typeof p.precio === 'number') && (
                                                    <td className="text-end text-nowrap fw-semibold">
                                                        {typeof producto.precio === 'number'
                                                            ? `$${(producto.precio * producto.cantidad).toLocaleString('es-CL')}`
                                                            : '-'}
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </details>
                    </div>

                    {/* Pie de tarjeta con descuento y total */}
                    <div className="card-footer bg-light border-top py-3 px-4 d-flex flex-wrap justify-content-between align-items-center gap-2">
                        <span className="text-muted">
                            Descuento:{' '}
                            <strong className="text-dark">
                                ${(orden.descuento || 0).toLocaleString('es-CL')}
                            </strong>
                        </span>

                        <p className="fs-5 fw-bold text-success mb-0">
                            Total: ${orden.total.toLocaleString('es-CL')}
                        </p>
                    </div>
                </article>
            ))}
        </main>
    );
}

export default MisOrdenes;