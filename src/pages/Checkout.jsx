import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productos, cupones } from '../data/datos.js';
import { validarCheckout } from '../utils/validaciones.js';
import { calcularSubtotal, aplicarCupon, calcularTotal } from '../utils/precios.js';
import ResumenCompra from '../components/ResumenCompra.jsx';

// Recoge el despacho y registra una compra de demostración.
export default function Checkout({ compra, guardarCambios }) {
    const navegar = useNavigate();
    const [mostrarErrores, setMostrarErrores] = useState(false);
    const [datos, setDatos] = useState({
        nombre: '',
        correo: '',
        telefono: '',
        region: '',
        comuna: '',
        direccion: '',
        pago: 'tarjeta'
    });
    const errores = validarCheckout(datos);
    const formularioValido = Object.keys(errores).length === 0;

    // Copia los datos anteriores y cambia únicamente el campo que se está escribiendo.
    function cambiarCampo(evento) {
        setDatos({ ...datos, [evento.target.name]: evento.target.value });
    }

    // Guarda la orden y vacía el carrito antes de abrir el historial.
    function confirmarCompra(evento) {
        evento.preventDefault();
        setMostrarErrores(true);
        if (!formularioValido || compra.carrito.length === 0) return;

        const subtotal = calcularSubtotal(compra.carrito, productos);
        const cupon = cupones.find((item) => item.codigo === compra.cupon);
        const descuento = aplicarCupon(subtotal, cupon);
        const lineas = compra.carrito.map((linea) => {
            const producto = productos.find((item) => item.id === linea.id);
            return {
                id: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                cantidad: linea.cantidad
            };
        });
        const orden = {
            id: 'ORD-' + Date.now(),
            fecha: new Date().toISOString(),
            estado: 'Confirmada',
            pago: 'Aprobado (simulado)',
            despacho: 'Pendiente de preparación',
            metodoPago: datos.pago,
            direccion:
                datos.direccion.trim() + ', ' + datos.comuna.trim() + ', ' + datos.region.trim(),
            lineas,
            subtotal,
            descuento,
            total: calcularTotal(subtotal, descuento)
        };
        const nuevaCompra = { carrito: [], cupon: '', ordenes: [orden, ...compra.ordenes] };

        if (guardarCambios(nuevaCompra)) {
            navegar('/ordenes?confirmada=' + orden.id);
        }
    }

    if (compra.carrito.length === 0) {
        return (
            <div className="contenedor-pagina">
                <h1 className="titulo-seccion">Finalizar compra</h1>
                <p>Tu carrito está vacío.</p>
                <Link to="/catalogo">Agrega productos antes de comprar</Link>
            </div>
        );
    }

    return (
        <div className="contenedor-pagina">
            <h1 className="titulo-seccion">Finalizar compra</h1>
            <div className="row">
                <section className="col-lg-8" aria-label="Datos de despacho">
                    <form
                        className="contenedor-form"
                        onSubmit={confirmarCompra}
                        onBlur={() => setMostrarErrores(true)}
                        noValidate
                    >
                        <p>Compra simulada: utiliza datos ficticios.</p>
                        <div className="grupo-form">
                            <label htmlFor="nombre">Nombre completo</label>
                            <input
                                id="nombre"
                                name="nombre"
                                autoComplete="name"
                                value={datos.nombre}
                                onChange={cambiarCampo}
                                aria-describedby="error-nombre"
                                required
                            />
                            <span id="error-nombre" className="error-campo">
                                {mostrarErrores && errores.nombre}
                            </span>
                        </div>
                        <div className="grupo-form">
                            <label htmlFor="correo">Correo electrónico</label>
                            <input
                                id="correo"
                                name="correo"
                                type="email"
                                autoComplete="email"
                                value={datos.correo}
                                onChange={cambiarCampo}
                                aria-describedby="error-correo"
                                required
                            />
                            <span id="error-correo" className="error-campo">
                                {mostrarErrores && errores.correo}
                            </span>
                        </div>
                        <div className="grupo-form">
                            <label htmlFor="telefono">Teléfono de 9 dígitos</label>
                            <input
                                id="telefono"
                                name="telefono"
                                type="tel"
                                inputMode="numeric"
                                maxLength={9}
                                autoComplete="tel-national"
                                value={datos.telefono}
                                onChange={cambiarCampo}
                                aria-describedby="error-telefono"
                                required
                            />
                            <span id="error-telefono" className="error-campo">
                                {mostrarErrores && errores.telefono}
                            </span>
                        </div>
                        <div className="grupo-form">
                            <label htmlFor="region">Región</label>
                            <input
                                id="region"
                                name="region"
                                autoComplete="address-level1"
                                value={datos.region}
                                onChange={cambiarCampo}
                                aria-describedby="error-region"
                                required
                            />
                            <span id="error-region" className="error-campo">
                                {mostrarErrores && errores.region}
                            </span>
                        </div>
                        <div className="grupo-form">
                            <label htmlFor="comuna">Comuna</label>
                            <input
                                id="comuna"
                                name="comuna"
                                autoComplete="address-level2"
                                value={datos.comuna}
                                onChange={cambiarCampo}
                                aria-describedby="error-comuna"
                                required
                            />
                            <span id="error-comuna" className="error-campo">
                                {mostrarErrores && errores.comuna}
                            </span>
                        </div>
                        <div className="grupo-form">
                            <label htmlFor="direccion">Dirección de despacho</label>
                            <input
                                id="direccion"
                                name="direccion"
                                autoComplete="street-address"
                                value={datos.direccion}
                                onChange={cambiarCampo}
                                aria-describedby="error-direccion"
                                required
                            />
                            <span id="error-direccion" className="error-campo">
                                {mostrarErrores && errores.direccion}
                            </span>
                        </div>
                        <div className="grupo-form">
                            <label htmlFor="pago">Método de pago simulado</label>
                            <select
                                id="pago"
                                name="pago"
                                value={datos.pago}
                                onChange={cambiarCampo}
                            >
                                <option value="tarjeta">Tarjeta de crédito/débito</option>
                                <option value="transferencia">Transferencia bancaria</option>
                            </select>
                        </div>
                        <p className="ayuda">Completa todos los campos para habilitar el pago.</p>
                        <button className="btn-checkout" type="submit" disabled={!formularioValido}>
                            Confirmar y pagar (simulado)
                        </button>
                    </form>
                </section>
                <div className="col-lg-4">
                    <div className="card card-body">
                        <ResumenCompra carrito={compra.carrito} codigoCupon={compra.cupon} />
                    </div>
                </div>
            </div>
        </div>
    );
}
