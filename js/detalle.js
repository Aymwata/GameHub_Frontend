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

function renderizarDetalle() {
    const contenedor = document.getElementById('main-detalle');
    contenedor.innerHTML = '';

    let filasSpecs = '';
    productoInfo.especificaciones.forEach(esp => {
        filasSpecs += `
            <tr>
                <td class="fw-bold bg-light" style="width: 35%; color: var(--color-texto);">${esp.atributo}</td>
                <td>${esp.valor}</td>
            </tr>
        `;
    });

    contenedor.innerHTML = `
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
                
                <p class="fw-bold mb-0" style="color: var(--color-acento);">
                     Stock disponible por internet: ${productoInfo.stock} unidades
                </p>
                
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
    document.getElementById('btn-agregar-carro').addEventListener('click', () => {
        const cantidad = document.getElementById('input-cantidad').value;
        alert(`Se agregaron ${cantidad} unidad(es) de ${productoInfo.nombre} al carrito con exito.`);
        window.location.href = "carrito.html";
    });
}

renderizarDetalle();