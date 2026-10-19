import { Link, useParams, useNavigate } from 'react-router-dom';
import { productos } from '../data/productos.js';
import { useState } from 'react';

// Busca el producto indicado en la dirección y muestra su información.
function Producto({ agregarProducto }) {
    const { id } = useParams();

    const [cantidad, setCantidad] = useState('1');
    const navegar = useNavigate();

    // Abre el carrito cuando el producto se agregó correctamente.
    function agregar() {
        const agregado = agregarProducto(producto, Number(cantidad));

        if (agregado) {
            navegar('/carrito');
        }
    }

    const producto = productos.find(producto => {
        return producto.id === Number(id);
    });

    if (!producto) {
        return (
            <main>
                <h1>Producto no encontrado</h1>
                <Link to="/catalogo">Volver al catálogo</Link>
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
                Volver al catálogo
            </Link>

            <div className="row g-4 mt-2">
                <div className="col-md-6">
                    <img
                        src={'/' + producto.imagen}
                        alt={producto.nombre}
                        className="detalle-imagen"
                    />
                </div>

                <div className="col-md-6">
                    <p className="text-uppercase">{producto.marca}</p>
                    <h1 className="h2">{producto.nombre}</h1>

                    <p className="fs-3 fw-bold">
                        ${producto.precio.toLocaleString('es-CL')}
                    </p>

                    <p>Categoría: {producto.categoria}</p>
                    <p>Stock disponible: {producto.stock}</p>

                    <label htmlFor="cantidad" className="form-label">
                        Cantidad
                    </label>

                    <input
                        id="cantidad"
                        type="number"
                        className="form-control mb-3"
                        min="1"
                        max={producto.stock}
                        value={cantidad}
                        onChange={evento => setCantidad(evento.target.value)}
                        disabled={producto.stock === 0}
                    />

                    <button
                        type="button"
                        className="btn btn-success"
                        onClick={agregar}
                        disabled={producto.stock === 0}
                    >
                        Agregar al carrito
                    </button>
                </div>
            </div>
        </main>
    );
}

export default Producto;