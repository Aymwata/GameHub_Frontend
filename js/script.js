// Adaptador de interfaz. Los datos y las reglas están separados para migrar a React.
(() => {
    'use strict';
    const { productos, especificaciones, cupones } = GameHubDatos;
    const tienda = GameHubTienda;
    const CLAVE_ESTADO = 'gamehub-store-v1';
    const formatoMoneda = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
    const moneda = valor => formatoMoneda.format(valor);
    const escapar = valor => String(valor).replace(/[&<>"']/g, caracter => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[caracter]);
    let problemaAlmacenamiento = '';

    function cargarEstado() {
        try {
            const guardado = JSON.parse(localStorage.getItem(CLAVE_ESTADO) || '{}');
            if (!guardado || typeof guardado !== 'object') throw new Error('Estado inválido');
            return {
                carrito: tienda.normalizarCarrito(guardado.carrito, productos),
                cupon: typeof guardado.cupon === 'string' ? guardado.cupon : '',
                ordenes: Array.isArray(guardado.ordenes) ? guardado.ordenes.filter(orden => orden && typeof orden.id === 'string' && typeof orden.fecha === 'string' && Array.isArray(orden.lineas) && orden.lineas.every(linea => linea && typeof linea.nombre === 'string' && Number.isFinite(linea.precio) && Number.isInteger(linea.cantidad) && linea.cantidad > 0) && Number.isFinite(orden.total)) : []
            };
        } catch {
            problemaAlmacenamiento = 'No se pudieron leer los datos guardados. Puedes navegar, pero comprueba el almacenamiento del navegador antes de comprar.';
            return { carrito: [], cupon: '', ordenes: [] };
        }
    }

    let estado = cargarEstado();
    const aviso = document.createElement('p');
    aviso.className = 'aviso-global container';
    aviso.setAttribute('role', 'status');
    aviso.setAttribute('aria-live', 'polite');
    aviso.hidden = true;
    document.querySelector('header').after(aviso);

    function informar(texto, error = false) {
        aviso.textContent = texto;
        aviso.classList.toggle('text-danger', error);
        aviso.hidden = !texto;
    }

    function guardarEstado(siguiente) {
        try {
            // Una sola escritura guarda la orden y vacía el carrito de forma conjunta.
            localStorage.setItem(CLAVE_ESTADO, JSON.stringify(siguiente));
            estado = siguiente;
            actualizarContador();
            return true;
        } catch {
            informar('No se pudo guardar el cambio. Revisa el espacio o los permisos de almacenamiento del navegador y vuelve a intentarlo.', true);
            return false;
        }
    }

    function actualizarContador() {
        document.querySelectorAll('.btn-carrito').forEach(enlace => {
            enlace.textContent = `Carrito (${estado.carrito.reduce((total, linea) => total + linea.cantidad, 0)})`;
        });
    }

    function resumenCompra() {
        const subtotal = tienda.calcularSubtotal(estado.carrito, productos);
        const cupon = cupones.find(item => item.codigo === estado.cupon);
        const descuento = tienda.aplicarCupon(subtotal, cupon);
        return { subtotal, descuento, total: tienda.calcularTotal(subtotal, descuento) };
    }

    function htmlTotales() {
        const { subtotal, descuento, total } = resumenCompra();
        return `<dl class="totales"><div><dt>Subtotal</dt><dd>${moneda(subtotal)}</dd></div><div><dt>Descuento</dt><dd>−${moneda(descuento)}</dd></div><div class="total-final"><dt>Total</dt><dd>${moneda(total)}</dd></div></dl>`;
    }

    function tarjetaProducto(producto, columnas) {
        return `<article class="${columnas} mb-4"><div class="card tarjeta-producto position-relative">
            <span class="badge ${producto.stock ? 'badge-stock-ok' : 'badge-stock-out'} position-absolute top-0 end-0 m-2">${producto.stock ? `Stock: ${producto.stock} uds.` : 'Sin stock'}</span>
            <img src="${producto.imagen}" class="card-img-top imagen-producto" alt="${escapar(producto.nombre)}" loading="lazy">
            <div class="card-body d-flex flex-column"><h3 class="card-title nombre-producto">${escapar(producto.nombre)}</h3>
            <p class="card-text precio-producto">${moneda(producto.precio)}</p>
            <a href="detalle.html?id=${producto.id}" class="btn btn-agregar mt-auto">Ver detalle</a></div></div></article>`;
    }

    const formBusqueda = document.getElementById('form-busqueda');
    const parametros = new URLSearchParams(location.search);
    document.getElementById('input-busqueda').value = parametros.get('buscar') || '';
    formBusqueda.addEventListener('submit', evento => {
        evento.preventDefault();
        const busqueda = document.getElementById('input-busqueda').value.trim();
        location.href = busqueda ? `catalogo.html?buscar=${encodeURIComponent(busqueda)}` : 'catalogo.html';
    });

    const destacados = document.getElementById('contenedor-destacados');
    if (destacados) destacados.innerHTML = productos.filter(producto => producto.stock > 0).slice(0, 4).map(producto => tarjetaProducto(producto, 'col-12 col-sm-6 col-lg-3')).join('');

    const catalogo = document.getElementById('grill-catalogo');
    if (catalogo) {
        const ordenar = document.getElementById('ordenar-productos');
        const errorFiltros = document.getElementById('error-filtros');
        const navegacion = document.getElementById('paginacion-catalogo');
        const buscar = (parametros.get('buscar') || '').trim().toLocaleLowerCase('es');
        let filtrados = [];
        let pagina = 1;
        const porPagina = 3;
        document.querySelectorAll('input[id^="cat-"]').forEach(campo => { campo.checked = campo.value === parametros.get('categoria'); });

        function mostrarPagina() {
            const ordenados = tienda.ordenarProductos(filtrados, ordenar.value);
            const paginas = Math.ceil(ordenados.length / porPagina);
            catalogo.innerHTML = ordenados.slice((pagina - 1) * porPagina, pagina * porPagina).map(producto => tarjetaProducto(producto, 'col-12 col-md-6 col-xl-4')).join('') || '<p class="text-center">No se encontraron productos que coincidan con la búsqueda y los filtros.</p>';
            document.getElementById('resultado-catalogo').textContent = `${filtrados.length} producto(s) encontrado(s).`;
            navegacion.innerHTML = paginas > 1 ? Array.from({ length: paginas }, (_, indice) => `<li class="page-item ${pagina === indice + 1 ? 'active' : ''}"><button type="button" class="page-link" data-pagina="${indice + 1}" ${pagina === indice + 1 ? 'aria-current="page"' : ''}>${indice + 1}</button></li>`).join('') : '';
        }

        function aplicarFiltros() {
            const minimo = document.getElementById('precio-min');
            const maximo = document.getElementById('precio-max');
            const min = minimo.value === '' ? 0 : Number(minimo.value);
            const max = maximo.value === '' ? Infinity : Number(maximo.value);
            const invalido = !minimo.validity.valid || !maximo.validity.valid || !Number.isFinite(min) || min < 0 || max < 0 || min > max;
            errorFiltros.textContent = invalido ? 'Ingresa precios enteros no negativos; el mínimo no puede superar al máximo.' : '';
            minimo.setAttribute('aria-invalid', String(invalido));
            maximo.setAttribute('aria-invalid', String(invalido));
            if (invalido) return;
            const categorias = Array.from(document.querySelectorAll('input[id^="cat-"]:checked'), campo => campo.value);
            const marcas = Array.from(document.querySelectorAll('input[id^="marca-"]:checked'), campo => campo.value);
            filtrados = productos.filter(producto => (!buscar || producto.nombre.toLocaleLowerCase('es').includes(buscar)) && (!categorias.length || categorias.includes(producto.categoria)) && (!marcas.length || marcas.includes(producto.marca)) && producto.precio >= min && producto.precio <= max);
            pagina = 1;
            mostrarPagina();
        }
        document.getElementById('btn-aplicar-filtros').addEventListener('click', aplicarFiltros);
        ordenar.addEventListener('change', () => { pagina = 1; mostrarPagina(); });
        navegacion.addEventListener('click', evento => {
            const boton = evento.target.closest('[data-pagina]');
            if (boton) { pagina = Number(boton.dataset.pagina); mostrarPagina(); }
        });
        aplicarFiltros();
    }

    const detalle = document.getElementById('main-detalle');
    if (detalle) {
        const producto = productos.find(item => item.id === Number(parametros.get('id')));
        if (!producto) detalle.innerHTML = '<h1 class="titulo-seccion">Producto no encontrado</h1><p>El producto solicitado no existe.</p><a href="catalogo.html">Volver al catálogo</a>';
        else {
            detalle.innerHTML = `<div class="row g-4 mb-5"><div class="col-lg-6"><img src="${producto.imagen}" alt="${escapar(producto.nombre)}" class="galeria-img"></div>
                <div class="col-lg-6 d-flex flex-column gap-3"><p class="marca-texto">${escapar(producto.marca)}</p><h1 class="h2 fw-bold">${escapar(producto.nombre)}</h1>
                <div class="bloque-precios"><p class="precio-oferta">${moneda(producto.precio)}</p></div><p class="fw-bold">${producto.stock ? `Stock disponible: ${producto.stock} unidades` : 'Sin stock'}</p>
                <form id="form-agregar" novalidate><label for="input-cantidad" class="form-label">Cantidad</label><div class="d-flex gap-3 flex-wrap"><input type="number" id="input-cantidad" class="form-control cantidad-detalle" value="1" min="1" max="${producto.stock}" step="1" aria-describedby="error-cantidad" ${producto.stock ? '' : 'disabled'}>
                <button id="btn-agregar-carro" type="submit" class="btn-comprar-detalle flex-grow-1" ${producto.stock ? '' : 'disabled'}>Agregar al carrito</button></div><p id="error-cantidad" class="text-danger mt-2" role="alert"></p></form></div></div>
                <section class="card border-0 shadow-sm"><div class="card-body"><h2 class="h4 titulo-seccion">Detalles del producto</h2><div class="table-responsive"><table class="table table-bordered mb-0"><tbody>${Object.entries(especificaciones[producto.id]).map(([atributo, valor]) => `<tr><th scope="row">${escapar(atributo)}</th><td>${escapar(valor)}</td></tr>`).join('')}</tbody></table></div></div></section>`;
            document.getElementById('form-agregar').addEventListener('submit', evento => {
                evento.preventDefault();
                const campo = document.getElementById('input-cantidad');
                try {
                    const carrito = tienda.agregarAlCarrito(estado.carrito, producto, Number(campo.value));
                    if (guardarEstado({ ...estado, carrito })) location.href = 'carrito.html';
                } catch (error) {
                    campo.setAttribute('aria-invalid', 'true');
                    document.getElementById('error-cantidad').textContent = error.message;
                }
            });
        }
    }

    const carrito = document.getElementById('contenedor-carrito');
    let mensajeCupon = '';
    function renderizarCarrito() {
        if (!carrito) return;
        if (!estado.carrito.length) {
            carrito.innerHTML = '<div class="col-12 text-center py-5 bg-white border rounded"><p class="fs-4">Tu carrito está vacío.</p><a href="catalogo.html" class="btn btn-agregar">Explorar catálogo</a></div>';
            return;
        }
        carrito.innerHTML = `<div class="col-lg-8 mb-4"><div class="card shadow-sm"><div class="table-responsive"><table class="table align-middle mb-0"><caption class="visually-hidden">Productos del carrito</caption><thead><tr><th scope="col">Producto</th><th scope="col">Precio</th><th scope="col">Cantidad</th><th scope="col">Subtotal</th><th scope="col">Acción</th></tr></thead><tbody>${estado.carrito.map(linea => {
            const producto = productos.find(item => item.id === linea.id);
            return `<tr><td><div class="d-flex align-items-center gap-2"><img class="miniatura-carrito" src="${producto.imagen}" alt="${escapar(producto.nombre)}"><a href="detalle.html?id=${producto.id}">${escapar(producto.nombre)}</a></div></td><td class="text-nowrap">${moneda(producto.precio)}</td><td><input type="number" class="form-control cantidad-carrito" min="1" max="${producto.stock}" step="1" value="${linea.cantidad}" data-cantidad="${producto.id}" aria-label="Cantidad de ${escapar(producto.nombre)}"></td><td class="text-nowrap">${moneda(producto.precio * linea.cantidad)}</td><td><button class="btn-carrito-quitar" type="button" data-quitar="${producto.id}">Quitar</button></td></tr>`;
        }).join('')}</tbody></table></div><div class="card-footer"><button type="button" class="btn-carrito-vaciar p-2" data-vaciar>Vaciar carrito</button></div></div></div>
        <div class="col-lg-4"><section class="card shadow-sm"><div class="card-body"><h2 class="h5">Resumen de compra</h2><form id="form-cupon" class="my-3"><label for="input-cupon" class="form-label">Cupón (prueba GAME20)</label><div class="input-group"><input id="input-cupon" class="form-control" value="${escapar(estado.cupon)}" aria-describedby="mensaje-cupon"><button type="submit" class="btn-carrito-accion px-3">Aplicar</button></div><p id="mensaje-cupon" class="form-text" role="status">${escapar(mensajeCupon || (estado.cupon ? (tienda.cuponVigente(cupones.find(item => item.codigo === estado.cupon)) ? 'Cupón aplicado. Descuento sujeto a su tope.' : 'El cupón ya no está vigente y no aplica descuento.') : '20 % de descuento, máximo $100.000. Vigente durante 2026.'))}</p></form>${htmlTotales()}<a href="checkout.html" class="btn-carrito-pago d-block text-center text-decoration-none p-3">Proceder al pago</a></div></section></div>`;
    }
    if (carrito) {
        carrito.addEventListener('change', evento => {
            if (!evento.target.matches('[data-cantidad]')) return;
            const id = Number(evento.target.dataset.cantidad);
            const producto = productos.find(item => item.id === id);
            const cantidad = Number(evento.target.value);
            if (!tienda.validarStock(cantidad, producto.stock)) informar(`Ingresa una cantidad entera entre 1 y ${producto.stock}.`, true);
            else guardarEstado({ ...estado, carrito: estado.carrito.map(linea => linea.id === id ? { ...linea, cantidad } : linea) });
            renderizarCarrito();
        });
        carrito.addEventListener('click', evento => {
            const quitar = evento.target.closest('[data-quitar]');
            const vaciar = evento.target.closest('[data-vaciar]');
            if (!quitar && !vaciar) return;
            const lineas = vaciar ? [] : estado.carrito.filter(linea => linea.id !== Number(quitar.dataset.quitar));
            if (guardarEstado({ ...estado, carrito: lineas, cupon: lineas.length ? estado.cupon : '' })) { mensajeCupon = ''; renderizarCarrito(); }
        });
        carrito.addEventListener('submit', evento => {
            if (evento.target.id !== 'form-cupon') return;
            evento.preventDefault();
            const codigo = document.getElementById('input-cupon').value.trim().toUpperCase();
            const cupon = cupones.find(item => item.codigo === codigo);
            const valido = tienda.cuponVigente(cupon);
            if (guardarEstado({ ...estado, cupon: valido ? codigo : '' })) {
                mensajeCupon = valido ? 'Cupón de 20 % aplicado. Descuento máximo: $100.000.' : 'Cupón inválido o vencido.';
                renderizarCarrito();
            }
        });
        renderizarCarrito();
    }

    const formulario = document.getElementById('form-checkout');
    function datosCheckout() { return Object.fromEntries(new FormData(formulario)); }
    function actualizarCheckout() {
        if (!formulario) return;
        document.getElementById('resumen-checkout').innerHTML = estado.carrito.length ? `<h2 class="h5">Resumen de la orden</h2><ul>${estado.carrito.map(linea => `<li>${escapar(productos.find(producto => producto.id === linea.id).nombre)} × ${linea.cantidad}</li>`).join('')}</ul>${htmlTotales()}` : '<p>Tu carrito está vacío. <a href="catalogo.html">Agrega productos antes de comprar.</a></p>';
        formulario.querySelector('[type="submit"]').disabled = !estado.carrito.length || Object.keys(tienda.validarCheckout(datosCheckout())).length > 0;
    }
    if (formulario) {
        function mostrarError(campo, mensaje) {
            const input = document.getElementById(campo);
            const error = document.getElementById(`error-${campo}`);
            input.setAttribute('aria-invalid', String(Boolean(mensaje)));
            error.textContent = mensaje || '';
            error.hidden = !mensaje;
        }
        formulario.addEventListener('input', evento => {
            const campo = evento.target.name;
            if (campo && document.getElementById(`error-${campo}`)) mostrarError(campo, tienda.validarCheckout(datosCheckout())[campo]);
            actualizarCheckout();
        });
        formulario.addEventListener('change', actualizarCheckout);
        formulario.addEventListener('submit', evento => {
            evento.preventDefault();
            const datos = datosCheckout();
            const errores = tienda.validarCheckout(datos);
            for (const campo of ['nombre', 'correo', 'telefono', 'region', 'comuna', 'direccion', 'pago']) mostrarError(campo, errores[campo]);
            if (!estado.carrito.length || Object.keys(errores).length) { actualizarCheckout(); return; }
            const orden = {
                id: `ORD-${crypto.randomUUID()}`,
                fecha: new Date().toISOString(),
                estado: 'Confirmada', pago: 'Aprobado (simulado)', despacho: 'Pendiente de preparación',
                metodoPago: datos.pago,
                direccion: [datos.direccion.trim(), datos.comuna.trim(), datos.region.trim()].join(', '),
                lineas: estado.carrito.map(linea => { const producto = productos.find(item => item.id === linea.id); return { id: producto.id, nombre: producto.nombre, precio: producto.precio, cantidad: linea.cantidad }; }),
                ...resumenCompra()
            };
            if (guardarEstado({ carrito: [], cupon: '', ordenes: [orden, ...estado.ordenes] })) location.href = `ordenes.html?confirmada=${encodeURIComponent(orden.id)}`;
        });
        actualizarCheckout();
    }

    const ordenes = document.getElementById('grilla-ordenes');
    function renderizarOrdenes() {
        if (!ordenes) return;
        const lista = [...estado.ordenes].sort((a, b) => b.fecha.localeCompare(a.fecha));
        ordenes.innerHTML = lista.map(orden => `<article class="tarjeta-orden"><h2 class="h5 identificador-orden">${escapar(orden.id)}</h2><p><strong>Fecha:</strong> ${escapar(new Date(orden.fecha).toLocaleDateString('es-CL'))}</p><p><strong>Estado:</strong> ${escapar(orden.estado)}</p><p><strong>Total:</strong> ${moneda(orden.total)}</p><details><summary>Ver detalle</summary><ul>${orden.lineas.map(linea => `<li>${escapar(linea.nombre)} × ${linea.cantidad}: ${moneda(linea.precio * linea.cantidad)}</li>`).join('')}</ul><p><strong>Pago:</strong> ${escapar(orden.pago)}</p><p><strong>Despacho:</strong> ${escapar(orden.despacho)}</p><p><strong>Dirección:</strong> ${escapar(orden.direccion)}</p></details></article>`).join('') || '<p>Aún no tienes órdenes guardadas en este navegador. <a href="catalogo.html">Explorar catálogo</a>.</p>';
        const confirmada = parametros.get('confirmada');
        if (confirmada && lista.some(orden => orden.id === confirmada)) informar(`Compra simulada confirmada. Tu número de orden es ${confirmada}.`);
    }
    renderizarOrdenes();
    actualizarContador();
    if (problemaAlmacenamiento) informar(problemaAlmacenamiento, true);
    window.addEventListener('storage', evento => {
        if (evento.key !== CLAVE_ESTADO && evento.key !== null) return;
        estado = cargarEstado();
        actualizarContador();
        renderizarCarrito();
        actualizarCheckout();
        renderizarOrdenes();
    });
})();
