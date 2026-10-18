// Comprueba las reglas de la tienda con datos de ejemplo y resultados esperados.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizarCarrito, agregarAlCarrito } from '../src/utils/carrito.js';
import { calcularSubtotal, aplicarCupon, calcularTotal } from '../src/utils/precios.js';
import { validarStock, cuponVigente, validarCheckout } from '../src/utils/validaciones.js';
import { ordenarProductos } from '../src/utils/catalogo.js';
import { productos, cupones } from '../src/data/datos.js';
// Fija una fecha de ejemplo para que las pruebas de cupones sean repetibles.
const fecha = new Date(2026, 9, 17, 12);

test('agregar repetidamente acumula unidades sin duplicar ni modificar el carrito original', () => {
    const original = [{ id: 1, cantidad: 2 }];
    assert.deepEqual(agregarAlCarrito(original, productos[0], 3), [{ id: 1, cantidad: 5 }]);
    assert.deepEqual(original, [{ id: 1, cantidad: 2 }]);
});
test('el stock incluye las unidades que ya estaban en el carrito', () => {
    assert.throws(() => agregarAlCarrito([{ id: 2, cantidad: 4 }], productos[1], 2), /stock/);
    assert.deepEqual(agregarAlCarrito([{ id: 2, cantidad: 4 }], productos[1], 1), [
        { id: 2, cantidad: 5 }
    ]);
});
test('no admite cantidades vacías, fraccionarias, negativas o sin stock', () => {
    for (const cantidad of [0, -1, 1.5, NaN, Infinity])
        assert.equal(validarStock(cantidad, 5), false);
    assert.throws(() => agregarAlCarrito([], productos[2], 1));
});
test('recuperar el carrito descarta productos inexistentes y no confía en precios guardados', () => {
    const carrito = normalizarCarrito(
        [
            { id: 1, cantidad: 2, precio: 1 },
            { id: 999, cantidad: 1 },
            null,
            { id: 2, cantidad: 99 }
        ],
        productos
    );
    assert.deepEqual(carrito, [{ id: 1, cantidad: 2 }]);
    assert.equal(calcularSubtotal(carrito, productos), 360000);
    assert.deepEqual(normalizarCarrito({}, productos), []);
});
test('recuperar líneas duplicadas nunca excede el stock', () => {
    assert.deepEqual(
        normalizarCarrito(
            [
                { id: 2, cantidad: 4 },
                { id: 2, cantidad: 4 }
            ],
            productos
        ),
        [{ id: 2, cantidad: 5 }]
    );
});
test('subtotal combina productos y cantidades y admite el carrito vacío', () => {
    assert.equal(
        calcularSubtotal(
            [
                { id: 1, cantidad: 2 },
                { id: 2, cantidad: 1 }
            ],
            productos
        ),
        1210000
    );
    assert.equal(calcularSubtotal([], productos), 0);
});
test('el cupón aplica porcentaje hasta su tope', () => {
    assert.equal(aplicarCupon(180000, cupones[0], fecha), 36000);
    assert.equal(aplicarCupon(850000, cupones[0], fecha), 100000);
});
test('la vigencia incluye ambos extremos del día y rechaza fechas fuera del rango', () => {
    const cupon = cupones[0];
    assert.equal(cuponVigente(cupon, new Date(2026, 0, 1, 0)), true);
    assert.equal(cuponVigente(cupon, new Date(2026, 11, 31, 23, 59)), true);
    assert.equal(cuponVigente(cupon, new Date(2027, 0, 1)), false);
    assert.equal(cuponVigente(cupon, new Date(2025, 11, 31)), false);
    assert.equal(cuponVigente(undefined, fecha), false);
    assert.equal(cuponVigente(cupones[1], fecha), false);
    assert.equal(aplicarCupon(180000, cupones[1], fecha), 0);
});
test('el descuento y el total nunca dejan un importe negativo', () => {
    assert.equal(aplicarCupon(100, { ...cupones[0], porcentaje: 200 }, fecha), 100);
    assert.equal(calcularTotal(100, 150), 0);
    assert.equal(calcularTotal(100, -50), 100);
    assert.equal(calcularTotal(180000, 36000), 144000);
});
test('ordenar por precio conserva el catálogo original', () => {
    const ids = productos.map((producto) => producto.id);
    assert.equal(ordenarProductos(productos, 'precio-asc')[0].id, 1);
    assert.equal(ordenarProductos(productos, 'precio-desc')[0].id, 4);
    assert.deepEqual(
        productos.map((producto) => producto.id),
        ids
    );
});
test('checkout exige dirección y todos los datos de despacho', () => {
    const errores = validarCheckout({});
    for (const campo of ['nombre', 'correo', 'telefono', 'region', 'comuna', 'direccion', 'pago'])
        assert.ok(errores[campo]);
});
test('checkout rechaza espacios, correo inválido, teléfono incompleto y pago desconocido', () => {
    const errores = validarCheckout({
        nombre: ' ',
        correo: 'sin-correo',
        telefono: '123',
        region: ' ',
        comuna: '',
        direccion: ' ',
        pago: 'otro'
    });
    assert.equal(Object.keys(errores).length, 7);
});
test('checkout admite un despacho completo con pago simulado', () => {
    assert.deepEqual(
        validarCheckout({
            nombre: 'Cliente de prueba',
            correo: 'cliente@example.com',
            telefono: '912345678',
            region: 'Valparaíso',
            comuna: 'Viña del Mar',
            direccion: 'Calle de prueba 123',
            pago: 'tarjeta'
        }),
        {}
    );
});
