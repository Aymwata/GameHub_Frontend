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

function formatearFecha(fecha) {
    if (!fecha) {
        return '';
    }

    const parsed = new Date(fecha);
    if (Number.isNaN(parsed.getTime())) {
        return String(fecha);
    }

    return parsed.toLocaleString('es-CL');
}

function obtenerValor(orden, rutas) {
    for (const ruta of rutas) {
        const partes = ruta.split('.');
        let actual = orden;
        for (const parte of partes) {
            if (actual == null) {
                actual = undefined;
                break;
            }
            actual = actual[parte];
        }
        if (actual !== undefined && actual !== null && String(actual).trim() !== '') {
            return actual;
        }
    }
    return '';
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

                    const nombreCliente = obtenerValor(orden, [
                        'nombre',
                        'nombreCliente',
                        'cliente.nombre',
                        'comprador.nombre',
                        'datos.nombre',
                        'envio.nombre'
                    ]);
                    const correoCliente = obtenerValor(orden, [
                        'correo',
                        'email',
                        'cliente.correo',
                        'cliente.email',
                        'comprador.correo',
                        'datos.correo'
                    ]);
                    const telefonoCliente = obtenerValor(orden, [
                        'telefono',
                        'cliente.telefono',
                        'comprador.telefono',
                        'datos.telefono',
                        'envio.telefono'
                    ]);
                    const direccionOrden = obtenerValor(orden, [
                        'direccion',
                        'direccionEnvio',
                        'envio.direccion',
                        'datos.direccion',
                        'cliente.direccion'
                    ]);
                    const comunaOrden = obtenerValor(orden, [
                        'comuna',
                        'envio.comuna',
                        'datos.comuna',
                        'cliente.comuna'
                    ]);
                    const regionOrden = obtenerValor(orden, [
                        'region',
                        'envio.region',
                        'datos.region',
                        'cliente.region'
                    ]);
                    const metodoPago = obtenerValor(orden, [
                        'pago',
                        'metodoPago',
                        'medioPago',
                        'pago.metodo',
                        'datos.pago'
                    ]);
                    const cuponOrden = obtenerValor(orden, [
                        'cupon',
                        'codigoCupon',
                        'resumen.cupon',
                        'resumen.codigoCupon'
                    ]);

                    const subtotalOrden = Number(
                        orden.subtotal ?? orden.resumen?.subtotal ?? 0
                    );
                    const descuentoOrden = Number(
                        orden.descuento ?? orden.resumen?.descuento ?? 0
                    );
                    const envioOrden = Number(
                        orden.costoEnvio ?? orden.envio?.costo ?? orden.resumen?.envio ?? 0
                    );
                    const totalOrden = Number(orden.total ?? orden.resumen?.total ?? 0);

                    const ubicacionCompleta = [direccionOrden, comunaOrden, regionOrden]
                        .filter(Boolean)
                        .join(', ');

                    const hayDetalleCompra = Boolean(
                        nombreCliente ||
                        correoCliente ||
                        telefonoCliente ||
                        ubicacionCompleta ||
                        metodoPago ||
                        cuponOrden
                    );

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
                                            {formatearFecha(orden.fecha)}
                                        </small>
                                    )}
                                </div>

                                <span className="badge rounded-pill bg-light text-dark border px-3 py-2">
                                    {estadoTexto}
                                </span>
                            </div>

                            <div className="card-body p-4">
                                {hayDetalleCompra && (
                                    <div className="bg-light rounded-3 p-3 mb-4 small">
                                        <div className="fw-semibold text-dark mb-2">
                                            Detalle de la compra
                                        </div>
                                        <div className="row g-2">
                                            {nombreCliente && (
                                                <div className="col-md-6">
                                                    <span className="text-muted">Cliente: </span>
                                                    <span className="fw-semibold text-dark">{nombreCliente}</span>
                                                </div>
                                            )}
                                            {correoCliente && (
                                                <div className="col-md-6">
                                                    <span className="text-muted">Correo: </span>
                                                    <span className="fw-semibold text-dark">{correoCliente}</span>
                                                </div>
                                            )}
                                            {telefonoCliente && (
                                                <div className="col-md-6">
                                                    <span className="text-muted">Telefono: </span>
                                                    <span className="fw-semibold text-dark">{telefonoCliente}</span>
                                                </div>
                                            )}
                                            {metodoPago && (
                                                <div className="col-md-6">
                                                    <span className="text-muted">Metodo de pago: </span>
                                                    <span className="fw-semibold text-dark">{metodoPago}</span>
                                                </div>
                                            )}
                                            {ubicacionCompleta && (
                                                <div className="col-12">
                                                    <span className="text-muted">Direccion: </span>
                                                    <span className="fw-semibold text-dark">{ubicacionCompleta}</span>
                                                </div>
                                            )}
                                            {cuponOrden && (
                                                <div className="col-12">
                                                    <span className="text-muted">Cupon: </span>
                                                    <span className="fw-semibold text-dark">{cuponOrden}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

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

                                <div className="pt-3 mt-2 d-grid gap-1">
                                    {subtotalOrden > 0 && subtotalOrden !== totalOrden && (
                                        <div className="d-flex justify-content-between small text-muted">
                                            <span>Subtotal</span>
                                            <span>${subtotalOrden.toLocaleString('es-CL')}</span>
                                        </div>
                                    )}
                                    {descuentoOrden > 0 && (
                                        <div className="d-flex justify-content-between small text-success">
                                            <span>Descuento</span>
                                            <span>-${descuentoOrden.toLocaleString('es-CL')}</span>
                                        </div>
                                    )}
                                    {envioOrden > 0 && (
                                        <div className="d-flex justify-content-between small text-muted">
                                            <span>Envio</span>
                                            <span>${envioOrden.toLocaleString('es-CL')}</span>
                                        </div>
                                    )}
                                    <div className="d-flex justify-content-between align-items-center pt-1">
                                        <span className="text-muted fw-medium">Total de la orden</span>
                                        <span className="fs-5 fw-bold text-success">
                                            ${totalOrden.toLocaleString('es-CL')}
                                        </span>
                                    </div>
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