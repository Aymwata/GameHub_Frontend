import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productos, categorias, marcas } from '../data/datos.js';
import { ordenarProductos } from '../utils/catalogo.js';
import TarjetaProducto from '../components/TarjetaProducto.jsx';

// Filtra el catálogo con los valores elegidos en los controles.
export default function Catalogo() {
    const [parametros, setParametros] = useSearchParams();
    const [marca, setMarca] = useState('');
    const [minimo, setMinimo] = useState('');
    const [maximo, setMaximo] = useState('');
    const [orden, setOrden] = useState('relevancia');
    const [limite, setLimite] = useState(3);
    const categoria = parametros.get('categoria') || '';
    const busqueda = (parametros.get('buscar') || '').toLowerCase();
    let error = '';

    if (Number(minimo) < 0 || Number(maximo) < 0) {
        error = 'Los precios no pueden ser negativos.';
    }
    if (minimo !== '' && maximo !== '' && Number(minimo) > Number(maximo)) {
        error = 'El precio mínimo no puede superar al máximo.';
    }

    const filtrados = productos.filter((producto) => {
        const coincideNombre = producto.nombre.toLowerCase().includes(busqueda);
        const coincideCategoria = categoria === '' || producto.categoria === categoria;
        const coincideMarca = marca === '' || producto.marca === marca;
        const cumpleMinimo = minimo === '' || producto.precio >= Number(minimo);
        const cumpleMaximo = maximo === '' || producto.precio <= Number(maximo);

        return coincideNombre && coincideCategoria && coincideMarca && cumpleMinimo && cumpleMaximo;
    });
    const ordenados = ordenarProductos(filtrados, orden);
    const visibles = ordenados.slice(0, limite);

    // Cambia la categoría de la dirección y vuelve al primer grupo de resultados.
    function cambiarCategoria(evento) {
        const nuevosParametros = new URLSearchParams(parametros);
        nuevosParametros.set('categoria', evento.target.value);
        setParametros(nuevosParametros);
        setLimite(3);
    }

    return (
        <div className="contenedor-pagina">
            <h1 className="titulo-seccion">Catálogo de productos</h1>
            <div className="row">
                <aside className="col-lg-3 mb-4">
                    <div className="tarjeta-filtros p-3">
                        <h2 className="h4">Filtros</h2>
                        <div className="grupo-form">
                            <label htmlFor="categoria">Categoría</label>
                            <select id="categoria" value={categoria} onChange={cambiarCategoria}>
                                <option value="">Todas</option>
                                {categorias.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="grupo-form">
                            <label htmlFor="marca">Marca</label>
                            <select
                                id="marca"
                                value={marca}
                                onChange={(evento) => setMarca(evento.target.value)}
                            >
                                <option value="">Todas</option>
                                {marcas.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="grupo-form">
                            <label htmlFor="precio-min">Precio mínimo</label>
                            <input
                                id="precio-min"
                                type="number"
                                min="0"
                                value={minimo}
                                onChange={(evento) => setMinimo(evento.target.value)}
                            />
                        </div>
                        <div className="grupo-form">
                            <label htmlFor="precio-max">Precio máximo</label>
                            <input
                                id="precio-max"
                                type="number"
                                min="0"
                                value={maximo}
                                onChange={(evento) => setMaximo(evento.target.value)}
                            />
                        </div>
                        <div className="grupo-form">
                            <label htmlFor="orden">Ordenar por</label>
                            <select
                                id="orden"
                                value={orden}
                                onChange={(evento) => setOrden(evento.target.value)}
                            >
                                <option value="relevancia">Relevancia</option>
                                <option value="precio-asc">Precio: menor a mayor</option>
                                <option value="precio-desc">Precio: mayor a menor</option>
                                <option value="nombre-asc">Nombre: A - Z</option>
                                <option value="nombre-desc">Nombre: Z - A</option>
                            </select>
                        </div>
                        <p className="ayuda">Los filtros se aplican automáticamente.</p>
                        <p className="text-danger" role="alert">
                            {error}
                        </p>
                    </div>
                </aside>
                <section className="col-lg-9" aria-label="Resultados del catálogo">
                    <h2 className="visually-hidden">Resultados</h2>
                    {error === '' && (
                        <>
                            <p role="status">{ordenados.length} producto(s) encontrado(s).</p>
                            <div className="row">
                                {visibles.map((producto) => (
                                    <TarjetaProducto key={producto.id} producto={producto} />
                                ))}
                            </div>
                            {ordenados.length === 0 && <p>No se encontraron productos.</p>}
                            {limite < ordenados.length && (
                                <button
                                    className="btn btn-agregar"
                                    onClick={() => setLimite(limite + 3)}
                                >
                                    Ver más productos
                                </button>
                            )}
                        </>
                    )}
                </section>
            </div>
        </div>
    );
}
