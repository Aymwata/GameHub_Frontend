import { useState } from 'react';
import { Link } from 'react-router-dom';
import { productos, cupones } from '../data/datos.js';
import { validarStock, cuponVigente } from '../utils/validaciones.js';
import { moneda } from '../utils/precios.js';
import LineaCarrito from '../components/LineaCarrito.jsx';
import ResumenCompra from '../components/ResumenCompra.jsx';

// Permite editar los productos elegidos y aplicar un cupón antes de comprar.
export default function Carrito({ compra, guardarCambios }) {
    const [codigo, setCodigo] = useState(compra.cupon);
    const [mensaje, setMensaje] = useState('');
    const ejemplo = cupones[0];

    // Actualiza las unidades de un producto sin superar su stock.
    function cambiarCantidad(producto, cantidad) {
        if (!validarStock(cantidad, producto.stock)) {
            setMensaje('La cantidad debe ser un entero entre 1 y ' + producto.stock + '.');
            return false;
        }

        const carrito = compra.carrito.map((linea) => {
            if (linea.id === producto.id) return { id: linea.id, cantidad };
            return linea;
        });
        const guardado = guardarCambios({ ...compra, carrito });
        if (guardado) setMensaje('');
        return guardado;
    }

    // Elimina el producto elegido y retira el cupón si el carrito queda vacío.
    function quitarProducto(id) {
        const carrito = compra.carrito.filter((linea) => linea.id !== id);
        let cupon = compra.cupon;
        if (carrito.length === 0) cupon = '';
        guardarCambios({ ...compra, carrito, cupon });
    }

    // Deja el carrito sin productos ni descuento.
    function vaciarCarrito() {
        guardarCambios({ ...compra, carrito: [], cupon: '' });
    }

    // Comprueba el código y guarda el cupón únicamente si está vigente.
    function aplicarCodigo(evento) {
        evento.preventDefault();
        const texto = codigo.trim().toUpperCase();
        const cupon = cupones.find((item) => item.codigo === texto);

        if (!cuponVigente(cupon)) {
            if (guardarCambios({ ...compra, cupon: '' })) setMensaje('Cupón inválido o vencido.');
            return;
        }

        if (guardarCambios({ ...compra, cupon: cupon.codigo })) {
            setCodigo(cupon.codigo);
            setMensaje(
                'Cupón aplicado: ' +
                    cupon.porcentaje +
                    ' %, con tope de ' +
                    moneda(cupon.tope) +
                    '.'
            );
        }
    }

    if (compra.carrito.length === 0) {
        return (
            <div className="contenedor-pagina">
                <h1 className="titulo-seccion">Carrito de compras</h1>
                <p>Tu carrito está vacío.</p>
                <Link to="/catalogo">Explorar catálogo</Link>
            </div>
        );
    }

    return (
        <div className="contenedor-pagina">
            <h1 className="titulo-seccion">Carrito de compras</h1>
            <p role="status">{mensaje}</p>
            <div className="row">
                <section className="col-lg-8 mb-4" aria-label="Productos del carrito">
                    <div className="table-responsive">
                        <table className="table align-middle">
                            <thead>
                                <tr>
                                    <th scope="col">Producto</th>
                                    <th scope="col">Precio</th>
                                    <th scope="col">Cantidad</th>
                                    <th scope="col">Subtotal</th>
                                    <th scope="col">Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {compra.carrito.map((linea) => (
                                    <LineaCarrito
                                        key={linea.id}
                                        linea={linea}
                                        producto={productos.find((item) => item.id === linea.id)}
                                        cambiarCantidad={cambiarCantidad}
                                        quitarProducto={quitarProducto}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <button
                        type="button"
                        className="btn-carrito-vaciar p-2"
                        onClick={vaciarCarrito}
                    >
                        Vaciar carrito
                    </button>
                </section>
                <div className="col-lg-4">
                    <div className="card card-body">
                        <form onSubmit={aplicarCodigo}>
                            <label htmlFor="cupon" className="form-label">
                                Cupón
                            </label>
                            <div className="input-group">
                                <input
                                    id="cupon"
                                    className="form-control"
                                    value={codigo}
                                    onChange={(evento) => setCodigo(evento.target.value)}
                                />
                                <button type="submit" className="btn-carrito-accion px-3">
                                    Aplicar
                                </button>
                            </div>
                            <p className="ayuda">
                                Prueba {ejemplo.codigo}: {ejemplo.porcentaje} %, máximo{' '}
                                {moneda(ejemplo.tope)}; vigente hasta {ejemplo.fin}.
                            </p>
                        </form>
                        <ResumenCompra carrito={compra.carrito} codigoCupon={compra.cupon} />
                        <Link
                            className="btn-carrito-pago text-center text-decoration-none p-3"
                            to="/checkout"
                        >
                            Proceder al pago
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
