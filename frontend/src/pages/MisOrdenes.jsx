import { Link } from 'react-router-dom';

function formatearEstado(estado) {
    if (!estado) {
        return 'Pendiente de Aprobacion';
    }

    const limpio = String(estado)
        .trim()
        .replace(/[_-]+/g, ' ')
        .toLowerCase();

    if (limpio === 'aprobado simulado') {
        return 'Aprobado Simulado';
    }

    if (limpio === 'pendiente de aprobacion' || limpio === 'pendiente de aprobación') {
        return 'Pendiente de Aprobacion';
    }

    return limpio
        .split(/\s+/)
        .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
        .join(' ');
}

function claseBadgeEstado(estadoTexto) {
    const clave = estadoTexto.toLowerCase();

    if (clave.includes('aprobado')) {
        return 'bg-success-subtle text-success border border-success-subtle';
    }

    if (clave.includes('pendiente')) {
        return 'bg-warning-subtle text-dark border border-warning-subtle';
    }

    return 'bg-secondary-subtle text-dark border border-secondary-subtle';
}

function obtenerImagenItem(item) {
    if (!item) {
        return '';
    }

    return (
        item.imagen ||
        item.img ||
        item.image ||
        item.foto ||
        item.producto?.imagen ||
        ''
    );
}

function MisOrdenes({ ordenes = [] }) {
    if (!Array.isArray(ordenes) || ordenes.length === 0) {
        return (
            <main className="container py-5">
                <h1 className="h2 fw-bold mb-4">Mis ordenes</h1>

                <section className="card border-0 shadow-sm rounded-4 p-5 text-center">
                    <h2 className="h4 fw-bold mb-2">Aun no tienes ordenes registradas</h2>
                    <p className="text-muted mb-4">
                        Cuando completes una compra en GameHub, aparecera aqui con su detalle.
                    </p>
                    <div>
                        <Link to="/catalogo" className="btn btn-success px-4">
                            Ir al catalogo
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
                    <h1 className="h2 fw-bold mb-1">Mis ordenes</h1>
                    <p className="text-muted mb-0">
                        Revisa el estado y los productos de tus compras anteriores.
                    </p>
                </div>

                <Link to="/catalogo" className="btn btn-outline-success btn-sm">
                    Seguir comprando
                </Link>
            </div>

            <div className="d-grid gap-4">
                {ordenes.map((orden, index) => {
                    const estadoTexto = formatearEstado(orden.estado);
                    const items = Array.isArray(orden.items)
                        ? orden.items
                        : Array.isArray(orden.productos)
                            ? orden.productos
                            : [];
                    const totalOrden = Number(orden.total ?? orden.resumen?.total ?? 0);

                    return (
                        <article
                            key={orden.id || orden.codigo || index}
                            className="orden-card card border-0 shadow-sm rounded-4 overflow-hidden"
                        >
                            <div className="card-header bg-white border-bottom py-3 px-4 d-flex flex-wrap justify-content-between align-items-center gap-2">
                                <div>
                                    <span className="fw-bold text-dark me-2">
                                        Orden #{orden.id || orden.codigo || index + 1}
                                    </span>
                                    {orden.fecha && (
                                        <small className="text-muted">
                                            {orden.fecha}
                                        </small>
                                    )}
                                </div>

                                <span className={`badge rounded-pill px-3 py-2 ${claseBadgeEstado(estadoTexto)}`}>
                                    {estadoTexto}
                                </span>
                            </div>

                            <div className="card-body p-4">
                                {items.length > 0 ? (
                                    <div className="d-grid gap-3">
                                        {items.map((item, itemIndex) => {
                                            const imagenUrl = obtenerImagenItem(item);
                                            const nombreItem = item.nombre || item.titulo || 'Producto';
                                            const cantidadItem = Number(item.cantidad || 1);
                                            const precioUnitario = Number(item.precio || 0);
                                            const subtotalItem = Number(
                                                item.subtotal ?? precioUnitario * cantidadItem
                                            );

                                            return (
                                                <div
                                                    key={item.id || itemIndex}
                                                    className="d-flex flex-wrap justify-content-between align-items-center gap-3 pb-3 border-bottom"
                                                >
                                                    <div className="d-flex align-items-center gap-3">
                                                        {imagenUrl ? (
                                                            <img
                                                                src={imagenUrl}
                                                                alt={nombreItem}
                                                                className="rounded-3 border bg-light"
                                                                style={{
                                                                    width: '64px',
                                                                    height: '64px',
                                                                    objectFit: 'cover'
                                                                }}
                                                            />
                                                        ) : (
                                                            <div
                                                                className="rounded-3 border bg-light d-flex align-items-center justify-content-center text-muted small"
                                                                style={{
                                                                    width: '64px',
                                                                    height: '64px'
                                                                }}
                                                            >
                                                                Sin foto
                                                            </div>
                                                        )}

                                                        <div>
                                                            <div className="fw-semibold text-dark">
                                                                {nombreItem}
                                                            </div>
                                                            <small className="text-muted d-block">
                                                                Cantidad: {cantidadItem} · Unitario: ${precioUnitario.toLocaleString('es-CL')}
                                                            </small>
                                                        </div>
                                                    </div>

                                                    <div className="fw-bold text-dark text-nowrap">
                                                        ${subtotalItem.toLocaleString('es-CL')}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-muted mb-0">
                                        Esta orden no tiene detalle de productos.
                                    </p>
                                )}

                                <div className="d-flex justify-content-between align-items-center pt-3 mt-2">
                                    <span className="text-muted fw-medium">Total de la orden</span>
                                    <span className="fs-5 fw-bold text-success">
                                        ${totalOrden.toLocaleString('es-CL')}
                                    </span>
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>
        </main>
    );
}

export default MisOrdenes;