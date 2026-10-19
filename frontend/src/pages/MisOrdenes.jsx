import { Link } from 'react-router-dom';

// Muestra las compras guardadas y sus productos.
function MisOrdenes({ ordenes }) {
    return (
        <main>
            <h1>Mis órdenes</h1>

            {ordenes.length === 0 && (
                <p>
                    Todavía no tienes órdenes.{' '}
                    <Link to="/catalogo">Explorar catálogo</Link>
                </p>
            )}

            {ordenes.map(orden => (
                <article className="card mb-4" key={orden.id}>
                    <div className="card-body">
                        <h2 className="h5">{orden.id}</h2>

                        <p>
                            Fecha: {new Date(orden.fecha).toLocaleDateString('es-CL')}
                        </p>
                        <p>Estado: {orden.estado}</p>
                        <p>Pago: aprobado, simulado</p>
                        <p>Despacho: pendiente de preparación</p>

                        <details>
                            <summary>Ver detalle</summary>

                            <ul className="mt-3">
                                {orden.productos.map(producto => (
                                    <li key={producto.id}>
                                        {producto.nombre} × {producto.cantidad}
                                    </li>
                                ))}
                            </ul>

                            <p>
                                Dirección: {orden.despacho.direccion},{' '}
                                {orden.despacho.comuna},{' '}
                                {orden.despacho.region}
                            </p>
                        </details>
                        
                        <p>
                            Descuento: ${(orden.descuento || 0).toLocaleString('es-CL')}
                        </p>

                        <p className="fw-bold mt-3 mb-0">
                            Total: ${orden.total.toLocaleString('es-CL')}
                        </p>
                    </div>
                </article>
            ))}
        </main>
    );
}

export default MisOrdenes;