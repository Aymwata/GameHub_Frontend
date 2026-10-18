import { productos, cupones } from './datos.js';
import { cargarEstado, guardarEstado } from './almacenamiento.js';
import { calcularSubtotal, aplicarCupon, calcularTotal } from './tienda.js';

// Mantiene los datos de la compra y solo los actualiza cuando se guardan correctamente.
export function crearEstadoCompra({ alGuardar, alError, almacenamiento }) {
    const cargaInicial = cargarEstado(almacenamiento);
    let estado = cargaInicial.estado;

    // Entrega los datos actuales para que las vistas puedan consultarlos.
    function obtener() {
        return estado;
    }

    // Conserva el estado anterior si el navegador rechaza una modificación.
    function guardar(siguiente) {
        const resultado = guardarEstado(siguiente, almacenamiento);

        if (resultado.error) {
            alError(resultado.error, true);
            return false;
        }

        estado = siguiente;
        alGuardar(estado);
        return true;
    }

    // Vuelve a leer los datos cuando otra pestaña modifica la compra.
    function recargar() {
        const resultado = cargarEstado(almacenamiento);
        estado = resultado.estado;
        alGuardar(estado);

        if (resultado.error) {
            alError(resultado.error, true);
        }
    }

    // Calcula los importes actuales a partir del catálogo y del cupón guardado.
    function resumen() {
        const subtotal = calcularSubtotal(estado.carrito, productos);
        const cupon = cupones.find((item) => item.codigo === estado.cupon);
        const descuento = aplicarCupon(subtotal, cupon);

        return {
            subtotal,
            descuento,
            total: calcularTotal(subtotal, descuento)
        };
    }

    return {
        obtener,
        guardar,
        recargar,
        resumen,
        errorInicial: cargaInicial.error
    };
}
