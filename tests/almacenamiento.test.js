import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
    CLAVE_ESTADO,
    cargarEstado,
    guardarEstado,
    crearEstadoVacio
} from '../js/almacenamiento.js';
import { crearEstadoCompra } from '../js/estado.js';

// Imita el almacenamiento del navegador sin escribir datos reales ni depender de una página.
function crearAlmacenamiento(contenido = null) {
    const valores = new Map(contenido === null ? [] : [[CLAVE_ESTADO, contenido]]);

    return {
        getItem: (clave) => valores.get(clave) ?? null,
        setItem: (clave, valor) => valores.set(clave, valor)
    };
}

test('el almacenamiento vacío inicia una compra sin productos ni órdenes', () => {
    assert.deepEqual(cargarEstado(crearAlmacenamiento()), {
        estado: crearEstadoVacio(),
        error: ''
    });
});

test('el almacenamiento conserva un carrito y una orden de la versión anterior', () => {
    const orden = {
        id: 'ORD-ANTERIOR',
        fecha: '2026-10-17T12:00:00.000Z',
        estado: 'Confirmada',
        pago: 'Aprobado (simulado)',
        despacho: 'Pendiente de preparación',
        direccion: 'Calle de prueba 123',
        lineas: [{ id: 1, nombre: 'Monitor comprado', precio: 180000, cantidad: 1 }],
        subtotal: 180000,
        descuento: 36000,
        total: 144000
    };
    const anterior = { carrito: [{ id: 2, cantidad: 1 }], cupon: 'GAME20', ordenes: [orden] };
    const resultado = cargarEstado(crearAlmacenamiento(JSON.stringify(anterior)));

    assert.deepEqual(resultado, { estado: anterior, error: '' });
});

test('los datos corruptos o un permiso de lectura denegado producen un aviso y un estado vacío', () => {
    for (const contenido of ['{roto', 'null', '[]']) {
        const resultado = cargarEstado(crearAlmacenamiento(contenido));
        assert.deepEqual(resultado.estado, crearEstadoVacio());
        assert.ok(resultado.error);
    }

    const bloqueado = {
        getItem() {
            throw new Error('Sin permiso');
        }
    };
    assert.ok(cargarEstado(bloqueado).error);
});

test('las órdenes incompletas o con fecha inválida no llegan a la vista del historial', () => {
    const datos = {
        carrito: [],
        cupon: '',
        ordenes: [null, {}, { id: 'ORD-ROTA', fecha: 'inválida', lineas: [], total: 0 }]
    };
    assert.deepEqual(cargarEstado(crearAlmacenamiento(JSON.stringify(datos))).estado.ordenes, []);
});

test('guardar una orden y vaciar el carrito se realiza con una sola escritura', () => {
    const llamadas = [];
    const almacenamiento = { setItem: (...argumentos) => llamadas.push(argumentos) };
    const siguiente = { carrito: [], cupon: '', ordenes: [{ id: 'ORD-NUEVA' }] };

    assert.equal(guardarEstado(siguiente, almacenamiento).error, '');
    assert.deepEqual(llamadas, [[CLAVE_ESTADO, JSON.stringify(siguiente)]]);
});

test('un fallo al guardar conserva el carrito y evita notificar una compra exitosa', () => {
    const inicial = { carrito: [{ id: 1, cantidad: 1 }], cupon: '', ordenes: [] };
    const almacenamiento = crearAlmacenamiento(JSON.stringify(inicial));
    const errores = [];
    let guardados = 0;
    almacenamiento.setItem = () => {
        throw new Error('Sin espacio');
    };
    const compra = crearEstadoCompra({
        almacenamiento,
        alGuardar: () => {
            guardados += 1;
        },
        alError: (mensaje) => errores.push(mensaje)
    });

    assert.equal(compra.guardar(crearEstadoVacio()), false);
    assert.deepEqual(compra.obtener(), inicial);
    assert.equal(guardados, 0);
    assert.equal(errores.length, 1);
});

test('recargar la compra recoge los cambios guardados por otra pestaña', () => {
    const almacenamiento = crearAlmacenamiento();
    const notificaciones = [];
    const compra = crearEstadoCompra({
        almacenamiento,
        alGuardar: (estado) => notificaciones.push(estado),
        alError: assert.fail
    });
    const siguiente = { carrito: [{ id: 2, cantidad: 2 }], cupon: '', ordenes: [] };
    almacenamiento.setItem(CLAVE_ESTADO, JSON.stringify(siguiente));
    compra.recargar();

    assert.deepEqual(compra.obtener(), siguiente);
    assert.equal(notificaciones.length, 1);
    assert.deepEqual(compra.resumen(), { subtotal: 1700000, descuento: 0, total: 1700000 });
});
