import { productos, cupones } from '../datos.js';
import { validarStock, cuponVigente } from '../tienda.js';
import { htmlTotales } from '../componentes.js';
import { moneda, escapar } from '../utilidades.js';

// Genera una fila del carrito con sus controles de cantidad y eliminación.
function filaCarrito(linea) {
    const producto = productos.find((item) => item.id === linea.id);

    return `
        <tr>
            <td>
                <div class="d-flex align-items-center gap-2">
                    <img class="miniatura-carrito" src="${producto.imagen}" alt="${escapar(producto.nombre)}">
                    <a href="detalle.html?id=${producto.id}">${escapar(producto.nombre)}</a>
                </div>
            </td>
            <td class="text-nowrap">${moneda(producto.precio)}</td>
            <td>
                <input
                    type="number"
                    class="form-control cantidad-carrito"
                    min="1"
                    max="${producto.stock}"
                    step="1"
                    value="${linea.cantidad}"
                    data-cantidad="${producto.id}"
                    aria-label="Cantidad de ${escapar(producto.nombre)}"
                >
            </td>
            <td class="text-nowrap" data-subtotal>${moneda(producto.precio * linea.cantidad)}</td>
            <td>
                <button class="btn-carrito-quitar" type="button" data-quitar="${producto.id}">
                    Quitar
                </button>
            </td>
        </tr>
    `;
}

// Describe las condiciones del cupón sin repetir porcentajes ni topes en la interfaz.
function condicionesCupon(cupon) {
    return `${cupon.porcentaje} % de descuento, máximo ${moneda(cupon.tope)}; vigente del ${cupon.inicio} al ${cupon.fin}.`;
}

// Prepara los productos, los cupones y los controles de la vista del carrito.
export function iniciarCarrito({ compra, informar }) {
    const contenedor = document.getElementById('contenedor-carrito');
    const cuponEjemplo = cupones.find((cupon) => cuponVigente(cupon)) || cupones[0];
    let mensajeCupon = '';

    // Describe el cupón guardado o presenta las condiciones del cupón de ejemplo.
    function textoCupon() {
        if (mensajeCupon) return mensajeCupon;

        const codigo = compra.obtener().cupon;
        const cupon = cupones.find((item) => item.codigo === codigo);

        if (!codigo) return condicionesCupon(cuponEjemplo);
        if (!cuponVigente(cupon)) return 'El cupón ya no está vigente y no aplica descuento.';

        return `Cupón aplicado: ${condicionesCupon(cupon)}`;
    }

    // Actualiza los importes y el aviso del cupón sin reemplazar los controles del carrito.
    function actualizarResumen() {
        contenedor.querySelector('[data-totales]').innerHTML = htmlTotales(compra.resumen());
        document.getElementById('mensaje-cupon').textContent = textoCupon();
    }

    // Dibuja el carrito completo cuando se agregan o quitan líneas o se carga la página.
    function renderizarCarrito() {
        const estado = compra.obtener();

        if (!estado.carrito.length) {
            contenedor.innerHTML = `
                <div class="col-12 text-center py-5 bg-white border rounded">
                    <p class="fs-4">Tu carrito está vacío.</p>
                    <a href="catalogo.html" class="btn btn-agregar">Explorar catálogo</a>
                </div>
            `;
            return;
        }

        contenedor.innerHTML = `
            <div class="col-lg-8 mb-4">
                <div class="card shadow-sm">
                    <div class="table-responsive">
                        <table class="table align-middle mb-0">
                            <caption class="visually-hidden">Productos del carrito</caption>
                            <thead>
                                <tr>
                                    <th scope="col">Producto</th>
                                    <th scope="col">Precio</th>
                                    <th scope="col">Cantidad</th>
                                    <th scope="col">Subtotal</th>
                                    <th scope="col">Acción</th>
                                </tr>
                            </thead>
                            <tbody>${estado.carrito.map(filaCarrito).join('')}</tbody>
                        </table>
                    </div>
                    <div class="card-footer">
                        <button type="button" class="btn-carrito-vaciar p-2" data-vaciar>
                            Vaciar carrito
                        </button>
                    </div>
                </div>
            </div>
            <div class="col-lg-4">
                <section class="card shadow-sm">
                    <div class="card-body">
                        <h2 class="h5">Resumen de compra</h2>
                        <form id="form-cupon" class="my-3">
                            <label for="input-cupon" class="form-label">
                                Cupón (prueba ${escapar(cuponEjemplo.codigo)})
                            </label>
                            <div class="input-group">
                                <input
                                    id="input-cupon"
                                    class="form-control"
                                    value="${escapar(estado.cupon)}"
                                    aria-describedby="mensaje-cupon"
                                >
                                <button type="submit" class="btn-carrito-accion px-3">Aplicar</button>
                            </div>
                            <p id="mensaje-cupon" class="form-text" role="status"></p>
                        </form>
                        <div data-totales></div>
                        <a href="checkout.html" class="btn-carrito-pago d-block text-center text-decoration-none p-3">
                            Proceder al pago
                        </a>
                    </div>
                </section>
            </div>
        `;
        actualizarResumen();
    }

    // Valida una cantidad y actualiza su subtotal conservando el control que se está editando.
    contenedor.addEventListener('change', (evento) => {
        const campo = evento.target;
        if (!campo.matches('[data-cantidad]')) return;

        const estado = compra.obtener();
        const id = Number(campo.dataset.cantidad);
        const producto = productos.find((item) => item.id === id);
        const cantidad = Number(campo.value);
        const lineaAnterior = estado.carrito.find((linea) => linea.id === id);

        if (!validarStock(cantidad, producto.stock)) {
            informar(`Ingresa una cantidad entera entre 1 y ${producto.stock}.`, true);
            campo.value = lineaAnterior.cantidad;
            campo.setAttribute('aria-invalid', 'true');
            return;
        }

        const carrito = estado.carrito.map((linea) =>
            linea.id === id ? { ...linea, cantidad } : linea
        );

        if (!compra.guardar({ ...estado, carrito })) {
            campo.value = lineaAnterior.cantidad;
            return;
        }

        campo.removeAttribute('aria-invalid');
        campo.closest('tr').querySelector('[data-subtotal]').textContent = moneda(
            producto.precio * cantidad
        );
        informar('');
        actualizarResumen();
    });

    // Quita una línea o vacía el carrito según el botón pulsado.
    contenedor.addEventListener('click', (evento) => {
        const quitar = evento.target.closest('[data-quitar]');
        const vaciar = evento.target.closest('[data-vaciar]');
        if (!quitar && !vaciar) return;

        const estado = compra.obtener();
        const carrito = vaciar
            ? []
            : estado.carrito.filter((linea) => linea.id !== Number(quitar.dataset.quitar));
        const siguiente = { ...estado, carrito, cupon: carrito.length ? estado.cupon : '' };

        if (compra.guardar(siguiente)) {
            mensajeCupon = '';
            renderizarCarrito();
            contenedor.querySelector('[data-quitar], a')?.focus();
        }
    });

    // Aplica o rechaza el cupón y conserva el formulario mientras actualiza los importes.
    contenedor.addEventListener('submit', (evento) => {
        if (evento.target.id !== 'form-cupon') return;
        evento.preventDefault();

        const campo = document.getElementById('input-cupon');
        const codigo = campo.value.trim().toUpperCase();
        const cupon = cupones.find((item) => item.codigo === codigo);
        const valido = cuponVigente(cupon);
        const estado = compra.obtener();

        if (compra.guardar({ ...estado, cupon: valido ? codigo : '' })) {
            mensajeCupon = valido
                ? `Cupón de ${cupon.porcentaje} % aplicado; descuento máximo: ${moneda(cupon.tope)}.`
                : 'Cupón inválido o vencido.';
            campo.value = valido ? codigo : '';
            actualizarResumen();
        }
    });

    // Descarta los avisos anteriores cuando otra pestaña modifica los datos de compra.
    function actualizarVista() {
        mensajeCupon = '';
        renderizarCarrito();
    }

    renderizarCarrito();
    return actualizarVista;
}
