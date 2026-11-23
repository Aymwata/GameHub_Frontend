import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ImagenProducto from '../components/ImagenProducto.jsx';
import ResumenCompra from '../components/ResumenCompra.jsx';
import { calcularResumen } from '../utils/precios.js';

const camposEntrega = [
    { campo: 'nombre', etiqueta: 'Nombre completo', autoComplete: 'name' },
    { campo: 'email', etiqueta: 'Correo electrónico', autoComplete: 'email', type: 'email' },
    { campo: 'telefono', etiqueta: 'Teléfono de 9 dígitos', autoComplete: 'tel-national', type: 'tel', inputMode: 'numeric', maxLength: 9, pattern: '[0-9]{9}' },
    { campo: 'region', etiqueta: 'Región', autoComplete: 'address-level1' },
    { campo: 'ciudad', etiqueta: 'Ciudad', autoComplete: 'address-level2' },
    { campo: 'comuna', etiqueta: 'Comuna', autoComplete: 'address-level3' },
    { campo: 'calle', etiqueta: 'Calle', autoComplete: 'address-line1', maxLength: 150 },
    { campo: 'numero', etiqueta: 'Número', maxLength: 20 },
];

export default function Checkout({ carrito, codigoCupon, usuario, carritoValido = true, finalizarCompra }) {
    const navegar = useNavigate();
    const enCurso = useRef(false);
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState('');
    const [datos, setDatos] = useState(() => ({
        nombre: usuario?.nombre ?? '', email: usuario?.email ?? '', telefono: '',
        region: '', ciudad: '', comuna: '', calle: '', numero: '', metodoPago: 'TARJETA',
    }));

    async function confirmar(evento) {
        evento.preventDefault();
        if (enCurso.current || !carritoValido || carrito.length === 0) return;
        const entrega = Object.fromEntries(Object.entries(datos).map(([campo, valor]) => [campo, valor.trim()]));
        if (camposEntrega.some(({ campo }) => !entrega[campo])) {
            setError('Completa todos los datos de entrega.');
            return;
        }
        enCurso.current = true;
        setEnviando(true);
        setError('');
        try {
            const orden = await finalizarCompra(entrega);
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
                        <div className="card border-0 shadow-sm rounded-4 p-4 mb-3">
                            <h2 className="h4">Datos de entrega</h2>
                            <div className="row g-3">
                                {camposEntrega.map(({ campo, etiqueta, maxLength = 100, ...atributos }) => (
                                    <div key={campo} className="col-md-6">
                                        <label className="form-label" htmlFor={'checkout-' + campo}>{etiqueta}</label>
                                        <input {...atributos} className="form-control" id={'checkout-' + campo}
                                            value={datos[campo]} maxLength={maxLength} disabled={enviando} required
                                            onChange={evento => setDatos(actual => ({ ...actual, [campo]: evento.target.value }))} />
                                    </div>
                                ))}
                                <div className="col-12">
                                    <label className="form-label" htmlFor="checkout-metodo">Método de pago preferido</label>
                                    <select className="form-select" id="checkout-metodo" value={datos.metodoPago} disabled={enviando}
                                        onChange={evento => setDatos({ ...datos, metodoPago: evento.target.value })}>
                                        <option value="TARJETA">Tarjeta</option>
                                        <option value="TRANSFERENCIA">Transferencia</option>
                                    </select>
                                    <p className="form-text mb-0">El pedido quedará pendiente de pago.</p>
                                </div>
                            </div>
                        </div>
                        {codigoCupon && <p>El servidor validará el cupón {codigoCupon} al confirmar.</p>}
                        {!carritoValido && <p role="alert">Revisa las cantidades disponibles en tu carrito.</p>}
                        {error && <p className="alert alert-danger" role="alert">{error}</p>}
                        <button className="btn btn-success me-3" disabled={!carritoValido || enviando}>
                            {enviando ? 'Creando pedido…' : 'Crear pedido'}
                        </button>
                        <Link to="/carrito">Editar carrito</Link>
                    </section>
                    <section className="col-lg-4">
                        <div className="card border-0 shadow-sm rounded-4 p-4">
                            <h2 className="h4">Resumen</h2>
                            <ul className="list-unstyled d-grid gap-3">
                                {carrito.map(item => (
                                    <li key={item.id} className="d-flex align-items-center gap-3">
                                        <ImagenProducto producto={item} className="orden-item-imagen rounded-3 border bg-light" />
                                        <div>
                                            <div className="fw-semibold">{item.nombre}</div>
                                            <small>{item.cantidad} × ${item.precio.toLocaleString('es-CL')}</small>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <ResumenCompra resumen={calcularResumen(carrito)} estimado />
                        </div>
                    </section>
                </form>
            )}
        </main>
    );
}