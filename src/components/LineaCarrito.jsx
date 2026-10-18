import { useState } from 'react';
import { Link } from 'react-router-dom';
import { moneda } from '../utils/precios.js';

// Muestra una línea y conserva la cantidad escrita hasta que el usuario sale del campo.
export default function LineaCarrito({ linea, producto, cambiarCantidad, quitarProducto }) {
    const [cantidad, setCantidad] = useState(String(linea.cantidad));

    // Guarda una cantidad válida o recupera la anterior si hubo un error.
    function confirmarCantidad() {
        if (!cambiarCantidad(producto, Number(cantidad))) {
            setCantidad(String(linea.cantidad));
        }
    }

    return (
        <tr>
            <td>
                <div className="d-flex align-items-center gap-2">
                    <img
                        className="miniatura-carrito"
                        src={producto.imagen}
                        alt={producto.nombre}
                    />
                    <Link to={'/producto/' + producto.id}>{producto.nombre}</Link>
                </div>
            </td>
            <td className="text-nowrap">{moneda(producto.precio)}</td>
            <td>
                <input
                    type="number"
                    className="form-control cantidad-carrito"
                    min="1"
                    max={producto.stock}
                    step="1"
                    aria-label={'Cantidad de ' + producto.nombre}
                    value={cantidad}
                    onChange={(evento) => setCantidad(evento.target.value)}
                    onBlur={confirmarCantidad}
                />
            </td>
            <td className="text-nowrap">{moneda(producto.precio * linea.cantidad)}</td>
            <td>
                <button
                    type="button"
                    className="btn-carrito-quitar"
                    onClick={() => quitarProducto(producto.id)}
                >
                    Quitar
                </button>
            </td>
        </tr>
    );
}
