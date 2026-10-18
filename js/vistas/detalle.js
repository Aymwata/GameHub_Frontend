import { productos } from '../datos.js';
import { agregarAlCarrito } from '../tienda.js';
import { moneda, escapar } from '../utilidades.js';

// Genera las filas que describen las características técnicas del producto.
function filasEspecificaciones(producto) {
    return Object.entries(producto.especificaciones)
        .map(
            ([atributo, valor]) => `
        <tr>
            <th scope="row">${escapar(atributo)}</th>
            <td>${escapar(valor)}</td>
        </tr>
    `
        )
        .join('');
}

// Muestra el producto solicitado y permite agregar una cantidad válida al carrito.
export function iniciarDetalle({ compra, parametros }) {
    const contenedor = document.getElementById('main-detalle');
    const producto = productos.find((item) => item.id === Number(parametros.get('id')));

    if (!producto) {
        contenedor.innerHTML = `
            <h1 class="titulo-seccion">Producto no encontrado</h1>
            <p>El producto solicitado no existe.</p>
            <a href="catalogo.html">Volver al catálogo</a>
        `;
        return;
    }

    contenedor.innerHTML = `
        <div class="row g-4 mb-5">
            <div class="col-lg-6">
                <img src="${producto.imagen}" alt="${escapar(producto.nombre)}" class="galeria-img">
            </div>
            <div class="col-lg-6 d-flex flex-column gap-3">
                <p class="marca-texto">${escapar(producto.marca)}</p>
                <h1 class="h2 fw-bold">${escapar(producto.nombre)}</h1>
                <div class="bloque-precios">
                    <p class="precio-oferta">${moneda(producto.precio)}</p>
                </div>
                <p class="fw-bold">
                    ${producto.stock ? `Stock disponible: ${producto.stock} unidades` : 'Sin stock'}
                </p>
                <form id="form-agregar" novalidate>
                    <label for="input-cantidad" class="form-label">Cantidad</label>
                    <div class="d-flex gap-3 flex-wrap">
                        <input
                            type="number"
                            id="input-cantidad"
                            class="form-control cantidad-detalle"
                            value="1"
                            min="1"
                            max="${producto.stock}"
                            step="1"
                            aria-describedby="error-cantidad"
                            ${producto.stock ? '' : 'disabled'}
                        >
                        <button
                            id="btn-agregar-carro"
                            type="submit"
                            class="btn-comprar-detalle flex-grow-1"
                            ${producto.stock ? '' : 'disabled'}
                        >
                            Agregar al carrito
                        </button>
                    </div>
                    <p id="error-cantidad" class="text-danger mt-2" role="alert"></p>
                </form>
            </div>
        </div>
        <section class="card border-0 shadow-sm">
            <div class="card-body">
                <h2 class="h4 titulo-seccion">Detalles del producto</h2>
                <div class="table-responsive">
                    <table class="table table-bordered mb-0">
                        <tbody>${filasEspecificaciones(producto)}</tbody>
                    </table>
                </div>
            </div>
        </section>
    `;

    // Valida la cantidad y guarda el producto antes de abrir el carrito.
    document.getElementById('form-agregar').addEventListener('submit', (evento) => {
        evento.preventDefault();
        const campo = document.getElementById('input-cantidad');

        try {
            const estado = compra.obtener();
            const carrito = agregarAlCarrito(estado.carrito, producto, Number(campo.value));

            if (compra.guardar({ ...estado, carrito })) {
                location.href = 'carrito.html';
            }
        } catch (error) {
            campo.setAttribute('aria-invalid', 'true');
            document.getElementById('error-cantidad').textContent = error.message;
        }
    });
}
