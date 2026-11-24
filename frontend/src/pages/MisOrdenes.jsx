import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ImagenProducto from '../components/ImagenProducto.jsx';

const estadosOrden = {
    PENDIENTE: { texto: 'Pendiente de pago', estilo: 'bg-warning-subtle text-dark border-warning-subtle' },
    PAGADA: { texto: 'Pagada', estilo: 'bg-success-subtle text-success border-success-subtle' },
    CANCELADA: { texto: 'Cancelada', estilo: 'bg-danger-subtle text-danger border-danger-subtle' },
};

const moneda = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' });

function estaCancelada(orden) {
    return ['CANCELADA', 'CANCELED'].includes(String(orden.estado).toUpperCase());
}

function estadoVisual(estado) {
    const clave = estado === 'PAID' ? 'PAGADA' : estado === 'CANCELED' ? 'CANCELADA' : estado;
    return estadosOrden[clave] ?? { texto: estado, estilo: 'bg-secondary-subtle text-dark border-secondary-subtle' };
}

function TarjetaOrden({ orden, productos, usuario }) {
    const estado = estadoVisual(orden.estado);
    const entrega = orden.datosCheckout;
    const contacto = entrega ?? usuario;
    const direccion = entrega
        ? [...new Set([entrega.direccion, entrega.comuna, entrega.ciudad, entrega.region].filter(Boolean))].join(', ')
        : '';
    return (
        <article className="orden-card card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-header bg-white border-bottom py-3 px-4 d-flex flex-wrap justify-content-between align-items-center gap-2">
                <div className="d-flex align-items-center flex-wrap gap-2">
                    <h2 className="h6 fw-bold mb-0">Orden #{orden.id}</h2>
                    {orden.fechaCreacion && <time className="small text-muted" dateTime={orden.fechaCreacion}>
                        {new Date(orden.fechaCreacion).toLocaleString('es-CL')}
                    </time>}
                </div>
                <span className={'badge rounded-pill px-3 py-2 border ' + estado.estilo}>{estado.texto}</span>
            </div>

            <div className="card-body p-4">
                {orden.detalles.length === 0 && <p className="text-muted">Esta orden no tiene detalle de productos.</p>}
                <ul className="list-unstyled d-grid gap-3 mb-0">
                    {orden.detalles.map(detalle => {
                        const producto = productos.get(detalle.productoId) ?? { nombre: 'Producto #' + detalle.productoId };
                        return (
                            <li key={detalle.id} className="d-flex flex-wrap justify-content-between align-items-center gap-3 pb-3 border-bottom">
                                <div className="d-flex align-items-center gap-3">
                                    <ImagenProducto producto={producto} className="orden-item-imagen rounded-3 border bg-light" />
                                    <div>
                                        <div className="fw-semibold">{producto.nombre}{' × '}{detalle.cantidad}</div>
                                        <small className="text-muted">{moneda.format(detalle.precioUnitario)} por unidad</small>
                                    </div>
                                </div>
                                <span className="fw-bold text-nowrap">{moneda.format(detalle.precioUnitario * detalle.cantidad)}</span>
                            </li>
                        );
                    })}
                </ul>

                {contacto && (
                    <div className="bg-light rounded-3 border p-3 mt-3 mb-2 small">
                        <h3 className="h6 fw-bold">Detalle del pedido</h3>
                        <div className="row g-2">
                            <div className="col-md-6"><span className="text-muted">Nombre </span><strong>{contacto.nombre}</strong></div>
                            <div className="col-md-6 text-break"><span className="text-muted">Correo </span><strong>{contacto.email}</strong></div>
                            {entrega && <>
                                <div className="col-md-6"><span className="text-muted">Teléfono </span><strong>{entrega.telefono}</strong></div>
                                <div className="col-md-6">
                                    <span className="text-muted">Método elegido </span>
                                    <strong>{entrega.metodoPago === 'TRANSFERENCIA' ? 'Transferencia' : 'Tarjeta'}</strong>
                                </div>
                                <div className="col-12">
                                    <span className="text-muted">Dirección </span>
                                    <strong>{direccion}</strong>
                                </div>
                            </>}
                        </div>
                    </div>
                )}

                {orden.descuento > 0 && (
                    <div className="d-flex justify-content-between gap-3 small mt-3">
                        <span>Descuento {orden.codigoPromocion}</span>
                        <span>−{moneda.format(orden.descuento)}</span>
                    </div>
                )}
                <div className="d-flex align-items-center justify-content-between gap-3 pt-3 mt-2">
                    <span className="text-muted fw-medium">Total de la orden</span>
                    <span className="fs-5 fw-bold text-success">{moneda.format(orden.total)}</span>
                </div>
            </div>
        </article>
    );
}

export default function MisOrdenes({ productos, usuario, solicitarConSesion }) {
    const { state } = useLocation();
    const [peticion, setPeticion] = useState({ estado: 'cargando', ordenes: [] });
    const [revision, setRevision] = useState(0);

    useEffect(() => {
        const controlador = new AbortController();
        solicitarConSesion('/orders/me', { signal: controlador.signal }).then(ordenes => {
            if (!controlador.signal.aborted) setPeticion({ estado: 'listo', ordenes: ordenes.filter(orden => !estaCancelada(orden)) });
        }).catch(() => {
            if (!controlador.signal.aborted) setPeticion({ estado: 'error', ordenes: [] });
        });
        return () => controlador.abort();
    }, [solicitarConSesion, revision]);

    return (
        <main className="container py-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
                <div>
                    <h1 className="h2 fw-bold mb-1">Mis órdenes</h1>
                    <p className="text-muted mb-0">Revisa el estado y los productos de tus compras anteriores.</p>
                </div>
                <Link to="/catalogo" className="btn btn-outline-success btn-sm">Seguir comprando</Link>
            </div>
            {state?.ordenCreada && <p className="alert alert-success" role="status">Se registró la orden #{state.ordenCreada}.</p>}
            {peticion.estado === 'cargando' && <p role="status">Cargando órdenes…</p>}
            {peticion.estado === 'error' && (
                <div className="alert alert-danger" role="alert">
                    <p>No pudimos consultar tus órdenes.</p>
                    <button type="button" className="btn btn-outline-dark" onClick={() => {
                        setPeticion({ estado: 'cargando', ordenes: [] });
                        setRevision(actual => actual + 1);
                    }}>Reintentar</button>
                </div>
            )}
            {peticion.estado === 'listo' && peticion.ordenes.length === 0 && (
                <section className="card border-0 shadow-sm rounded-4 p-5 text-center">
                    <h2 className="h4 fw-bold">No tienes órdenes activas.</h2>
                    <div><Link to="/catalogo" className="btn btn-success mt-2">Explorar catálogo</Link></div>
                </section>
            )}
            <div className="d-grid gap-4">
                {[...peticion.ordenes].sort((a, b) => b.id - a.id).map(orden => (
                    <TarjetaOrden key={orden.id} orden={orden} productos={productos} usuario={usuario} />
                ))}
            </div>
        </main>
    );
}
