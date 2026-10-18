// Ordena una copia del catálogo según el criterio elegido.
export function ordenarProductos(productos, criterio) {
    const ordenados = productos.slice();

    if (criterio === 'precio-asc') {
        ordenados.sort((a, b) => a.precio - b.precio);
    }
    if (criterio === 'precio-desc') {
        ordenados.sort((a, b) => b.precio - a.precio);
    }
    if (criterio === 'nombre-asc') {
        ordenados.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    }
    if (criterio === 'nombre-desc') {
        ordenados.sort((a, b) => b.nombre.localeCompare(a.nombre, 'es'));
    }

    return ordenados;
}
