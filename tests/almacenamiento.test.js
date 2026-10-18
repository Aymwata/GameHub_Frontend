import { test } from 'node:test';
import assert from 'node:assert/strict';
import { leerCompra, guardarCompra, CLAVE_COMPRA } from '../src/services/almacenamiento.js';

// Imita el navegador para comprobar el guardado sin utilizar datos personales.
function crearAlmacen(texto = null) {
    return {
        getItem() {
            return texto;
        },
        setItem(clave, valor) {
            assert.equal(clave, CLAVE_COMPRA);
            texto = valor;
        }
    };
}

test('una compra vacía se inicia sin productos ni órdenes', () => {
    assert.deepEqual(leerCompra(crearAlmacen()), { carrito: [], cupon: '', ordenes: [] });
});

test('se recuperan productos y órdenes guardados con la clave anterior', () => {
    const compra = {
        carrito: [{ id: 1, cantidad: 2 }],
        cupon: 'GAME20',
        ordenes: [
            {
                id: 'ORD-ANTERIOR',
                lineas: [{ id: 1, nombre: 'Monitor', precio: 180000, cantidad: 1 }],
                total: 180000
            }
        ]
    };
    assert.deepEqual(leerCompra(crearAlmacen(JSON.stringify(compra))), compra);
});

test('un archivo corrupto no impide abrir la tienda', () => {
    assert.deepEqual(leerCompra(crearAlmacen('{roto')), { carrito: [], cupon: '', ordenes: [] });
});

test('la compra completa se guarda en una sola escritura', () => {
    const almacen = crearAlmacen();
    const compra = { carrito: [], cupon: '', ordenes: [{ id: 'ORD-1', lineas: [] }] };
    assert.equal(guardarCompra(compra, almacen), true);
    assert.deepEqual(JSON.parse(almacen.getItem(CLAVE_COMPRA)), compra);
});

test('un fallo de escritura se informa sin sobrescribir la compra anterior', () => {
    const almacen = crearAlmacen('anterior');
    almacen.setItem = () => {
        throw new Error('Sin espacio');
    };
    assert.equal(guardarCompra({ carrito: [] }, almacen), false);
    assert.equal(almacen.getItem(CLAVE_COMPRA), 'anterior');
});
