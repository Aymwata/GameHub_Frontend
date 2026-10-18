// Agrupa los cálculos y validaciones que funcionan sin acceder a la página ni al navegador.
(function (root) {
    'use strict';

    // Comprueba que la cantidad sea un entero positivo y no supere las unidades disponibles.
    function validarStock(cantidad, stock) {
        return Number.isInteger(cantidad) && cantidad > 0 && cantidad <= stock;
    }

    // Limpia el carrito guardado y une productos repetidos sin superar su stock.
    function normalizarCarrito(lineas, productos) {
        if (!Array.isArray(lineas)) return [];
        const resultado = [];
        for (const linea of lineas) {
            if (!linea || !Number.isInteger(linea.id)) continue;
            const producto = productos.find(item => item.id === linea.id);
            if (!producto || !validarStock(linea.cantidad, producto.stock)) continue;
            const existente = resultado.find(item => item.id === linea.id);
            if (existente) existente.cantidad = Math.min(producto.stock, existente.cantidad + linea.cantidad);
            else resultado.push({ id: linea.id, cantidad: linea.cantidad });
        }
        return resultado;
    }

    // Agrega un producto o aumenta su cantidad sin modificar el carrito recibido.
    function agregarAlCarrito(carrito, producto, cantidad) {
        const existente = carrito.find(linea => linea.id === producto.id);
        const nuevaCantidad = (existente ? existente.cantidad : 0) + cantidad;
        if (!validarStock(cantidad, producto.stock) || !validarStock(nuevaCantidad, producto.stock)) {
            throw new Error('La cantidad debe ser un entero positivo y no superar el stock disponible, incluyendo lo que ya tienes en el carrito.');
        }
        return existente
            ? carrito.map(linea => linea.id === producto.id ? { ...linea, cantidad: nuevaCantidad } : { ...linea })
            : [...carrito, { id: producto.id, cantidad }];
    }

    // Suma el precio por la cantidad de cada producto válido del carrito.
    function calcularSubtotal(carrito, productos) {
        return carrito.reduce((total, linea) => {
            const producto = productos.find(item => item.id === linea.id);
            return total + (producto && validarStock(linea.cantidad, producto.stock) ? producto.precio * linea.cantidad : 0);
        }, 0);
    }

    // Comprueba que la fecha esté dentro del período de validez del cupón.
    function cuponVigente(cupon, fecha = new Date()) {
        if (!cupon || !(fecha instanceof Date) || Number.isNaN(fecha.getTime())) return false;
        const dia = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
        return cupon.inicio <= dia && dia <= cupon.fin;
    }

    // Calcula el descuento del cupón vigente sin superar su tope ni el subtotal.
    function aplicarCupon(subtotal, cupon, fecha = new Date()) {
        if (!cuponVigente(cupon, fecha) || !Number.isFinite(subtotal) || subtotal <= 0) return 0;
        return Math.max(0, Math.min(subtotal, Math.round(subtotal * cupon.porcentaje / 100), cupon.tope));
    }

    // Resta el descuento y evita que el total sea negativo.
    function calcularTotal(subtotal, descuento) {
        return Math.max(0, subtotal - Math.max(0, descuento));
    }

    // Devuelve una copia de los productos ordenada por precio o nombre.
    function ordenarProductos(productos, criterio) {
        const criterios = {
            'precio-asc': (a, b) => a.precio - b.precio,
            'precio-desc': (a, b) => b.precio - a.precio,
            'nombre-asc': (a, b) => a.nombre.localeCompare(b.nombre, 'es'),
            'nombre-desc': (a, b) => b.nombre.localeCompare(a.nombre, 'es')
        };
        return [...productos].sort(criterios[criterio] || ((a, b) => a.id - b.id));
    }

    // Devuelve los mensajes de error de los datos de despacho y del método de pago.
    function validarCheckout(datos) {
        const errores = {};
        for (const campo of ['nombre', 'region', 'comuna', 'direccion']) {
            if (!String(datos[campo] || '').trim()) errores[campo] = 'Este campo es obligatorio.';
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(datos.correo || '').trim())) errores.correo = 'Ingresa un correo electrónico válido.';
        if (!/^\d{9}$/.test(String(datos.telefono || '').trim())) errores.telefono = 'Ingresa un teléfono de 9 dígitos.';
        if (!['tarjeta', 'transferencia'].includes(datos.pago)) errores.pago = 'Selecciona un método de pago válido.';
        return errores;
    }

    // Permite usar estas funciones tanto en la tienda como en las pruebas de Node.js.
    const reglas = { validarStock, normalizarCarrito, agregarAlCarrito, calcularSubtotal, cuponVigente, aplicarCupon, calcularTotal, ordenarProductos, validarCheckout };
    if (typeof module !== 'undefined' && module.exports) module.exports = reglas;
    else root.GameHubTienda = reglas;
})(globalThis);
