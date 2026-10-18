import { productos } from './datos.js';
import { normalizarCarrito } from './tienda.js';

// Identifica los datos existentes para conservar las compras guardadas antes de la reorganización.
export const CLAVE_ESTADO = 'gamehub-store-v1';

// Crea un estado vacío cuando todavía no hay compras guardadas.
export function crearEstadoVacio() {
    return { carrito: [], cupon: '', ordenes: [] };
}

// Comprueba que una línea guardada contenga los datos necesarios para mostrar la compra.
function lineaOrdenValida(linea) {
    return (
        linea &&
        typeof linea.nombre === 'string' &&
        Number.isFinite(linea.precio) &&
        linea.precio >= 0 &&
        Number.isInteger(linea.cantidad) &&
        linea.cantidad > 0
    );
}

// Comprueba que una orden guardada pueda mostrarse con fecha, productos e importe válidos.
function ordenValida(orden) {
    return (
        orden &&
        typeof orden.id === 'string' &&
        typeof orden.fecha === 'string' &&
        !Number.isNaN(Date.parse(orden.fecha)) &&
        Array.isArray(orden.lineas) &&
        orden.lineas.length > 0 &&
        orden.lineas.every(lineaOrdenValida) &&
        Number.isFinite(orden.total) &&
        orden.total >= 0
    );
}

// Recupera los datos del navegador sin confiar en productos, precios u órdenes inválidos.
export function cargarEstado(almacenamiento) {
    try {
        const almacen = almacenamiento ?? globalThis.localStorage;
        const guardado = JSON.parse(almacen.getItem(CLAVE_ESTADO) || '{}');

        if (!guardado || typeof guardado !== 'object' || Array.isArray(guardado)) {
            throw new Error('Estado inválido');
        }

        return {
            estado: {
                carrito: normalizarCarrito(guardado.carrito, productos),
                cupon: typeof guardado.cupon === 'string' ? guardado.cupon : '',
                ordenes: Array.isArray(guardado.ordenes) ? guardado.ordenes.filter(ordenValida) : []
            },
            error: ''
        };
    } catch {
        return {
            estado: crearEstadoVacio(),
            error: 'No se pudieron leer los datos guardados; comprueba el almacenamiento del navegador antes de comprar.'
        };
    }
}

// Guarda la compra completa en una sola escritura e informa si el almacenamiento falla.
export function guardarEstado(estado, almacenamiento) {
    try {
        const almacen = almacenamiento ?? globalThis.localStorage;
        almacen.setItem(CLAVE_ESTADO, JSON.stringify(estado));
        return { error: '' };
    } catch {
        return {
            error: 'No se pudo guardar el cambio; revisa el espacio o los permisos de almacenamiento y vuelve a intentarlo.'
        };
    }
}
