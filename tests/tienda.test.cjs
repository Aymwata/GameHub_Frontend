// Comprueba las reglas de la tienda con datos de ejemplo y resultados esperados.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const tienda = require('../js/tienda.js');
const { productos, cupones } = require('../js/datos.js');
// Fija una fecha de ejemplo para que las pruebas de cupones sean repetibles.
const fecha = new Date(2026, 9, 17, 12);

test('agregar repetidamente acumula unidades sin duplicar ni modificar el carrito original', () => {
    const original = [{ id: 1, cantidad: 2 }];
    assert.deepEqual(tienda.agregarAlCarrito(original, productos[0], 3), [{ id: 1, cantidad: 5 }]);
    assert.deepEqual(original, [{ id: 1, cantidad: 2 }]);
});
test('el stock incluye las unidades que ya estaban en el carrito', () => {
    assert.throws(() => tienda.agregarAlCarrito([{ id: 2, cantidad: 4 }], productos[1], 2), /stock/);
    assert.deepEqual(tienda.agregarAlCarrito([{ id: 2, cantidad: 4 }], productos[1], 1), [{ id: 2, cantidad: 5 }]);
});
test('no admite cantidades vacías, fraccionarias, negativas o sin stock', () => {
    for (const cantidad of [0, -1, 1.5, NaN, Infinity]) assert.equal(tienda.validarStock(cantidad, 5), false);
    assert.throws(() => tienda.agregarAlCarrito([], productos[2], 1));
});
test('recuperar el carrito descarta productos inexistentes y no confía en precios guardados', () => {
    const carrito = tienda.normalizarCarrito([{ id: 1, cantidad: 2, precio: 1 }, { id: 999, cantidad: 1 }, null, { id: 2, cantidad: 99 }], productos);
    assert.deepEqual(carrito, [{ id: 1, cantidad: 2 }]);
    assert.equal(tienda.calcularSubtotal(carrito, productos), 360000);
    assert.deepEqual(tienda.normalizarCarrito({}, productos), []);
});
test('recuperar líneas duplicadas nunca excede el stock', () => {
    assert.deepEqual(tienda.normalizarCarrito([{ id: 2, cantidad: 4 }, { id: 2, cantidad: 4 }], productos), [{ id: 2, cantidad: 5 }]);
});
test('subtotal combina productos y cantidades y admite el carrito vacío', () => {
    assert.equal(tienda.calcularSubtotal([{ id: 1, cantidad: 2 }, { id: 2, cantidad: 1 }], productos), 1210000);
    assert.equal(tienda.calcularSubtotal([], productos), 0);
});
test('el cupón aplica porcentaje hasta su tope', () => {
    assert.equal(tienda.aplicarCupon(180000, cupones[0], fecha), 36000);
    assert.equal(tienda.aplicarCupon(850000, cupones[0], fecha), 100000);
});
test('la vigencia incluye ambos extremos del día y rechaza fechas fuera del rango', () => {
    const cupon = cupones[0];
    assert.equal(tienda.cuponVigente(cupon, new Date(2026, 0, 1, 0)), true);
    assert.equal(tienda.cuponVigente(cupon, new Date(2026, 11, 31, 23, 59)), true);
    assert.equal(tienda.cuponVigente(cupon, new Date(2027, 0, 1)), false);
    assert.equal(tienda.cuponVigente(cupon, new Date(2025, 11, 31)), false);
    assert.equal(tienda.cuponVigente(undefined, fecha), false);
    assert.equal(tienda.cuponVigente(cupones[1], fecha), false);
    assert.equal(tienda.aplicarCupon(180000, cupones[1], fecha), 0);
});
test('el descuento y el total nunca dejan un importe negativo', () => {
    assert.equal(tienda.aplicarCupon(100, { ...cupones[0], porcentaje: 200 }, fecha), 100);
    assert.equal(tienda.calcularTotal(100, 150), 0);
    assert.equal(tienda.calcularTotal(100, -50), 100);
    assert.equal(tienda.calcularTotal(180000, 36000), 144000);
});
test('ordenar por precio conserva el catálogo original', () => {
    const ids = productos.map(producto => producto.id);
    assert.equal(tienda.ordenarProductos(productos, 'precio-asc')[0].id, 1);
    assert.equal(tienda.ordenarProductos(productos, 'precio-desc')[0].id, 4);
    assert.deepEqual(productos.map(producto => producto.id), ids);
});
test('checkout exige dirección y todos los datos de despacho', () => {
    const errores = tienda.validarCheckout({});
    for (const campo of ['nombre', 'correo', 'telefono', 'region', 'comuna', 'direccion', 'pago']) assert.ok(errores[campo]);
});
test('checkout rechaza espacios, correo inválido, teléfono incompleto y pago desconocido', () => {
    const errores = tienda.validarCheckout({ nombre: ' ', correo: 'sin-correo', telefono: '123', region: ' ', comuna: '', direccion: ' ', pago: 'otro' });
    assert.equal(Object.keys(errores).length, 7);
});
test('checkout admite un despacho completo con pago simulado', () => {
    assert.deepEqual(tienda.validarCheckout({ nombre: 'Cliente de prueba', correo: 'cliente@example.com', telefono: '912345678', region: 'Valparaíso', comuna: 'Viña del Mar', direccion: 'Calle de prueba 123', pago: 'tarjeta' }), {});
});
