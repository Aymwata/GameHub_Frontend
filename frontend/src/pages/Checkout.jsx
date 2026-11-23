import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ImagenProducto from '../components/ImagenProducto.jsx';
import ResumenCompra from '../components/ResumenCompra.jsx';
import { calcularResumen } from '../utils/precios.js';

export default function Checkout({ carrito, codigoCupon, usuario, carritoValido = true, finalizarCompra }) {
    const navegar = useNavigate();
    const enCurso = useRef(false);
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState('');
    const [contacto, setContacto] = useState({
        nombreContacto: usuario?.nombre ?? '',
        correoContacto: usuario?.email ?? '',
        telefonoContacto: '',
        region: '',
        ciudad: '',
        comuna: '',
        calle: '',
        numero: '',
    });

    function actualizarContacto(evento) {
        const { name, value } = evento.target;
        setContacto(actual => ({ ...actual, [name]: value }));
    }

    async function confirmar(evento) {
        evento.preventDefault();
        if (enCurso.current || !carritoValido || carrito.length === 0) return;
        enCurso.current = true;
        setEnviando(true);
        setError('');
        try {
            const orden = await finalizarCompra(contacto);
            navegar('/ordenes', { state: { ordenCreada: orden.id } });
        } catch (fallo) {
            setError(fallo.status ? fallo.message : 'No pudimos confirmar el pedido. Revisa Mis órdenes antes de reintentar.');
        } finally {
            enCurso.current = false;
            setEnviando(false);
        }
    }

    return (
        <main className="container py-4">
            <h1 className="h2">Confirmar pedido</h1>
            {carrito.length === 0 ? (
                <p>Tu carrito está vacío. <Link to="/catalogo">Volver al catálogo</Link></p>
            ) : (
                <form className="row g-4" onSubmit={confirmar}>
                    <section className="col-lg-8">
                        <h2 className="h4">Productos</h2>
                        <ul className="list-unstyled d-grid gap-3 mb-4">
                            {carrito.map(item => (
                                <li key={item.id} className="d-flex align-items-center gap-3 rounded-3 border bg-white p-3">
                                    <ImagenProducto
                                        producto={item}
                                        className="orden-item-imagen rounded-3 border bg-light"
                                    />
                                    <div className="flex-grow-1">
                                        <div className="fw-semibold">{item.nombre}</div>
                                        <small className="text-muted">Cantidad: {item.cantidad}</small>
                                    </div>
                                    <span className="text-nowrap fw-semibold">
                                        ${(item.precio * item.cantidad).toLocaleString('es-CL')}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <h2 className="h4">Datos de contacto</h2>
                        <div className="row g-3 mb-4">
                            <div className="col-md-6">
                                <label htmlFor="checkout-nombre" className="form-label">Nombre completo</label>
                                <input id="checkout-nombre" name="nombreContacto" className="form-control"
                                    value={contacto.nombreContacto} onChange={actualizarContacto}
                                    maxLength={100} autoComplete="name" required disabled={enviando} />
                            </div>
                            <div className="col-md-6">
                                <label htmlFor="checkout-correo" className="form-label">Correo electrónico</label>
                                <input id="checkout-correo" name="correoContacto" type="email" className="form-control"
                                    value={contacto.correoContacto} onChange={actualizarContacto}
                                    maxLength={100} autoComplete="email" required disabled={enviando} />
                            </div>
                            <div className="col-md-6">
                                <label htmlFor="checkout-telefono" className="form-label">Teléfono (9 dígitos)</label>
                                <input id="checkout-telefono" name="telefonoContacto" type="tel" inputMode="numeric"
                                    className="form-control" value={contacto.telefonoContacto}
                                    onChange={actualizarContacto} maxLength={9} pattern="[0-9]{9}"
                                    autoComplete="tel-national" required disabled={enviando}
                                    title="Ingresa un teléfono de 9 dígitos." />
                            </div>
                        </div>

                        <h2 className="h4">Dirección de despacho</h2>
                        <div className="row g-3 mb-4">
                            <div className="col-md-6">
                                <label htmlFor="checkout-region" className="form-label">Región</label>
                                <input id="checkout-region" name="region" className="form-control"
                                    value={contacto.region} onChange={actualizarContacto}
                                    maxLength={100} autoComplete="address-level1" required disabled={enviando} />
                            </div>
                            <div className="col-md-6">
                                <label htmlFor="checkout-ciudad" className="form-label">Ciudad</label>
                                <input id="checkout-ciudad" name="ciudad" className="form-control"
                                    value={contacto.ciudad} onChange={actualizarContacto}
                                    maxLength={100} autoComplete="address-level2" required disabled={enviando} />
                            </div>
                            <div className="col-md-6">
                                <label htmlFor="checkout-comuna" className="form-label">Comuna</label>
                                <input id="checkout-comuna" name="comuna" className="form-control"
                                    value={contacto.comuna} onChange={actualizarContacto}
                                    maxLength={100} required disabled={enviando} />
                            </div>
                            <div className="col-md-6">
                                <label htmlFor="checkout-calle" className="form-label">Calle</label>
                                <input id="checkout-calle" name="calle" className="form-control"
                                    value={contacto.calle} onChange={actualizarContacto}
                                    maxLength={150} autoComplete="address-line1" required disabled={enviando} />
                            </div>
                            <div className="col-md-6">
                                <label htmlFor="checkout-numero" className="form-label">Número</label>
                                <input id="checkout-numero" name="numero" className="form-control"
                                    value={contacto.numero} onChange={actualizarContacto}
                                    maxLength={20} autoComplete="address-line2" required disabled={enviando} />
                            </div>
                        </div>

                        <p>El pedido quedará pendiente de pago.</p>
                        {codigoCupon && <p>El servidor validará el cupón {codigoCupon} al confirmar.</p>}
                        {!carritoValido && <p role="alert">Revisa las cantidades disponibles en tu carrito.</p>}
                        {error && <p className="alert alert-danger" role="alert">{error}</p>}
                        <button className="btn btn-success me-3" disabled={!carritoValido || enviando}>
                            {enviando ? 'Creando pedido…' : 'Crear pedido'}
                        </button>
                        <Link to="/carrito">Editar carrito</Link>
                    </section>
                    <section className="col-lg-4">
                        <h2 className="h4">Resumen</h2>
                        <ResumenCompra resumen={calcularResumen(carrito)} estimado />
                    </section>
                </form>
            )}
        </main>
    );
}
