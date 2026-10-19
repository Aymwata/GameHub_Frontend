import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { productos } from '../data/productos.js';
import { categorias } from '../data/categorias.js';
import TarjetaProducto from '../components/TarjetaProducto.jsx';

function Catalogo() {
  const [parametros, setParametros] = useSearchParams();

  const [marca, setMarca] = useState('');
  const [rangoPrecio, setRangoPrecio] = useState('');
  const [orden, setOrden] = useState('');

  const busqueda = parametros.get('buscar') || '';
  const categoria = parametros.get('categoria') || '';

  // Actualiza la búsqueda y conserva la categoría seleccionada.
  function cambiarBusqueda(evento) {
    setParametros({
      buscar: evento.target.value,
      categoria: categoria,
    });
  }

  // Actualiza la categoría y conserva el texto de búsqueda.
  function cambiarCategoria(evento) {
    setParametros({
      buscar: busqueda,
      categoria: evento.target.value,
    });
  }

  // Restablece todos los filtros del catálogo.
  function limpiarFiltros() {
    setParametros({});
    setMarca('');
    setRangoPrecio('');
    setOrden('');
  }

  // Selecciona los productos que cumplen los filtros.
  const productosFiltrados = productos.filter((producto) => {
    const coincideBusqueda = producto.nombre
      .toLowerCase()
      .includes(busqueda.trim().toLowerCase());

    const coincideCategoria =
      categoria === '' || producto.categoria === categoria;

    const coincideMarca =
      marca === '' || producto.marca.toLowerCase() === marca;

    // Comprueba si el precio está dentro del rango seleccionado.
    let coincidePrecio = true;

    if (rangoPrecio === 'hasta-200000') {
    coincidePrecio = producto.precio <= 200000;
    }

    if (rangoPrecio === '200000-500000') {
    coincidePrecio = producto.precio > 200000 && producto.precio <= 500000;
    }

    if (rangoPrecio === '500000-1000000') {
    coincidePrecio = producto.precio > 500000 && producto.precio <= 1000000;
    }

    if (rangoPrecio === 'mas-1000000') {
    coincidePrecio = producto.precio > 1000000;
    }

    return (
      coincideBusqueda &&
      coincideCategoria &&
      coincideMarca &&
      coincidePrecio
    );
  });

  // Ordena los resultados según la opción seleccionada.
  if (orden === 'menor-precio') {
    productosFiltrados.sort((a, b) => a.precio - b.precio);
  }

  if (orden === 'mayor-precio') {
    productosFiltrados.sort((a, b) => b.precio - a.precio);
  }

  if (orden === 'nombre') {
    productosFiltrados.sort((a, b) =>
      a.nombre.localeCompare(b.nombre, 'es')
    );
  }

  return (
    <main className="pagina-catalogo">
      <h1>Catálogo de productos</h1>

      <div className="distribucion-catalogo">
        {/* Agrupa los controles para filtrar los productos. */}
        <aside className="filtros-catalogo" aria-label="Filtros del catálogo">
          <h2>Filtrar productos</h2>

          <div className="mb-4">
            <label htmlFor="categoria" className="form-label">
              Categoría
            </label>

            <select
              id="categoria"
              className="form-select"
              value={categoria}
              onChange={cambiarCategoria}
            >
              <option value="">Todas las categorías</option>

              {categorias.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="marca" className="form-label">
              Marca
            </label>

            <select
              id="marca"
              className="form-select"
              value={marca}
              onChange={(evento) => setMarca(evento.target.value)}
            >
              <option value="">Todas las marcas</option>
              <option value="samsung">Samsung</option>
              <option value="lenovo">Lenovo</option>
              <option value="msi">MSI</option>
              <option value="esgaming">Esgaming</option>
            </select>
          </div>

            <div className="mb-4">
                <label htmlFor="rango-precio" className="form-label">
                    Rango de precio
                </label>

                <select
                    id="rango-precio"
                    className="form-select"
                    value={rangoPrecio}
                    onChange={(evento) => setRangoPrecio(evento.target.value)}
                >
                    <option value="">Todos los precios</option>
                    <option value="hasta-200000">Hasta $200.000</option>
                    <option value="200000-500000">$200.001 a $500.000</option>
                    <option value="500000-1000000">$500.001 a $1.000.000</option>
                    <option value="mas-1000000">Más de $1.000.000</option>
                </select>
            </div>



          <button
            type="button"
            className="btn btn-outline-success w-100"
            onClick={limpiarFiltros}
          >
            Limpiar filtros
          </button>
        </aside>

        {/* Presenta la búsqueda, el orden y los resultados. */}
        <section className="resultados-catalogo" aria-label="Productos">
          <div className="barra-catalogo">
            <div className="busqueda-catalogo">
              <label htmlFor="buscar-producto" className="form-label">
                Buscar producto
              </label>

              <input
                id="buscar-producto"
                type="search"
                className="form-control"
                placeholder="¿Qué estás buscando?"
                value={busqueda}
                onChange={cambiarBusqueda}
              />
            </div>

            <div className="orden-catalogo">
              <label htmlFor="orden-productos" className="form-label">
                Ordenar por
              </label>

              <select
                id="orden-productos"
                className="form-select"
                value={orden}
                onChange={(evento) => setOrden(evento.target.value)}
              >
                <option value="">Orden original</option>
                <option value="menor-precio">Menor precio</option>
                <option value="mayor-precio">Mayor precio</option>
                <option value="nombre">Nombre: A a Z</option>
              </select>
            </div>
          </div>

          <p className="cantidad-resultados" role="status">
            Productos encontrados: {productosFiltrados.length}
          </p>

          <div className="row">
            {productosFiltrados.map((producto) => (
              <TarjetaProducto key={producto.id} producto={producto} />
            ))}
          </div>

          {productosFiltrados.length === 0 && (
            <div className="catalogo-vacio">
              <h2>No encontramos productos</h2>
              <p>Prueba con otra búsqueda o limpia los filtros.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default Catalogo;