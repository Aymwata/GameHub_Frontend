import { categorias } from './datos.js';
import { moneda, escapar } from './utilidades.js';

// Genera una tarjeta de producto que puede reutilizarse en inicio y catálogo.
export function tarjetaProducto(producto, columnas, nivelTitulo = 3) {
    const estadoStock = producto.stock ? 'badge-stock-ok' : 'badge-stock-out';
    const textoStock = producto.stock ? `Stock: ${producto.stock} uds.` : 'Sin stock';
    const titulo = `h${nivelTitulo}`;

    return `
        <article class="${columnas} mb-4">
            <div class="card tarjeta-producto position-relative">
                <span class="badge ${estadoStock} position-absolute top-0 end-0 m-2">
                    ${textoStock}
                </span>
                <img
                    src="${producto.imagen}"
                    class="card-img-top imagen-producto"
                    alt="${escapar(producto.nombre)}"
                    loading="lazy"
                >
                <div class="card-body d-flex flex-column">
                    <${titulo} class="card-title nombre-producto">
                        ${escapar(producto.nombre)}
                    </${titulo}>
                    <p class="card-text precio-producto">${moneda(producto.precio)}</p>
                    <a href="detalle.html?id=${producto.id}" class="btn btn-agregar mt-auto">
                        Ver detalle
                    </a>
                </div>
            </div>
        </article>
    `;
}

// Genera el resumen de importes que comparten el carrito y el checkout.
export function htmlTotales({ subtotal, descuento, total }) {
    return `
        <dl class="totales">
            <div>
                <dt>Subtotal</dt>
                <dd>${moneda(subtotal)}</dd>
            </div>
            <div>
                <dt>Descuento</dt>
                <dd>−${moneda(descuento)}</dd>
            </div>
            <div class="total-final">
                <dt>Total</dt>
                <dd>${moneda(total)}</dd>
            </div>
        </dl>
    `;
}

// Crea un espacio común para avisos y entrega la función que actualiza su mensaje.
export function prepararAvisos() {
    const aviso = document.createElement('p');
    aviso.className = 'aviso-global contenedor-pagina';
    aviso.setAttribute('role', 'status');
    aviso.setAttribute('aria-live', 'polite');
    aviso.hidden = true;
    document.querySelector('header').after(aviso);

    // Muestra el mensaje y distingue los errores del resto de avisos.
    function informar(texto, error = false) {
        aviso.textContent = texto;
        aviso.classList.toggle('text-danger', error);
        aviso.hidden = !texto;
    }

    return informar;
}

// Muestra la cantidad total de unidades en los accesos al carrito.
export function actualizarContador(estado) {
    const cantidad = estado.carrito.reduce((total, linea) => total + linea.cantidad, 0);

    document.querySelectorAll('.btn-carrito').forEach((enlace) => {
        enlace.textContent = `Carrito (${cantidad})`;
    });
}

// Genera los accesos por categoría a partir de los mismos datos que usa el catálogo.
export function prepararCategorias() {
    document.querySelector('.catalogo').innerHTML = `
        <li><a class="dropdown-item" href="catalogo.html">Todas las categorías</a></li>
        ${categorias
            .map(
                (categoria) => `
            <li>
                <a class="dropdown-item" href="catalogo.html?categoria=${categoria.id}">
                    ${escapar(categoria.nombre)}
                </a>
            </li>
        `
            )
            .join('')}
    `;
}

// Conecta el buscador compartido con los resultados del catálogo.
export function prepararBuscador(parametros) {
    const formulario = document.getElementById('form-busqueda');
    const campo = document.getElementById('input-busqueda');
    campo.value = parametros.get('buscar') || '';

    // Abre el catálogo con el término de búsqueda escrito por el usuario.
    formulario.addEventListener('submit', (evento) => {
        evento.preventDefault();
        const busqueda = campo.value.trim();

        location.href = busqueda
            ? `catalogo.html?buscar=${encodeURIComponent(busqueda)}`
            : 'catalogo.html';
    });
}
