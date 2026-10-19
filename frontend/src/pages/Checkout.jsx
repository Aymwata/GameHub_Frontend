import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { calcularResumen } from '../utils/precios.js';
import ResumenCompra from '../components/ResumenCompra.jsx';

// Define los campos que aparecerán en el formulario.
const campos = [
    { nombre: 'nombre', etiqueta: 'Nombre completo', tipo: 'text', completar: 'name' },
    { nombre: 'correo', etiqueta: 'Correo electrónico', tipo: 'email', completar: 'email' },
    { nombre: 'telefono', etiqueta: 'Teléfono de 9 dígitos', tipo: 'tel', completar: 'tel-national' },
    { nombre: 'region', etiqueta: 'Región', tipo: 'text', completar: 'address-level1' },
    { nombre: 'comuna', etiqueta: 'Comuna', tipo: 'text', completar: 'address-level2' },
    { nombre: 'direccion', etiqueta: 'Dirección', tipo: 'text', completar: 'street-address' }
];

// Comprueba los datos de despacho antes de confirmar la compra.
function validarDatos(datos) {
    const errores = {};

    for (const campo of campos) {
        if (datos[campo.nombre].trim() === '') {
            errores[campo.nombre] = 'Este campo es obligatorio.';
        }
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo.trim())) {
        errores.correo = 'Ingresa un correo válido.';
    }

    if (!/^[0-9]{9}$/.test(datos.telefono.trim())) {
        errores.telefono = 'Ingresa exactamente 9 dígitos.';
    }

    return errores;
}

// Recoge el despacho y solicita la confirmación de la compra.
function Checkout({ carrito, codigoCupon, finalizarCompra }) {
    const navegar = useNavigate();

    const [datos, setDatos] = useState({
        nombre: '',
        correo: '',
        telefono: '',
        region: '',
        comuna: '',
        direccion: '',
        pago: 'tarjeta'
    });

    const [mostrarErrores, setMostrarErrores] = useState(false);
    const errores = validarDatos(datos);
    const formularioValido = Object.keys(errores).length === 0;

    let total = 0;

    const resumen = calcularResumen(carrito, codigoCupon);

    // Actualiza únicamente el campo que se está editando.
    function cambiarCampo(evento) {
        setDatos({
            ...datos,
            [evento.target.name]: evento.target.value
        });
    }

    // Abre el historial cuando la compra se guardó correctamente.
    function confirmar(evento) {
        evento.preventDefault();
        setMostrarErrores(true);

        if (!formularioValido) return;

        if (finalizarCompra(datos)) {
            navegar('/ordenes');
        }
    }

    if (carrito.length === 0) {
        return (
            <main>
                <h1>Finalizar compra</h1>
                <p>Tu carrito está vacío.</p>
                <Link to="/catalogo">Explorar catálogo</Link>
            </main>
        );
    }

    return (
        <main>
            <h1>Finalizar compra</h1>
            <p>Pago de demostración: utiliza datos ficticios.</p>

            <div className="row g-4">
                <div className="col-lg-8">
                    <form
                        onSubmit={confirmar}
                        onBlur={() => setMostrarErrores(true)}
                        noValidate
                    >
                        {campos.map(campo => (
                            <div className="mb-3" key={campo.nombre}>
                                <label
                                    htmlFor={campo.nombre}
                                    className="form-label"
                                >
                                    {campo.etiqueta}
                                </label>

                                <input
                                    id={campo.nombre}
                                    name={campo.nombre}
                                    type={campo.tipo}
                                    autoComplete={campo.completar}
                                    className="form-control"
                                    value={datos[campo.nombre]}
                                    onChange={cambiarCampo}
                                    aria-describedby={'error-' + campo.nombre}
                                    required
                                />

                                <small
                                    id={'error-' + campo.nombre}
                                    className="text-danger"
                                >
                                    {mostrarErrores && errores[campo.nombre]}
                                </small>
                            </div>
                        ))}

                        <label htmlFor="pago" className="form-label">
                            Método de pago simulado
                        </label>

                        <select
                            id="pago"
                            name="pago"
                            className="form-select mb-3"
                            value={datos.pago}
                            onChange={cambiarCampo}
                        >
                            <option value="tarjeta">Tarjeta</option>
                            <option value="transferencia">Transferencia</option>
                        </select>

                        <p>Completa todos los campos para habilitar el pago.</p>

                        <button
                            type="submit"
                            className="btn btn-success"
                            disabled={!formularioValido}
                        >
                            Confirmar compra simulada
                        </button>
                    </form>
                </div>

                <section className="col-lg-4">
                    <div className="resumen-checkout">
                        <h2 className="h4">Resumen</h2>

                        <ul>
                            {carrito.map(producto => (
                                <li key={producto.id}>
                                    {producto.nombre} × {producto.cantidad}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <ResumenCompra resumen={resumen} />

                </section>
            </div>
        </main>
    );
}

export default Checkout;