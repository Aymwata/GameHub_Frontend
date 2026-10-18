import { validarStock, cuponVigente } from './validaciones.js';

// Suma el precio por la cantidad de cada producto válido del carrito.
export function calcularSubtotal(carrito, productos) {
    let subtotal = 0;

    for (const linea of carrito) {
        const producto = productos.find((item) => item.id === linea.id);

        if (producto && validarStock(linea.cantidad, producto.stock)) {
            subtotal = subtotal + producto.precio * linea.cantidad;
        }
    }

    return subtotal;
}

// Calcula el descuento del cupón vigente sin superar su tope ni el subtotal.
export function aplicarCupon(subtotal, cupon, fecha = new Date()) {
    if (!cuponVigente(cupon, fecha) || !Number.isFinite(subtotal) || subtotal <= 0) {
        return 0;
    }

    const descuentoPorcentaje = Math.round((subtotal * cupon.porcentaje) / 100);
    const descuentoLimitado = Math.min(subtotal, descuentoPorcentaje, cupon.tope);

    return Math.max(0, descuentoLimitado);
}

// Resta el descuento y evita que el total sea negativo.
export function calcularTotal(subtotal, descuento) {
    return Math.max(0, subtotal - Math.max(0, descuento));
}

// Presenta un número como un precio en pesos chilenos.
export function moneda(valor) {
    return valor.toLocaleString('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0
    });
}
