import { validarStock } from './validaciones.js';

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
    let nuevaCantidad = cantidad;

    if (existente) {
        nuevaCantidad = existente.cantidad + cantidad;
    }

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
            return { id: linea.id, cantidad: nuevaCantidad };
        }

        return linea;
    });
}
