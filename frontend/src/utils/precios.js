import { cupones } from '../data/cupones.js';

// Busca un cupon y comprueba sus fechas de vigencia.
export function buscarCupon(codigo) {
    const texto = codigo.trim().toUpperCase();
    const cupon = cupones.find(item => item.codigo === texto);

    if (!cupon) return null;

    const hoy = new Date();
    const inicio = new Date(cupon.inicio + 'T00:00:00');
    const fin = new Date(cupon.fin + 'T23:59:59.999');

    if (hoy < inicio || hoy > fin) return null;

    return cupon;
}

// Calcula los importes que comparten el carrito y el checkout.
export function calcularResumen(carrito, codigoCupon) {
    let subtotal = 0;

    for (const producto of carrito) {
        subtotal += producto.precio * producto.cantidad;
    }

    let descuento = 0;
    const cupon = buscarCupon(codigoCupon);

    if (cupon) {
        descuento = Math.round(subtotal * cupon.porcentaje / 100);
        descuento = Math.min(descuento, cupon.tope, subtotal);
    }

    const total = Math.max(0, subtotal - descuento);

    return { subtotal, descuento, total };
}

export function validarReduccionStock(stockActual, cantidadComprada) {
    if (cantidadComprada > stockActual) return stockActual;
    const nuevoStock = stockActual - cantidadComprada;
    return nuevoStock < 0 ? 0 : nuevoStock;
}