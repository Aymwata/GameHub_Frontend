// ==========================================
// BASE DE DATOS DE PRODUCTOS Y GLOBALES
// ==========================================

const baseDatosProductos = [
    { id: 1, nombre: "Monitor Gamer Samsung 27\", FHD, 180Hz, VA, 1ms, FreeSync, Odyssey G3 LS27DG300ELXZS", precio: 180000, imagen: "assets/images/monitorSamsung.jpg", stock: 15, categoria: "perifericos", marca: "samsung" },
    { id: 2, nombre: "Notebook Gamer LOQ Gen 10 Intel Core i7-13645HX NVIDIA GeForce RTX 5050 15.6\" 144Hz 16GB RAM 512GB Windows 11 Home", precio: 850000, imagen: "assets/images/notebookLenovo.jpg", stock: 5, categoria: "computadores", marca: "lenovo" },
    { id: 3, nombre: "Tarjeta de Video MSI Nvidia GeForce RTX 5060 8G VENTUS 2X OC WHITE", precio: 320000, imagen: "assets/images/tarjetaNvidia.jpg", stock: 0, categoria: "componentes", marca: "msi" },
    { id: 4, nombre: "Desktop Gamer Esgaming Ryzen 5 5500 32GB DDR4 RGB 500GB SSD RTX 5050", precio: 1200000, imagen: "assets/images/desktopEsgaming.jpg", stock: 2, categoria: "computadores", marca: "esgaming" },
    { id: 5, nombre: "Monitor Gamer Samsung Curvo 49” Odyssey G9 G91F QHD 144Hz", precio: 849990, imagen: "assets/images/monitorSamsungCurvo.jpg", stock: 10, categoria: "perifericos", marca: "samsung" }
];

// ==========================================
// 1. BUSCADOR (Todas las páginas)
// ==========================================
const formBusqueda = document.getElementById('form-busqueda');
if (formBusqueda) {
    const inputBusqueda = document.getElementById('input-busqueda');
    formBusqueda.addEventListener('submit', (e) => {
        e.preventDefault(); 
        const termino = inputBusqueda.value.trim();
        if (termino) {
            window.location.href = `catalogo.html?buscar=${encodeURIComponent(termino)}`;
        } else {
            window.location.href = `catalogo.html`;
        }
    });
}

// ==========================================
// 2. INDEX / INICIO
// ==========================================
const contenedorDestacados = document.getElementById('contenedor-destacados');
if (contenedorDestacados) {
    const productosDestacados = [
        { id: 1, nombre: "Monitor Gamer 24\" 144Hz IPS FHD", precio: 180000, imagen: "assets/images/monitorSamsung.jpg" },
        { id: 2, nombre: "Tarjeta de Video Nvidia RTX 5060", precio: 320000, imagen: "assets/images/tarjetaNvidia.jpg" }, 
        { id: 3, nombre: "Desktop Gamer Esgaming Ryzen 5 5500 32GB DDR4 RGB 500GB SSD RTX 5050", precio: 1200000, imagen: "assets/images/desktopEsgaming.jpg" },
        { id: 4, nombre: "Notebook Lenovo ThinkPad X1 Carbon", precio: 850000, imagen: "assets/images/notebookLenovo.jpg" }
    ];

    productosDestacados.forEach(producto => {
        const tarjetaHTML = `
            <div class="col-md-3 mb-4">
                <div class="card tarjeta-producto">
                    <img src="${producto.imagen}" class="card-img-top imagen-producto" alt="${producto.nombre}">
                    <div class="card-body">
                        <h5 class="card-title nombre-producto">${producto.nombre}</h5>
                        <p class="card-text precio-producto">$${producto.precio.toLocaleString('es-CL')}</p>
                        <a href="detalle.html?id=${producto.id}" class="btn btn-agregar">Agregar al carrito</a>
                    </div>
                </div>
            </div>
        `;  
        contenedorDestacados.innerHTML += tarjetaHTML;
    });
}

// ==========================================
// 3. CATÁLOGO
// ==========================================
const grillcatalogo = document.getElementById('grill-catalogo');
if (grillcatalogo) {
    const btnAplicarFiltros = document.getElementById('btn-aplicar-filtros');
    const selectOrdenar = document.getElementById('ordenar-productos');
    const parametrosURL = new URLSearchParams(window.location.search);
    const categoriaURL = parametrosURL.get('categoria');

    let productosMostrados = [...baseDatosProductos];

    if (categoriaURL) {
        productosMostrados = baseDatosProductos.filter(producto => producto.categoria === categoriaURL);
        const checkboxCategoria = document.querySelector('input[id^="cat-"][value="' + categoriaURL + '"]');
        if (checkboxCategoria) checkboxCategoria.checked = true;
    }

    function mostrarCatalogo(productos) {
        grillcatalogo.innerHTML = '';
        if (productos.length === 0) {
            grillcatalogo.innerHTML = '<p class="text-center">No se encontraron productos que coincidan con los filtros aplicados.</p>';
            return;
        }

        productos.forEach(producto => {
            const hayStock = producto.stock > 0;
            const textoStock = hayStock ? "Stock: " + producto.stock + " uds." : "Sin stock";
            const badge = hayStock ? "badge-stock-ok" : "badge-stock-out";
            const estadoBoton = hayStock ? '' : 'disabled';

            const tarjetaHTML = `
                <div class="col-12 col-md-4 col-lg-4 mb-4">
                    <div class="card tarjeta-producto position-relative">
                        <span class="badge ${badge} position-absolute top-0 end-0 m-2 px-2 py-1">${textoStock}</span>
                        <img src="${producto.imagen}" class="card-img-top imagen-producto" alt="${producto.nombre}">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title nombre-producto">${producto.nombre}</h5>
                            <p class="card-text precio-producto">$${producto.precio.toLocaleString('es-CL')}</p>
                            <a href="detalle.html?id=${producto.id}" class="btn btn-agregar mt-auto ${estadoBoton}">Agregar al carrito</a>
                        </div>
                    </div>
                </div>
            `;
            grillcatalogo.innerHTML += tarjetaHTML;
        });
    }

    function ordenarProductos(arreglo, criterio) {
        let arregloOrdenado = [...arreglo];
        if (criterio === 'precio-asc') arregloOrdenado.sort((a, b) => a.precio - b.precio);
        else if (criterio === 'precio-desc') arregloOrdenado.sort((a, b) => b.precio - a.precio);
        else if (criterio === 'nombre-asc') arregloOrdenado.sort((a, b) => a.nombre.localeCompare(b.nombre));
        else if (criterio === 'nombre-desc') arregloOrdenado.sort((a, b) => b.nombre.localeCompare(a.nombre));
        else arregloOrdenado.sort((a, b) => a.id - b.id);
        return arregloOrdenado;
    }

    if (btnAplicarFiltros) {
        btnAplicarFiltros.addEventListener('click', () => {
            const categoriaSeleccionada = Array.from(document.querySelectorAll('input[id^="cat-"]:checked')).map(cb => cb.value);
            const marcaSeleccionada = Array.from(document.querySelectorAll('input[id^="marca-"]:checked')).map(cb => cb.value);
            const precioMin = parseInt(document.getElementById('precio-min').value) || 0;
            const precioMax = parseInt(document.getElementById('precio-max').value) || Infinity;

            productosMostrados = baseDatosProductos.filter(producto => {
                const cumpleCategoria = categoriaSeleccionada.length === 0 || categoriaSeleccionada.includes(producto.categoria);
                const cumpleMarca = marcaSeleccionada.length === 0 || marcaSeleccionada.includes(producto.marca);
                const cumplePrecio = producto.precio >= precioMin && producto.precio <= precioMax;
                return cumpleCategoria && cumpleMarca && cumplePrecio;
            });

            const productosListos = ordenarProductos(productosMostrados, selectOrdenar.value);
            mostrarCatalogo(productosListos);
        });

        if (categoriaURL) btnAplicarFiltros.click();
        else mostrarCatalogo(productosMostrados);
    }

    if (selectOrdenar) {
        selectOrdenar.addEventListener('change', () => {
            const productosListos = ordenarProductos(productosMostrados, selectOrdenar.value);
            mostrarCatalogo(productosListos);
        });
    }
}

// ==========================================
// 4. DETALLE DE PRODUCTO (Reconstruido)
// ==========================================
const contenedorDetalle = document.getElementById('main-detalle');

if (contenedorDetalle) {
    // Definimos el producto solo si estamos en la página de detalle
    const productoInfo = {
        marca: "Lenovo",
        nombre: "Notebook Gamer LOQ Gen 10 Intel Core i7-13645HX NVIDIA GeForce RTX 5050 15.6\" 144Hz 16GB RAM 512GB Windows 11 Home",
        precioNormal: 1450000,
        precioOferta: 1229990,
        stock: 8,
        imagen: "assets/images/notebookLenovo.jpg",
        especificaciones: [
            { atributo: "Procesador", valor: "Intel Core i7-13645HX" },
            { atributo: "Memoria RAM", valor: "16GB DDR5" },
            { atributo: "Almacenamiento", valor: "512GB SSD M.2" },
            { atributo: "Tarjeta Grafica", valor: "NVIDIA GeForce RTX 5050" },
            { atributo: "Pantalla", valor: "15.6 Pulgadas FHD 144Hz" }
        ]
    };

    // Creamos las filas de especificaciones
    let filasSpecs = '';
    productoInfo.especificaciones.forEach(esp => {
        filasSpecs += `
            <tr>
                <td class="fw-bold bg-light" style="width: 35%; color: var(--color-texto);">${esp.atributo}</td>
                <td>${esp.valor}</td>
            </tr>
        `;
    });

    // Inyectamos el HTML al contenedor
    contenedorDetalle.innerHTML = `
        <div class="row g-5 mb-5">
            <div class="col-lg-6">
                <img src="${productoInfo.imagen}" alt="${productoInfo.nombre}" class="galeria-img">
            </div>
            <div class="col-lg-6 d-flex flex-column gap-3">
                <div>
                    <p class="marca-texto">${productoInfo.marca}</p>
                    <h2 class="fw-bold" style="color: var(--color-texto);">${productoInfo.nombre}</h2>
                </div>
                <div class="bloque-precios">
                    <p class="precio-normal">Precio Normal: $${productoInfo.precioNormal.toLocaleString('es-CL')}</p>
                    <p class="precio-oferta">Precio Oferta: $${productoInfo.precioOferta.toLocaleString('es-CL')}</p>
                </div>
                <p class="fw-bold mb-0" style="color: var(--color-acento);">Stock disponible por internet: ${productoInfo.stock} unidades</p>
                <div class="d-flex gap-3 mt-2">
                    <input type="number" id="input-cantidad" class="form-control text-center fs-5" value="1" min="1" max="${productoInfo.stock}" style="width: 100px; border-radius: var(--radio-borde);">
                    <button id="btn-agregar-carro" class="btn-comprar-detalle flex-grow-1">Agregar al Carrito</button>
                </div>
            </div>
        </div>
        <div class="card border-0 shadow-sm mt-4" style="border-radius: var(--radio-borde);">
            <div class="card-body p-4">
                <h4 class="fw-bold mb-4 pb-2" style="color: var(--color-primario); border-bottom: 2px solid var(--color-acento);">Detalles del Producto</h4>
                <div class="table-responsive">
                    <table class="table table-bordered mb-0">
                        <tbody>
                            ${filasSpecs}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    // Agregamos el evento al botón de comprar
    document.getElementById('btn-agregar-carro').addEventListener('click', () => {
        const cantidad = document.getElementById('input-cantidad').value;
        alert(`Se agregaron ${cantidad} unidad(es) de ${productoInfo.nombre} al carrito con exito.`);
        window.location.href = "carrito.html";
    });
}

// ==========================================
// 5. CARRITO DE COMPRAS (Reconstruido)
// ==========================================

// Variables globales para el carrito
const productosCarrito = [
    { id: 1, nombre: "Lenovo ThinkPad X1 Carbon", precio: 850000, cantidad: 1, imagen: "assets/images/notebookLenovo.jpg" },
];
let descuentoAplicado = 0;

// Funciones globales (Para que onclick en HTML las reconozca)
function renderizarCarrito() {
    const contenedorCarrito = document.getElementById('contenedor-carrito');
    
    // Si la página no tiene el contenedor del carrito, detenemos la función aquí mismo
    if (!contenedorCarrito) return; 

    // Si el carrito está vacío
    if (productosCarrito.length === 0) {
        contenedorCarrito.innerHTML = `
            <div class="col-12 text-center py-5 bg-white border rounded shadow-sm">
                <p class="fs-4 text-muted mb-3">Tu carrito esta vacio.</p>
                <a href="index.html" class="btn-carrito-accion px-4 py-2 text-decoration-none d-inline-block">Volver al inicio</a>
            </div>
        `;
        return;
    }

    // Si hay productos
    let filas = '';
    let subtotalGeneral = 0;

    productosCarrito.forEach((prod, index) => {
        const subtotalLinea = prod.precio * prod.cantidad;
        subtotalGeneral += subtotalLinea;

        filas += `
            <tr>
                <td class="align-middle">
                    <div class="d-flex align-items-center gap-3">
                        <img src="${prod.imagen}" alt="${prod.nombre}" style="width: 60px; height: 60px; object-fit: cover;" class="rounded border">
                        <span class="fw-medium">${prod.nombre}</span>
                    </div>
                </td>
                <td class="align-middle text-nowrap">$${prod.precio.toLocaleString('es-CL')}</td>
                <td class="align-middle">
                    <input type="number" class="form-control text-center" value="${prod.cantidad}" min="1" onchange="actualizarCantidad(${index}, this.value)" style="width: 80px;">
                </td>
                <td class="align-middle fw-bold text-nowrap">$${subtotalLinea.toLocaleString('es-CL')}</td>
                <td class="align-middle text-center">
                    <button class="btn-carrito-quitar px-3 py-1" onclick="eliminarProducto(${index})">Quitar</button>
                </td>
            </tr>
        `;
    });

    const descuento = subtotalGeneral * descuentoAplicado;
    const total = subtotalGeneral - descuento;

    contenedorCarrito.innerHTML = `
        <div class="col-lg-8 mb-4">
            <div class="card shadow-sm border-0">
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover mb-0">
                            <thead class="table-light">
                                <tr>
                                    <th>Producto</th>
                                    <th>Precio</th>
                                    <th>Cantidad</th>
                                    <th>Subtotal</th>
                                    <th class="text-center">Accion</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${filas}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="card-footer bg-white p-3 d-flex justify-content-start">
                    <button class="btn-carrito-vaciar px-4 py-2" onclick="vaciarCarrito()">Vaciar carrito completo</button>
                </div>
            </div>
        </div>

        <div class="col-lg-4">
            <div class="card shadow-sm border-0">
                <div class="card-body p-4">
                    <h5 class="card-title fw-bold border-bottom pb-3 mb-4">Resumen de Compra</h5>
                    
                    <div class="mb-4">
                        <label class="form-label text-muted small">Ingresar cupon (Prueba: GAME20)</label>
                        <div class="input-group">
                            <input type="text" id="input-cupon" class="form-control" placeholder="Codigo">
                            <button class="btn-carrito-accion px-3" onclick="aplicarCupon()">Aplicar</button>
                        </div>
                        <div id="mensaje-cupon" class="form-text mt-1"></div>
                    </div>

                    <div class="d-flex justify-content-between mb-2">
                        <span class="text-muted">Subtotal</span>
                        <span>$${subtotalGeneral.toLocaleString('es-CL')}</span>
                    </div>
                    <div class="d-flex justify-content-between mb-3 text-success">
                        <span>Descuento</span>
                        <span>-$${descuento.toLocaleString('es-CL')}</span>
                    </div>
                    <div class="d-flex justify-content-between border-top pt-3 mb-4">
                        <span class="fw-bold fs-5">Total Final</span>
                        <span class="fw-bold fs-4 text-success">$${total.toLocaleString('es-CL')}</span>
                    </div>

                    <button onclick="window.location.href='checkout.html'" class="btn-carrito-pago w-100 py-3 fw-bold fs-5">Proceder al Pago</button>
                </div>
            </div>
        </div>
    `;
}

function actualizarCantidad(index, nuevaCantidad) {
    const cantidad = parseInt(nuevaCantidad);
    if (cantidad > 0) {
        productosCarrito[index].cantidad = cantidad;
        renderizarCarrito();
    }
}

function eliminarProducto(index) {
    productosCarrito.splice(index, 1);
    renderizarCarrito();
}

function vaciarCarrito() {
    productosCarrito.length = 0;
    descuentoAplicado = 0;
    renderizarCarrito();
}

function aplicarCupon() {
    const inputElement = document.getElementById('input-cupon');
    if (!inputElement) return;

    const cupon = inputElement.value.trim().toUpperCase();
    const mensaje = document.getElementById('mensaje-cupon');
    
    if (cupon === 'GAME20') {
        descuentoAplicado = 0.20;
        mensaje.textContent = 'Cupon de 20% aplicado con exito';
        mensaje.className = 'form-text text-success mt-1';
    } else {
        descuentoAplicado = 0;
        mensaje.textContent = 'Cupon invalido o expirado';
        mensaje.className = 'form-text text-danger mt-1';
    }
    renderizarCarrito();
}

// Llamamos la función al final. Gracias al "if (!contenedorCarrito) return" interno, no dará error.
renderizarCarrito();

// ==========================================
// 6. CHECKOUT
// ==========================================
const formCheckout = document.getElementById('form-checkout');
if (formCheckout) {
    formCheckout.addEventListener('submit', (e) => {
        e.preventDefault(); 
        let hayErrores = false;

        const validarCampo = (idInput, idError, condicionError) => {
            const input = document.getElementById(idInput);
            const error = document.getElementById(idError);
            if (condicionError) {
                error.style.display = 'block';
                input.style.borderColor = 'var(--color-error)';
                hayErrores = true;
            } else {
                error.style.display = 'none';
                input.style.borderColor = '#ccc'; 
            }
        };

        ['nombre', 'region', 'comuna'].forEach(campo => {
            validarCampo(campo, `error-${campo}`, document.getElementById(campo).value.trim() === '');
        });

        const valorCorreo = document.getElementById('correo').value.trim();
        validarCampo('correo', 'error-correo', !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valorCorreo));

        const valorTelefono = document.getElementById('telefono').value.trim();
        validarCampo('telefono', 'error-telefono', !/^[0-9]{9}$/.test(valorTelefono));

        if (!hayErrores) {
            const numeroOrden = Math.floor(Math.random() * 10000);
            alert(`¡Compra realizada con éxito! Tu número de orden es: ORD-${numeroOrden}`);
            formCheckout.reset();
            window.location.href = 'ordenes.html'; 
        }
    });
}

// ==========================================
// 7. MIS ÓRDENES
// ==========================================
const grillaOrdenes = document.getElementById('grilla-ordenes');
if (grillaOrdenes) {
    const misOrdenes = [
        { id: 'ORD-8452', fecha: '2026-9-10', estado: 'Entregado', total: 1250000 },
        { id: 'ORD-9102', fecha: '2026-9-28', estado: 'En ruta', total: 45000 }
    ];

    misOrdenes.forEach(orden => {
        const tarjetaHTML = `
            <div class="tarjeta-orden">
                <h3>${orden.id}</h3>
                <p><strong>Fecha:</strong> ${orden.fecha}</p>
                <p><strong>Estado:</strong> <span style="color: var(--color-acento); font-weight: bold;">${orden.estado}</span></p>
                <p><strong>Total:</strong> $${orden.total.toLocaleString('es-CL')}</p>
                <div class="acciones-orden">
                    <button class="btn-secundario" onclick="alert('Mostrando detalle de ${orden.id}')">Detalle</button>
                    <button class="btn-secundario" onclick="alert('Escribiendo reseña para ${orden.id}')">Reseñar</button>
                    <button class="btn-secundario" onclick="alert('Garantía para ${orden.id}')">Garantía</button>
                </div>
            </div>
        `;
        grillaOrdenes.innerHTML += tarjetaHTML;
    });
}