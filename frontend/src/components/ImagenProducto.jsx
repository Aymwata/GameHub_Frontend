export default function ImagenProducto({ producto, className }) {
    if (!producto.imagen) {
        return (
            <div className={className + ' producto-sin-imagen bg-light text-muted'}>
                Sin imagen disponible
            </div>
        );
    }

    const src = /^(https?:\/\/|\/)/.test(producto.imagen) ? producto.imagen : '/' + producto.imagen;
    return <img src={src} alt={producto.nombre} className={className} />;
}
