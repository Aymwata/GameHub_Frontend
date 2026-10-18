import { Link, useSearchParams } from 'react-router-dom';
import { moneda } from '../utils/precios.js';

// Muestra las compras guardadas, empezando por la más reciente.
export default function MisOrdenes({ ordenes }) {
    const [parametros] = useSearchParams();
    const confirmada = parametros.get('confirmada');
    const existeConfirmacion = ordenes.some((orden) => orden.id === confirmada);

    return (
        <div className="contenedor-pagina">
            <h1 className="titulo-seccion">Mis órdenes</h1>
            {existeConfirmacion && (
                <p role="status">Compra simulada confirmada. Tu número de orden es {confirmada}.</p>
            )}
            {ordenes.length === 0 && (
                <p>
                    Aún no tienes órdenes. <Link to="/catalogo">Explorar catálogo</Link>
                </p>
            )}
            <div className="grilla-ordenes">
                {ordenes.map((orden) => (
                    <article className="tarjeta-orden" key={orden.id}>
                        <h2 className="h5 identificador-orden">{orden.id}</h2>
                        <p>
                            <strong>Fecha:</strong>{' '}
                            {new Date(orden.fecha).toLocaleDateString('es-CL')}
                        </p>
                        <p>
                            <strong>Estado:</strong> {orden.estado}
                        </p>
                        <p>
                            <strong>Total:</strong> {moneda(orden.total)}
                        </p>
                        <details>
                            <summary>Ver detalle</summary>
                            <ul>
                                {orden.lineas.map((linea) => (
                                    <li key={linea.id}>
                                        {linea.nombre} × {linea.cantidad}:{' '}
                                        {moneda(linea.precio * linea.cantidad)}
                                    </li>
                                ))}
                            </ul>
                            <p>
                                <strong>Pago:</strong> {orden.pago}
                            </p>
                            <p>
                                <strong>Despacho:</strong> {orden.despacho}
                            </p>
                            <p>
                                <strong>Dirección:</strong> {orden.direccion}
                            </p>
                        </details>
                    </article>
                ))}
            </div>
        </div>
    );
}
