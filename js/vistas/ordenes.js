import { moneda, fechaCorta, escapar } from '../utilidades.js';

// Genera una tarjeta con el resumen y el detalle desplegable de una compra guardada.
function tarjetaOrden(orden) {
    const lineas = orden.lineas
        .map(
            (linea) => `
        <li>
            ${escapar(linea.nombre)} × ${linea.cantidad}:
            ${moneda(linea.precio * linea.cantidad)}
        </li>
    `
        )
        .join('');

    return `
        <article class="tarjeta-orden">
            <h2 class="h5 identificador-orden">${escapar(orden.id)}</h2>
            <p><strong>Fecha:</strong> ${fechaCorta(orden.fecha)}</p>
            <p><strong>Estado:</strong> ${escapar(orden.estado)}</p>
            <p><strong>Total:</strong> ${moneda(orden.total)}</p>
            <details>
                <summary>Ver detalle</summary>
                <ul>${lineas}</ul>
                <p><strong>Pago:</strong> ${escapar(orden.pago)}</p>
                <p><strong>Despacho:</strong> ${escapar(orden.despacho)}</p>
                <p><strong>Dirección:</strong> ${escapar(orden.direccion)}</p>
            </details>
        </article>
    `;
}

// Prepara el historial y muestra la confirmación de la compra recién realizada.
export function iniciarOrdenes({ compra, parametros, informar }) {
    const contenedor = document.getElementById('grilla-ordenes');

    // Ordena las compras desde la más reciente y muestra un aviso si todavía no hay órdenes.
    function renderizarOrdenes() {
        const ordenes = [...compra.obtener().ordenes].sort(
            (a, b) => Date.parse(b.fecha) - Date.parse(a.fecha)
        );

        contenedor.innerHTML = ordenes.length
            ? ordenes.map(tarjetaOrden).join('')
            : `
                <p>
                    Aún no tienes órdenes guardadas en este navegador.
                    <a href="catalogo.html">Explorar catálogo</a>.
                </p>
            `;

        const confirmada = parametros.get('confirmada');

        if (confirmada && ordenes.some((orden) => orden.id === confirmada)) {
            informar(`Compra simulada confirmada; tu número de orden es ${confirmada}.`);
        }
    }

    renderizarOrdenes();
    return renderizarOrdenes;
}
