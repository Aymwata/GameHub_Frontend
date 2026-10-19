// Recupera la compra y conserva los datos de versiones anteriores.
export function leerCompra() {
    const vacia = { carrito: [], ordenes: [], cupon: '' };

    try {
        const texto = localStorage.getItem('gamehub-carrito');
        const guardado = JSON.parse(texto);

        if (Array.isArray(guardado)) {
            return { carrito: guardado, ordenes: [], cupon: '' };
        }

        if (
            guardado &&
            Array.isArray(guardado.carrito) &&
            Array.isArray(guardado.ordenes)
        ) {
            return {
                carrito: guardado.carrito,
                ordenes: guardado.ordenes,
                cupon: guardado.cupon || ''
            };
        }

        return vacia;
    } catch {
        return vacia;
    }
}

// Guarda todos los datos de la compra en una sola operación.
export function guardarCompra(carrito, ordenes, cupon) {
    try {
        const compra = { carrito, ordenes, cupon };
        localStorage.setItem('gamehub-carrito', JSON.stringify(compra));
        return true;
    } catch {
        return false;
    }
}