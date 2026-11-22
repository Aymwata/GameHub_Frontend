import { describe, expect, it } from 'vitest';
import { calcularResumen } from './precios.js';

describe('Resumen del carrito', () => {
    it('calcula el importe estimado a partir de los precios y las cantidades', () => {
        expect(calcularResumen([
            { precio: 20000, cantidad: 2 },
            { precio: 15000, cantidad: 1 },
        ])).toEqual({ subtotal: 55000, descuento: 0, total: 55000 });
    });

    it('devuelve cero con el carrito vacío', () => {
        expect(calcularResumen([])).toEqual({ subtotal: 0, descuento: 0, total: 0 });
    });
});
