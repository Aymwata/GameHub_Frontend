export function calcularResumen(carrito) {
    const subtotal = carrito.reduce((total, producto) => total + producto.precio * producto.cantidad, 0);
    return { subtotal, descuento: 0, total: subtotal };
}
