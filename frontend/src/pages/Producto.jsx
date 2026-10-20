import { Link, useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';

// Busca el producto indicado en la dirección y muestra su información detallada.
function Producto({ catalogo, agregarProducto }) {
    const { id } = useParams();

    const [cantidad, setCantidad] = useState('1');
    const navegar = useNavigate();

    const productosDisponibles = Array.isArray(catalogo) ? catalogo : [];
    const producto = productosDisponibles.find(item => item.id === Number(id));

    const cantidadNumero = Number(cantidad);
    const cantidadValida =
        producto &&
        Number.isInteger(cantidadNumero) &&
        cantidadNumero >= 1 &&
        cantidadNumero <= producto.stock;

    // Abre el carrito cuando el producto se agregó correctamente.
    function agregar() {
        if (!producto || typeof agregarProducto !== 'function') {
            return;
        }

        const valor = Number(cantidad);

        if (!Number.isInteger(valor) || valor < 1 || valor > producto.stock) {
            return;
        }

        const agregado = agregarProducto(producto, valor);

        if (agregado) {
            navegar('/carrito');
        }
    }

    function manejarCambioCantidad(evento) {
        if (!producto) {
            return;
        }

        const valor = evento.target.value;

        if (valor === '') {
            setCantidad('');
            return;
        }

        const numero = Number(valor);

        if (!Number.isInteger(numero) || numero < 1) {
            setCantidad('1');
            return;
        }

        setCantidad(String(Math.min(numero, producto.stock)));
    }

    if (!producto) {
        return (
            <main>
                <h1>Producto no encontrado</h1>
                <Link to="/catalogo">Volver al catalogo</Link>
            </main>
        );
    }

    return (
        <main>
            <Link
                to="/catalogo"
                className="btn btn-outline-success volver-catalogo"
            >
                <span aria-hidden="true">← </span>
                Volver al catalogo
            </Link>

            <div className="row g-4 mt-2">
                <div className="col-md-6">
                    <img
                        src={'/' + producto.imagen}
                        alt={producto.nombre}
                        className="detalle-imagen img-fluid rounded"
                    />
                </div>

                <div className="col-md-6">
                    <p className="text-uppercase text-muted fw-bold mb-1">{producto.marca}</p>
                    <h1 className="h2">{producto.nombre}</h1>

                    <p className="fs-3 fw-bold text-success my-2">
                        ${producto.precio.toLocaleString('es-CL')}
                    </p>

                    <p className="mb-1">Categoría: <span className="text-capitalize">{producto.categoria}</span></p>
                    <p className="mb-2">Stock disponible: {producto.stock}</p>

                    {/* Badge / Indicador visual de stock */}
                    <div className="mb-3">
                        {producto.stock > 5 && (
                            <span className="badge bg-success fs-6">
                                Stock disponible: {producto.stock} unidades
                            </span>
                        )}
                        {producto.stock > 0 && producto.stock <= 5 && (
                            <span className="badge bg-warning text-dark fs-6">
                                ¡Últimas {producto.stock} unidades disponibles!
                            </span>
                        )}
                        {producto.stock === 0 && (
                            <span className="badge bg-danger fs-6">
                                Producto Agotado
                            </span>
                        )}
                    </div>

                    {/* Descripción del Producto */}
                    {producto.descripcion && (
                        <p className="lead fs-6 mt-3 text-secondary">
                            {producto.descripcion}
                        </p>
                    )}

                    <div className="mt-4">
                        <label htmlFor="cantidad" className="form-label fw-bold">
                            Cantidad
                        </label>

                        <input
                            id="cantidad"
                            type="number"
                            className="form-control mb-3"
                            style={{ maxWidth: '120px' }}
                            min="1"
                            max={producto.stock}
                            value={cantidad}
                            onChange={manejarCambioCantidad}
                            disabled={producto.stock === 0}
                        />

                        <button
                            type="button"
                            className="btn btn-success btn-lg w-100"
                            onClick={agregar}
                            disabled={producto.stock === 0 || !cantidadValida}
                        >
                            Agregar al carrito
                        </button>
                    </div>

                    {/* Tabla de Especificaciones Técnicas */}
                    {producto.especificaciones && (
                        <div className="mt-4">
                            <h3 className="h5 fw-bold">Especificaciones técnicas</h3>
                            <table className="table table-bordered table-striped mt-2">
                                <tbody>
                                    {Object.entries(producto.especificaciones).map(([clave, valor]) => (
                                        <tr key={clave}>
                                            <td className="fw-bold text-capitalize w-33">
                                                {clave.replace(/([A-Z])/g, ' $1')}:
                                            </td>
                                            <td>{valor}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}

export default Producto;