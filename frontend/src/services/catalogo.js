import { solicitar } from './api.js';

export async function cargarCatalogo(signal) {
    const [productos, categorias, inventario] = await Promise.all([
        solicitar('/products', { signal }),
        solicitar('/categories', { signal }),
        solicitar('/inventory/availability', { signal }),
    ]);
    const categoriasActivas = categorias.filter(categoria => categoria.estado);
    const categoriasPorId = new Map(categoriasActivas.map(categoria => [categoria.id, categoria]));
    const stock = new Map(inventario.map(item => [item.productId, Math.max(0, item.actualAvailable)]));

    return {
        categorias: categoriasActivas,
        productos: productos.map(producto => ({
            ...producto,
            categoria: String(producto.categoria?.id ?? ''),
            nombreCategoria: categoriasPorId.get(producto.categoria?.id)?.nombre ?? '',
            stock: producto.estado ? (stock.get(producto.id) ?? 0) : 0,
        })),
    };
}
