// ==========================================
// BASE DE DATOS DE PRODUCTOS
// ==========================================

const baseDatosProductos = [
        { 
            id: 1,
            nombre: "Monitor Gamer Samsung 27\", FHD, 180Hz, VA, 1ms, FreeSync, Odyssey G3 LS27DG300ELXZS", 
            precio: 180000, 
            imagen: "assets/images/monitorSamsung.jpg", 
            stock: 15, 
            categoria: "perifericos", 
            marca: "samsung"
        },
        {   
            id: 2, 
            nombre: "Notebook Gamer LOQ Gen 10 Intel Core i7-13645HX NVIDIA GeForce RTX 5050 15.6\" 144Hz 16GB RAM 512GB Windows 11 Home Luna Grey 83JE0184CL", 
            precio: 850000, 
            imagen: "assets/images/notebookLenovo.jpg", 
            stock: 5, 
            categoria: "computadores", 
            marca: "lenovo" 
        },
        {   
            id: 3, 
            nombre: "Tarjeta de Video MSI Nvidia GeForce RTX 5060 8G VENTUS 2X OC WHITE", 
            precio: 320000, imagen: "assets/images/tarjetaNvidia.jpg", 
            stock: 0, 
            categoria: "componentes", 
            marca: "msi" 
        },
        {   
            id: 4, 
            nombre: "Desktop Gamer Esgaming Ryzen 5 5500 32GB DDR4 RGB 500GB SSD RTX 5050", 
            precio: 1200000, 
            imagen: "assets/images/desktopEsgaming.jpg", 
            stock: 2, 
            categoria: "computadores", 
            marca: "esgaming" 
        },
        {   
            id: 5, 
            nombre: "Monitor Gamer Samsung Curvo 49” Odyssey G9 G91F QHD 144Hz", 
            precio: 849990, 
            imagen: "assets/images/monitorSamsungCurvo.jpg", 
            stock: 10, 
            categoria: "perifericos", 
            marca: "samsung" 
        }
    ];


// ==========================================
// FUNCIONES GLOBALES
// ==========================================

const formBusqueda = document.getElementById('form-busqueda');
const inputBusqueda = document.getElementById('input-busqueda');

if (formBusqueda) {
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
// FUNCIONES PARA INDEX
// ==========================================

const contenedor = document.getElementById('contenedor-destacados');

if (contenedor) {
    
    const productosDestacados = [
        { id: 1, nombre: "Monitor Gamer 24\" 144Hz IPS FHD", precio: 180000, imagen: "assets/images/monitorSamsung.jpg" },
        { id: 2, nombre: "SSD 1TB NVMe PCIe 4.0", precio: 85000, imagen: "assets/images/tarjetaNvidia.jpg" }, 
        { id: 3, nombre: "Brazo Articulado Doble Monitor", precio: 45000, imagen: "assets/images/desktopEsgaming.jpg" },
        { id: 4, nombre: "Teclado Mecánico Switch Red", precio: 65000, imagen: "assets/images/notebookLenovo.jpg" }
    ];

    productosDestacados.forEach(producto => {
        const tarjetaHTML = `
            <div class="col-md-3 mb-4">
                <div class="card tarjeta-producto">
                    <img src="${producto.imagen}" class="card-img-top imagen-producto" alt="${producto.nombre}">
                    <div class="card-body">
                        <h5 class="card-title nombre-producto">${producto.nombre}</h5>
                        <p class="card-text precio-producto">$${producto.precio.toLocaleString('es-CL')}</p>
                        <a href="detalle.html?id=${producto.id}" class="btn btn-agregar">
                            Agregar al carrito
                        </a>
                    </div>
                </div>
            </div>
        `;  
        contenedor.innerHTML += tarjetaHTML;
    });
}

// ==========================================
// FUNCIONES PARA CATALOGO
// ==========================================

const grillcatalogo = document.getElementById('grill-catalogo');
const btnAplicarFiltros = document.getElementById('btn-aplicar-filtros');
const selectOrdenar = document.getElementById('ordenar-productos');

if (grillcatalogo) {

    const parametrosURL = new URLSearchParams(window.location.search);
    const categoriaURL = parametrosURL.get('categoria');

    let productosMostrados = [...baseDatosProductos];

    if (categoriaURL) {
        productosMostrados = baseDatosProductos.filter(producto => producto.categoria === categoriaURL);

        const checkboxCategoria = document.querySelector('input[id^="cat-"][value="' + categoriaURL + '"]');
        if (checkboxCategoria) {
            checkboxCategoria.checked = true;
        }
    }

    mostrarCatalogo(productosMostrados);

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
                        <span class="badge ${badge} position-absolute top-0 end-0 m-2 px-2 py-1">
                            ${textoStock}
                        </span>
                    <img src="${producto.imagen}" class="card-img-top imagen-producto" alt="${producto.nombre}">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title nombre-producto">${producto.nombre}</h5>
                            <p class="card-text precio-producto">$${producto.precio.toLocaleString('es-CL')}</p>
                            <a href="detalle.html?id=${producto.id}" class="btn btn-agregar mt-auto ${estadoBoton}">
                                Agregar al carrito
                            </a>
                        </div>
                    </div>
                </div>
            `;
            grillcatalogo.innerHTML += tarjetaHTML;
        });
    }

    function ordenarProductos(arreglo, criterio) {
        let arregloOrdenado = [...arreglo]

        if (criterio === 'precio-asc') {
            arregloOrdenado.sort((a, b) => a.precio - b.precio);
        } else if (criterio === 'precio-desc') {
            arregloOrdenado.sort((a, b) => b.precio - a.precio);
        } else if (criterio === 'nombre-asc') {
            arregloOrdenado.sort((a, b) => a.nombre.localeCompare(b.nombre));
        } else if (criterio === 'nombre-desc') {
            arregloOrdenado.sort((a, b) => b.nombre.localeCompare(a.nombre));
        } else {
            arregloOrdenado.sort((a, b) => a.id - b.id);
        }
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

        if (categoriaURL) {
            btnAplicarFiltros.click();
        } else {
            mostrarCatalogo(productosMostrados);
        }
    }

    if (selectOrdenar) {
        selectOrdenar.addEventListener('change', () => {
            const productosListos = ordenarProductos(productosMostrados, selectOrdenar.value);
            mostrarCatalogo(productosListos);
        });
    }
}
