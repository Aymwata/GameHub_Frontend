import { productos } from '../datos.js';
import { validarCheckout } from '../tienda.js';
import { htmlTotales } from '../componentes.js';
import { escapar } from '../utilidades.js';

// Prepara la validación de despacho y la creación de una orden simulada.
export function iniciarCheckout({ compra }) {
    const formulario = document.getElementById('form-checkout');
    const contenedorResumen = document.getElementById('resumen-checkout');
    const botonPago = formulario.querySelector('[type="submit"]');
    const campos = ['nombre', 'correo', 'telefono', 'region', 'comuna', 'direccion', 'pago'];

    // Reúne los valores del formulario en un objeto que puede validar la tienda.
    function datosCheckout() {
        return Object.fromEntries(new FormData(formulario));
    }

    // Muestra el resumen solo al cargar la vista o cuando cambia la compra.
    function mostrarResumen() {
        const estado = compra.obtener();

        if (!estado.carrito.length) {
            contenedorResumen.innerHTML = `
                <p>
                    Tu carrito está vacío.
                    <a href="catalogo.html">Agrega productos antes de comprar.</a>
                </p>
            `;
            return;
        }

        const lineas = estado.carrito
            .map((linea) => {
                const producto = productos.find((item) => item.id === linea.id);
                return `<li>${escapar(producto.nombre)} × ${linea.cantidad}</li>`;
            })
            .join('');

        contenedorResumen.innerHTML = `
            <h2 class="h5">Resumen de la orden</h2>
            <ul>${lineas}</ul>
            ${htmlTotales(compra.resumen())}
        `;
    }

    // Habilita el pago únicamente si hay productos y todos los campos son válidos.
    function actualizarBoton() {
        const errores = validarCheckout(datosCheckout());
        botonPago.disabled = !compra.obtener().carrito.length || Object.keys(errores).length > 0;
    }

    // Actualiza el mensaje de un campo y señala si necesita una corrección.
    function mostrarError(campo, mensaje) {
        const input = document.getElementById(campo);
        const error = document.getElementById(`error-${campo}`);

        input.setAttribute('aria-invalid', String(Boolean(mensaje)));
        error.textContent = mensaje || '';
        error.hidden = !mensaje;
    }

    // Revisa el campo editado sin reconstruir el resumen de productos en cada pulsación.
    function validarCampo(evento) {
        const campo = evento.target.name;

        if (campos.includes(campo)) {
            mostrarError(campo, validarCheckout(datosCheckout())[campo]);
        }

        actualizarBoton();
    }

    // Conserva una copia de los productos y precios para que el historial no dependa del catálogo futuro.
    function crearOrden(datos) {
        const lineas = compra.obtener().carrito.map((linea) => {
            const producto = productos.find((item) => item.id === linea.id);

            return {
                id: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                cantidad: linea.cantidad
            };
        });

        return {
            id: `ORD-${crypto.randomUUID()}`,
            fecha: new Date().toISOString(),
            estado: 'Confirmada',
            pago: 'Aprobado (simulado)',
            despacho: 'Pendiente de preparación',
            metodoPago: datos.pago,
            direccion: [datos.direccion.trim(), datos.comuna.trim(), datos.region.trim()].join(
                ', '
            ),
            lineas,
            ...compra.resumen()
        };
    }

    // Guarda la orden y vacía el carrito juntos antes de abrir el historial de compras.
    formulario.addEventListener('submit', (evento) => {
        evento.preventDefault();
        const datos = datosCheckout();
        const errores = validarCheckout(datos);

        campos.forEach((campo) => mostrarError(campo, errores[campo]));

        if (!compra.obtener().carrito.length || Object.keys(errores).length) {
            actualizarBoton();
            return;
        }

        const orden = crearOrden(datos);
        const siguiente = {
            carrito: [],
            cupon: '',
            ordenes: [orden, ...compra.obtener().ordenes]
        };

        if (compra.guardar(siguiente)) {
            location.href = `ordenes.html?confirmada=${encodeURIComponent(orden.id)}`;
        }
    });

    formulario.addEventListener('input', validarCampo);
    formulario.addEventListener('change', validarCampo);

    // Actualiza la compra mostrada cuando otra pestaña modifica el carrito.
    function actualizarVista() {
        mostrarResumen();
        actualizarBoton();
    }

    actualizarVista();
    return actualizarVista;
}
