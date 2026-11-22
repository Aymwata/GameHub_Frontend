// Presenta los mismos importes en el carrito y el checkout.
function ResumenCompra({ resumen, estimado = false }) {
    return (
        <dl className="resumen-precios">
            <div>
                <dt>Subtotal</dt>
                <dd>${resumen.subtotal.toLocaleString('es-CL')}</dd>
            </div>

            {!estimado && <div>
                <dt>Descuento</dt>
                <dd>−${resumen.descuento.toLocaleString('es-CL')}</dd>
            </div>}

            <div className="resumen-total">
                <dt>{estimado ? 'Total estimado' : 'Total'}</dt>
                <dd>${resumen.total.toLocaleString('es-CL')}</dd>
            </div>
        </dl>
    );
}

export default ResumenCompra;
