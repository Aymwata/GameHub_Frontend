import { productos, categorias } from '../datos.js';
import { tarjetaProducto } from '../componentes.js';
import { escapar } from '../utilidades.js';

// Muestra los productos destacados y las categorías de la página de inicio.
export function iniciarInicio() {
    const destacados = productos.filter((producto) => producto.stock > 0).slice(0, 4);

    document.getElementById('contenedor-destacados').innerHTML = destacados
        .map((producto) => tarjetaProducto(producto, 'col-12 col-sm-6 col-lg-3'))
        .join('');

    document.getElementById('contenedor-categorias').innerHTML = categorias
        .map(
            (categoria) => `
        <div class="col-12 col-md-4 mb-3">
            <a href="catalogo.html?categoria=${categoria.id}" class="card tarjeta-categoria">
                <div class="card-body">
                    <h3 class="fw-bold mb-2">${escapar(categoria.nombre)}</h3>
                    <p class="text-muted mb-0">${escapar(categoria.descripcion)}</p>
                </div>
            </a>
        </div>
    `
        )
        .join('');
}
