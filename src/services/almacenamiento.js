import { productos } from '../data/datos.js';
import { normalizarCarrito } from '../utils/carrito.js';

// Conserva la misma clave para recuperar los datos de la versión anterior.
export const CLAVE_COMPRA = 'gamehub-store-v1';

// Recupera la compra guardada o comienza una compra vacía.
export function leerCompra(almacenamiento) {
    const vacia = { carrito: [], cupon: '', ordenes: [] };

    try {
        const almacen = almacenamiento || localStorage;
        const texto = almacen.getItem(CLAVE_COMPRA);
        if (!texto) return vacia;

        const compra = JSON.parse(texto);
        if (!compra || typeof compra !== 'object') return vacia;

        return {
            carrito: normalizarCarrito(compra.carrito, productos),
            cupon: typeof compra.cupon === 'string' ? compra.cupon : '',
            ordenes: Array.isArray(compra.ordenes)
                ? compra.ordenes.filter((orden) => orden && Array.isArray(orden.lineas))
                : []
        };
    } catch {
        return vacia;
    }
}

// Guarda la compra completa y devuelve false si el navegador rechaza la escritura.
export function guardarCompra(compra, almacenamiento) {
    try {
        const almacen = almacenamiento || localStorage;
        almacen.setItem(CLAVE_COMPRA, JSON.stringify(compra));
        return true;
    } catch {
        return false;
    }
}
