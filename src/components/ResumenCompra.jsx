import { productos, cupones } from '../data/datos.js';
import { calcularSubtotal, aplicarCupon, calcularTotal, moneda } from '../utils/precios.js';

// Muestra los mismos cálculos en el carrito y en el checkout.
export default function ResumenCompra({ carrito, codigoCupon }) {
    const subtotal = calcularSubtotal(carrito, productos);
    const cupon = cupones.find((item) => item.codigo === codigoCupon);
    const descuento = aplicarCupon(subtotal, cupon);
    const total = calcularTotal(subtotal, descuento);

    return (
        <section aria-label="Resumen de compra">
            <h2 className="h5">Resumen de compra</h2>
            <dl className="totales">
                <div>
                    <dt>Subtotal</dt>
                    <dd>{moneda(subtotal)}</dd>
                </div>
                <div>
                    <dt>Descuento</dt>
                    <dd>−{moneda(descuento)}</dd>
                </div>
                <div className="total-final">
                    <dt>Total</dt>
                    <dd>{moneda(total)}</dd>
                </div>
            </dl>
        </section>
    );
}
