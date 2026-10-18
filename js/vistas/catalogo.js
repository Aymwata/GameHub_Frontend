import { productos, categorias, marcas } from '../datos.js';
import { ordenarProductos } from '../tienda.js';
import { tarjetaProducto } from '../componentes.js';
import { escapar } from '../utilidades.js';

// Genera una opción de filtro con su etiqueta y su identificador asociado.
function opcionFiltro(id, valor, nombre) {
    return `
        <div class="form-check">
            <input class="form-check-input" type="checkbox" value="${valor}" id="${id}">
            <label class="form-check-label" for="${id}">${escapar(nombre)}</label>
        </div>
    `;
}

// Prepara los filtros, el ordenamiento y la paginación de los productos.
export function iniciarCatalogo({ parametros }) {
    const catalogo = document.getElementById('grilla-catalogo');
    const ordenar = document.getElementById('ordenar-productos');
    const errorFiltros = document.getElementById('error-filtros');
    const navegacion = document.getElementById('paginacion-catalogo');
    const minimo = document.getElementById('precio-min');
    const maximo = document.getElementById('precio-max');
    const buscar = (parametros.get('buscar') || '').trim().toLocaleLowerCase('es');
    const porPagina = 3;
    let filtrados = [];
    let pagina = 1;

    document.getElementById('filtros-categorias').innerHTML = categorias
        .map((categoria) => opcionFiltro(categoria.filtroId, categoria.id, categoria.nombre))
        .join('');
    document.getElementById('filtros-marcas').innerHTML = marcas
        .map((marca) => opcionFiltro(`marca-${marca.id}`, marca.id, marca.nombre))
        .join('');

    document.querySelectorAll('input[id^="cat-"]').forEach((campo) => {
        campo.checked = campo.value === parametros.get('categoria');
    });

    // Muestra los productos de la página actual y los botones de navegación necesarios.
    function mostrarPagina() {
        const ordenados = ordenarProductos(filtrados, ordenar.value);
        const paginas = Math.ceil(ordenados.length / porPagina);
        const inicio = (pagina - 1) * porPagina;
        const visibles = ordenados.slice(inicio, inicio + porPagina);

        catalogo.innerHTML = visibles.length
            ? visibles
                  .map((producto) => tarjetaProducto(producto, 'col-12 col-md-6 col-xl-4', 2))
                  .join('')
            : '<p class="text-center">No se encontraron productos que coincidan con la búsqueda y los filtros.</p>';
        document.getElementById('resultado-catalogo').textContent =
            `${filtrados.length} producto(s) encontrado(s).`;

        navegacion.innerHTML =
            paginas > 1
                ? Array.from(
                      { length: paginas },
                      (_, indice) => `
                <li class="page-item ${pagina === indice + 1 ? 'active' : ''}">
                    <button
                        type="button"
                        class="page-link"
                        data-pagina="${indice + 1}"
                        ${pagina === indice + 1 ? 'aria-current="page"' : ''}
                    >
                        ${indice + 1}
                    </button>
                </li>
            `
                  ).join('')
                : '';
    }

    // Valida el rango de precios y combina todos los criterios de búsqueda seleccionados.
    function aplicarFiltros() {
        const min = minimo.value === '' ? 0 : Number(minimo.value);
        const max = maximo.value === '' ? Infinity : Number(maximo.value);
        const invalido =
            !minimo.validity.valid ||
            !maximo.validity.valid ||
            !Number.isFinite(min) ||
            min < 0 ||
            max < 0 ||
            min > max;

        errorFiltros.textContent = invalido
            ? 'Ingresa precios enteros no negativos; el mínimo no puede superar al máximo.'
            : '';
        minimo.setAttribute('aria-invalid', String(invalido));
        maximo.setAttribute('aria-invalid', String(invalido));

        if (invalido) return;

        const categoriasElegidas = Array.from(
            document.querySelectorAll('input[id^="cat-"]:checked'),
            (campo) => campo.value
        );
        const marcasElegidas = Array.from(
            document.querySelectorAll('input[id^="marca-"]:checked'),
            (campo) => campo.value
        );

        filtrados = productos.filter((producto) => {
            const coincideBusqueda =
                !buscar || producto.nombre.toLocaleLowerCase('es').includes(buscar);
            const coincideCategoria =
                !categoriasElegidas.length || categoriasElegidas.includes(producto.categoria);
            const coincideMarca = !marcasElegidas.length || marcasElegidas.includes(producto.marca);
            const coincidePrecio = producto.precio >= min && producto.precio <= max;

            return coincideBusqueda && coincideCategoria && coincideMarca && coincidePrecio;
        });
        pagina = 1;
        mostrarPagina();
    }

    // Aplica los filtros cuando se pulsa su botón.
    document.getElementById('btn-aplicar-filtros').addEventListener('click', aplicarFiltros);

    // Reinicia la paginación al elegir un criterio de orden diferente.
    ordenar.addEventListener('change', () => {
        pagina = 1;
        mostrarPagina();
    });

    // Abre la página de resultados correspondiente al botón pulsado.
    navegacion.addEventListener('click', (evento) => {
        const boton = evento.target.closest('[data-pagina]');
        if (!boton) return;

        pagina = Number(boton.dataset.pagina);
        mostrarPagina();
    });

    aplicarFiltros();
}
