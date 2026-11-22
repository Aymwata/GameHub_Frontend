export default function EstadoCatalogo({ estado, reintentar }) {
    if (estado === 'cargando') return <p role="status">Cargando catálogo…</p>;
    if (estado !== 'error') return null;

    return (
        <div className="alert alert-warning" role="alert">
            <p className="mb-2">No pudimos consultar el catálogo. Intenta nuevamente.</p>
            <button type="button" className="btn btn-outline-dark btn-sm" onClick={reintentar}>Reintentar</button>
        </div>
    );
}
