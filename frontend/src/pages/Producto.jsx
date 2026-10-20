import { Link, useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';

// Busca el producto indicado en la direccion y muestra su informacion.
function Producto({ catalogo, agregarProducto }) {
    const { id } = useParams();

    const [cantidad, setCantidad] = useState('1');
    const navegar = useNavigate();

    const productosDisponibles = Array.isArray(catalogo) ? catalogo : [];
    const producto = productosDisponibles.find(producto => {
        return producto.id === Number(id);
    });

    const cantidadNumero = Number(cantidad);
    const cantidadValida =
        producto &&
        Number.isInteger(cantidadNumero) &&
        cantidadNumero >= 1 &&
        cantidadNumero <= producto.stock;

    // Abre el carrito cuando el producto se agrego correctamente.
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
                        className="detalle-imagen"
                    />
                </div>

                <div className="col-md-6">
                    <p className="text-uppercase">{producto.marca}</p>
                    <h1 className="h2">{producto.nombre}</h1>

                    <p className="fs-3 fw-bold">
                        ${producto.precio.toLocaleString('es-CL')}
                    </p>

                    <p>Categoria: {producto.categoria}</p>
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
                        onChange={manejarCambioCantidad}
                        disabled={producto.stock === 0}
                    />

                    <button
                        type="button"
                        className="btn btn-success"
                        onClick={agregar}
                        disabled={producto.stock === 0 || !cantidadValida}
                    >
                        Agregar al carrito
                    </button>
                </div>
            </div>
        </main>
    );
}

export default Producto;