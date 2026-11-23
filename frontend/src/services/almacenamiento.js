const CLAVE_CARRITO = 'gamehub-carrito-api';

export function leerCompra() {
    try {
        const guardado = JSON.parse(localStorage.getItem(CLAVE_CARRITO));
        if (Array.isArray(guardado?.carrito)) {
            const carrito = guardado.carrito.filter(linea =>
                Number.isSafeInteger(linea?.id) && linea.id > 0 &&
                Number.isSafeInteger(linea.cantidad) && linea.cantidad > 0);
            return { carrito, cupon: typeof guardado.cupon === 'string' ? guardado.cupon : '' };
        }
    } catch {
        // El carrito sigue disponible en memoria si el navegador bloquea el almacenamiento.
    }
    return { carrito: [], cupon: '' };
}

export function guardarCompra(compra) {
    try {
        localStorage.setItem(CLAVE_CARRITO, JSON.stringify(compra));
        return true;
    } catch {
        return false;
    }
}
