import { calcularResumen, validarReduccionStock } from './precios.js'; 

describe('Logica de Negocio - Calculos de Precios', () => {

  describe('1. Calculo de Subtotales (Sin cupon)', () => {
    // Prueba 1
    it('Deberia calcular el subtotal y total exacto sumando los productos', () => {
      const mockCarrito = [
        { precio: 20000, cantidad: 2 }, 
        { precio: 15000, cantidad: 1 }  
      ];
      
      const resumen = calcularResumen(mockCarrito, '');
      
      expect(resumen.subtotal).toBe(55000);
      expect(resumen.descuento).toBe(0);
      expect(resumen.total).toBe(55000);
    });

    // Prueba 2
    it('Deberia retornar todos los valores en 0 si el carrito esta vacio', () => {
      const resumen = calcularResumen([], '');
      
      expect(resumen.subtotal).toBe(0);
      expect(resumen.descuento).toBe(0);
      expect(resumen.total).toBe(0);
    });
  });

  describe('2. Verificacion de Integridad Matematica', () => {
    // Prueba 3
    it('Deberia ignorar los valores negativos o nulos en el calculo del subtotal', () => {
      const mockCarrito = [
        { precio: -5000, cantidad: 1 }, 
        { precio: 10000, cantidad: 0 }
      ];
      
      const resumen = calcularResumen(mockCarrito, '');
      
      expect(resumen.subtotal).toBeLessThanOrEqual(0);
      expect(resumen.total).toBe(0);
    });
  });

  describe('3. Logica de Inventario', () => {
    // Prueba 4
    it('Deberia restar la cantidad comprada del stock actual', () => {
        const resultado = validarReduccionStock(10, 3);
        expect(resultado).toBe(7);
    });

    // Prueba 5
    it('No deberia descontar el stock si la compra supera el limite', () => {
        const resultado = validarReduccionStock(5, 10);
        expect(resultado).toBe(5); 
    });
  });

});