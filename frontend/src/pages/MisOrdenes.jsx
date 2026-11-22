import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ResumenCompra from '../components/ResumenCompra.jsx';

const estadosOrden = {
    PENDIENTE: 'Pendiente de pago', PAGADA: 'Pagada', PAID: 'Pagada', CANCELADA: 'Cancelada', CANCELED: 'Cancelada',
};

export default function MisOrdenes({ productos, solicitarConSesion }) {
    const { state } = useLocation();
    const [peticion, setPeticion] = useState({ estado: 'cargando', ordenes: [] });
    const [revision, setRevision] = useState(0);

    useEffect(() => {
        const controlador = new AbortController();
        solicitarConSesion('/orders/me', { signal: controlador.signal }).then(ordenes => {
            if (!controlador.signal.aborted) setPeticion({ estado: 'listo', ordenes });
        }).catch(() => {
            if (!controlador.signal.aborted) setPeticion({ estado: 'error', ordenes: [] });
        });
        return () => controlador.abort();
    }, [solicitarConSesion, revision]);

    return (
        <main className="container py-4">
            <h1 className="h2">Mis órdenes</h1>
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
                <p>Todavía no tienes órdenes. <Link to="/catalogo">Explorar catálogo</Link></p>
            )}
            <div className="d-grid gap-3">
                {[...peticion.ordenes].sort((a, b) => b.id - a.id).map(orden => (
                    <article key={orden.id} className="card p-3">
                        <h2 className="h5">Orden #{orden.id}</h2>
                        {orden.fechaCreacion && <p>{new Date(orden.fechaCreacion).toLocaleString('es-CL')}</p>}
                        <p>Estado {estadosOrden[orden.estado] ?? orden.estado}</p>
                        <ul>{orden.detalles.map(detalle => (
                            <li key={detalle.id}>
                                {productos.get(detalle.productoId)?.nombre ?? 'Producto #' + detalle.productoId}
                                {' × '}{detalle.cantidad} · {'$'}{detalle.precioUnitario.toLocaleString('es-CL')} por unidad
                            </li>
                        ))}</ul>
                        <ResumenCompra resumen={orden} />
                    </article>
                ))}
            </div>
        </main>
    );
}
