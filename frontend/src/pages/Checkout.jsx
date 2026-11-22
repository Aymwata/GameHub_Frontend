import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ResumenCompra from '../components/ResumenCompra.jsx';
import { calcularResumen } from '../utils/precios.js';

export default function Checkout({ carrito, codigoCupon, carritoValido = true, finalizarCompra }) {
    const navegar = useNavigate();
    const enCurso = useRef(false);
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState('');

    async function confirmar(evento) {
        evento.preventDefault();
        if (enCurso.current || !carritoValido || carrito.length === 0) return;
        enCurso.current = true;
        setEnviando(true);
        setError('');
        try {
            const orden = await finalizarCompra();
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
                        <ul>{carrito.map(item => <li key={item.id}>{item.nombre} × {item.cantidad}</li>)}</ul>
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
