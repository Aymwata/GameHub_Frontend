// Reúne los cálculos y validaciones independientes de la interfaz.

// Comprueba que la cantidad sea un entero positivo y no supere las unidades disponibles.
export function validarStock(cantidad, stock) {
    return Number.isInteger(cantidad) && cantidad > 0 && cantidad <= stock;
}

// Limpia el carrito guardado y une productos repetidos sin superar su stock.
export function normalizarCarrito(lineas, productos) {
    if (!Array.isArray(lineas)) return [];

    const resultado = [];

    for (const linea of lineas) {
        if (!linea || !Number.isInteger(linea.id)) continue;

        const producto = productos.find((item) => item.id === linea.id);
        if (!producto || !validarStock(linea.cantidad, producto.stock)) continue;

        const existente = resultado.find((item) => item.id === linea.id);

        if (existente) {
            existente.cantidad = Math.min(producto.stock, existente.cantidad + linea.cantidad);
        } else {
            resultado.push({ id: linea.id, cantidad: linea.cantidad });
        }
    }

    return resultado;
}

// Agrega un producto o aumenta su cantidad sin modificar el carrito recibido.
export function agregarAlCarrito(carrito, producto, cantidad) {
    const existente = carrito.find((linea) => linea.id === producto.id);
    const nuevaCantidad = (existente ? existente.cantidad : 0) + cantidad;

    if (!validarStock(cantidad, producto.stock) || !validarStock(nuevaCantidad, producto.stock)) {
        throw new Error(
            'La cantidad debe ser un entero positivo y no superar el stock disponible, incluyendo lo que ya tienes en el carrito.'
        );
    }

    if (!existente) {
        return [...carrito, { id: producto.id, cantidad }];
    }

    return carrito.map((linea) => {
        if (linea.id === producto.id) {
            return { ...linea, cantidad: nuevaCantidad };
        }

        return { ...linea };
    });
}

// Suma el precio por la cantidad de cada producto válido del carrito.
export function calcularSubtotal(carrito, productos) {
    return carrito.reduce((total, linea) => {
        const producto = productos.find((item) => item.id === linea.id);

        if (!producto || !validarStock(linea.cantidad, producto.stock)) {
            return total;
        }

        return total + producto.precio * linea.cantidad;
    }, 0);
}

// Comprueba que la fecha esté dentro del período de validez del cupón.
export function cuponVigente(cupon, fecha = new Date()) {
    if (!cupon || !(fecha instanceof Date) || Number.isNaN(fecha.getTime())) {
        return false;
    }

    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    const fechaActual = `${anio}-${mes}-${dia}`;

    return cupon.inicio <= fechaActual && fechaActual <= cupon.fin;
}

// Calcula el descuento del cupón vigente sin superar su tope ni el subtotal.
export function aplicarCupon(subtotal, cupon, fecha = new Date()) {
    if (!cuponVigente(cupon, fecha) || !Number.isFinite(subtotal) || subtotal <= 0) {
        return 0;
    }

    const descuentoPorcentaje = Math.round((subtotal * cupon.porcentaje) / 100);
    const descuentoLimitado = Math.min(subtotal, descuentoPorcentaje, cupon.tope);

    return Math.max(0, descuentoLimitado);
}

// Resta el descuento y evita que el total sea negativo.
export function calcularTotal(subtotal, descuento) {
    return Math.max(0, subtotal - Math.max(0, descuento));
}

// Devuelve una copia de los productos ordenada por precio o nombre.
export function ordenarProductos(productos, criterio) {
    const criterios = {
        'precio-asc': (a, b) => a.precio - b.precio,
        'precio-desc': (a, b) => b.precio - a.precio,
        'nombre-asc': (a, b) => a.nombre.localeCompare(b.nombre, 'es'),
        'nombre-desc': (a, b) => b.nombre.localeCompare(a.nombre, 'es')
    };
    const comparar = criterios[criterio] || ((a, b) => a.id - b.id);

    return [...productos].sort(comparar);
}

// Devuelve los mensajes de error de los datos de despacho y del método de pago.
export function validarCheckout(datos) {
    const errores = {};
    const correo = String(datos.correo || '').trim();
    const telefono = String(datos.telefono || '').trim();
    const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
    const telefonoValido = /^\d{9}$/.test(telefono);
    const metodosPago = ['tarjeta', 'transferencia'];

    for (const campo of ['nombre', 'region', 'comuna', 'direccion']) {
        if (!String(datos[campo] || '').trim()) {
            errores[campo] = 'Este campo es obligatorio.';
        }
    }

    if (!correoValido) {
        errores.correo = 'Ingresa un correo electrónico válido.';
    }

    if (!telefonoValido) {
        errores.telefono = 'Ingresa un teléfono de 9 dígitos.';
    }

    if (!metodosPago.includes(datos.pago)) {
        errores.pago = 'Selecciona un método de pago válido.';
    }

    return errores;
}
