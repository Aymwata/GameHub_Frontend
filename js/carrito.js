const productosCarrito = [
    { id: 1, nombre: "Monitor Gamer Samsung 27 Pulgadas", precio: 134990, cantidad: 1, imagen: "assets/images/monitorSamsung.jpg" },
    { id: 3, nombre: "Tarjeta de Video Nvidia RTX 5060", precio: 444990, cantidad: 2, imagen: "assets/images/tarjetaNvidia.jpg" }
];

let descuentoAplicado = 0;

function renderizarCarrito() {
    const contenedor = document.getElementById('contenedor-carrito');
    contenedor.innerHTML = '';

    if (productosCarrito.length === 0) {
        contenedor.innerHTML = `
            <div class="col-12 text-center py-5 bg-white border rounded shadow-sm">
                <p class="fs-4 text-muted mb-3">Tu carrito esta vacio.</p>
                <a href="index.html" class="btn btn-success px-4 py-2">Volver al inicio</a>
            </div>
        `;
        return;
    }

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
                    <button class="btn btn-outline-danger btn-sm" onclick="eliminarProducto(${index})">Quitar</button>
                </td>
            </tr>
        `;
    });

    const descuento = subtotalGeneral * descuentoAplicado;
    const total = subtotalGeneral - descuento;

    contenedor.innerHTML = `
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
                    <button class="btn btn-danger" onclick="vaciarCarrito()">Vaciar carrito completo</button>
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
                            <button class="btn btn-success" onclick="aplicarCupon()">Aplicar</button>
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

                    <button href="checkout.html" class="btn btn-success w-100 py-3 fw-bold fs-5">Proceder al Pago</button>
                </div>
            </div>
        </div>
    `;
}

// Funciones de acciones requeridas
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
    const cupon = document.getElementById('input-cupon').value.trim().toUpperCase();
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

renderizarCarrito();