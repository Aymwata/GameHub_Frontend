import { Fragment, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import EstadoCatalogo from '../components/EstadoCatalogo.jsx';
import { useSesion } from '../services/sesion.js';

const productoInicial = {
    nombre: '', marca: '', modelo: '', precio: '', categoriaId: '', descripcion: '', imagen: '', especificaciones: '',
};

const cuponInicial = {
    codigo: '', tipo: 'PORCENTAJE', valor: '', fechaInicio: '', fechaFin: '', montoMinimo: '', usosMaximos: '',
};

function leerEspecificaciones(texto) {
    const lineas = texto.split(/\r?\n/).map(linea => linea.trim()).filter(Boolean);
    const pares = lineas.map(linea => {
        const separador = linea.indexOf(':');
        return separador < 0 ? ['', ''] : [linea.slice(0, separador).trim(), linea.slice(separador + 1).trim()];
    });
    if (pares.length > 40 || pares.some(([nombre, valor]) => !nombre || nombre.length > 80 || !valor || valor.length > 500)) {
        return null;
    }
    return Object.fromEntries(pares);
}

export default function Admin({ catalogo, categorias, estadoCatalogo, onCambio }) {
    const { solicitarConSesion } = useSesion();
    const [vista, setVista] = useState('productos');
    const [cupon, setCupon] = useState(cuponInicial);
    const [producto, setProducto] = useState(productoInicial);
    const [edicion, setEdicion] = useState(null);
    const [registroStock, setRegistroStock] = useState({ productId: '', quantity: '', location: '' });
    const [retiroStock, setRetiroStock] = useState({ productId: '', quantity: '' });
    const [aviso, setAviso] = useState(null);
    const [guardando, setGuardando] = useState(false);

    async function guardar(ruta, body, mensaje, limpiar, method = 'POST') {
        setGuardando(true);
        setAviso(null);
        try {
            await solicitarConSesion(ruta, { method, body });
            limpiar();
            onCambio();
            setAviso({ tipo: 'success', mensaje });
        } catch (error) {
            setAviso({ tipo: 'danger', mensaje: error.status ? error.message : 'No pudimos completar la operación.' });
        } finally {
            setGuardando(false);
        }
    }

    function validarEspecificaciones(texto) {
        const especificaciones = leerEspecificaciones(texto);
        if (!especificaciones) {
            setAviso({ tipo: 'danger', mensaje: 'Escribe hasta 40 especificaciones, una por línea, con el formato Nombre: valor.' });
        }
        return especificaciones;
    }

    function crearProducto(evento) {
        evento.preventDefault();
        const especificaciones = validarEspecificaciones(producto.especificaciones);
        if (!especificaciones) return;
        guardar('/products', {
            nombre: producto.nombre.trim(),
            marca: producto.marca.trim(),
            modelo: producto.modelo.trim(),
            descripcion: producto.descripcion.trim(),
            precio: Number(producto.precio),
            categoriaId: Number(producto.categoriaId),
            imagen: producto.imagen.trim() || undefined,
            especificaciones,
        }, 'Producto agregado al catálogo.', () => setProducto(productoInicial));
    }

    function guardarEdicion(evento) {
        evento.preventDefault();
        const especificaciones = validarEspecificaciones(edicion.texto);
        if (!especificaciones) return;
        guardar('/products/' + edicion.id + '/detalles-tecnicos', { especificaciones },
            'Especificaciones actualizadas.', () => setEdicion(null), 'PUT');
    }

    function ingresarStock(evento) {
        evento.preventDefault();
        guardar('/inventory/setup', {
            productId: Number(registroStock.productId),
            quantity: Number(registroStock.quantity),
            location: registroStock.location.trim(),
        }, 'Stock registrado.', () => setRegistroStock(actual => ({ ...actual, quantity: '' })));
    }

    function retirarStock(evento) {
        evento.preventDefault();
        guardar('/inventory/remove', {
            productId: Number(retiroStock.productId),
            quantity: Number(retiroStock.quantity),
            location: 'Ajuste administrativo',
        }, 'Stock rebajado correctamente.', () => setRetiroStock(actual => ({ ...actual, quantity: '' })), 'PUT');
    }

    async function crearCupon(evento) {
        evento.preventDefault();
        setGuardando(true);
        setAviso(null);
        try {
            await solicitarConSesion('/promotions', {
                method: 'POST',
                body: {
                    codigo: cupon.codigo.trim().toUpperCase(),
                    tipo: cupon.tipo,
                    valor: Number(cupon.valor),
                    fechaInicio: cupon.fechaInicio,
                    fechaFin: cupon.fechaFin,
                    montoMinimo: cupon.montoMinimo === '' ? null : Number(cupon.montoMinimo),
                    usosMaximos: Number(cupon.usosMaximos),
                },
            });
            setAviso({ tipo: 'success', mensaje: 'Cupón ' + cupon.codigo.trim().toUpperCase() + ' creado correctamente.' });
            setCupon(cuponInicial);
        } catch (error) {
            setAviso({ tipo: 'danger', mensaje: error.status ? error.message : 'No pudimos crear el cupón.' });
        } finally {
            setGuardando(false);
        }
    }

    return (
        <main className="container py-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <h1 className="h2 mb-0">Panel de Administración</h1>
                <div className="d-flex flex-wrap gap-2" aria-label="Secciones de administración">
                    <button className="btn btn-outline-success" type="button" aria-pressed={vista === 'productos'}
                        onClick={() => setVista('productos')}>Productos</button>
                    <button className="btn btn-outline-success" type="button" aria-pressed={vista === 'ordenes'}
                        onClick={() => setVista('ordenes')}>Órdenes</button>
                    <button className="btn btn-outline-success" type="button" aria-pressed={vista === 'cupones'}
                        onClick={() => setVista('cupones')}>Cupones</button>
                    <Link className="btn btn-outline-success" to="/admin/categorias">Gestionar categorías</Link>
                </div>
            </div>

            {vista === 'ordenes' ? <OrdenesAdmin solicitarConSesion={solicitarConSesion} catalogo={catalogo} /> : vista === 'cupones' ? (
                <>
                    {aviso && <p className={'alert alert-' + aviso.tipo} role={aviso.tipo === 'danger' ? 'alert' : 'status'}>{aviso.mensaje}</p>}
                    <form className="card border-0 shadow-sm rounded-4 p-4" onSubmit={crearCupon}>
                        <h2 className="h4">Crear cupón de descuento</h2>
                        <p className="text-muted">El cupón quedará disponible para usar cuando esté dentro de su vigencia.</p>
                        <fieldset className="row g-3" disabled={guardando}>
                            <div className="col-md-6">
                                <label className="form-label" htmlFor="cupon-codigo">Código</label>
                                <input className="form-control" id="cupon-codigo" required maxLength={50}
                                    placeholder="GAME20" value={cupon.codigo}
                                    onChange={evento => setCupon({ ...cupon, codigo: evento.target.value.toUpperCase() })} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label" htmlFor="cupon-tipo">Tipo de descuento</label>
                                <select className="form-select" id="cupon-tipo" value={cupon.tipo}
                                    onChange={evento => setCupon({ ...cupon, tipo: evento.target.value })}>
                                    <option value="PORCENTAJE">Porcentaje</option>
                                    <option value="MONTO_FIJO">Monto fijo</option>
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label" htmlFor="cupon-valor">Valor {cupon.tipo === 'PORCENTAJE' ? '(%)' : '(CLP)'}</label>
                                <input className="form-control" id="cupon-valor" type="number" min="0.01"
                                    max={cupon.tipo === 'PORCENTAJE' ? 100 : undefined} step="0.01" required value={cupon.valor}
                                    onChange={evento => setCupon({ ...cupon, valor: evento.target.value })} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label" htmlFor="cupon-usos">Usos máximos</label>
                                <input className="form-control" id="cupon-usos" type="number" min="1" step="1" required value={cupon.usosMaximos}
                                    onChange={evento => setCupon({ ...cupon, usosMaximos: evento.target.value })} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label" htmlFor="cupon-inicio">Válido desde</label>
                                <input className="form-control" id="cupon-inicio" type="datetime-local" required value={cupon.fechaInicio}
                                    onChange={evento => setCupon({ ...cupon, fechaInicio: evento.target.value })} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label" htmlFor="cupon-fin">Válido hasta</label>
                                <input className="form-control" id="cupon-fin" type="datetime-local" min={cupon.fechaInicio || undefined}
                                    required value={cupon.fechaFin} onChange={evento => setCupon({ ...cupon, fechaFin: evento.target.value })} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label" htmlFor="cupon-minimo">Compra mínima (CLP, opcional)</label>
                                <input className="form-control" id="cupon-minimo" type="number" min="0" step="1" value={cupon.montoMinimo}
                                    onChange={evento => setCupon({ ...cupon, montoMinimo: evento.target.value })} />
                            </div>
                            <div className="col-12"><button className="btn btn-success">{guardando ? 'Creando cupón…' : 'Crear cupón'}</button></div>
                        </fieldset>
                    </form>
                </>
            ) : (
                <>
                    <EstadoCatalogo {...estadoCatalogo} />
                    {aviso && <p className={'alert alert-' + aviso.tipo} role={aviso.tipo === 'danger' ? 'alert' : 'status'}>{aviso.mensaje}</p>}
                    <div className="row g-3 mb-4">
                        <div className="col-lg-7">
                            <form className="card border-0 shadow-sm rounded-4 p-4" onSubmit={crearProducto}>
                                <h2 className="h5">Nuevo producto</h2>
                                <fieldset className="row g-3" disabled={guardando || estadoCatalogo.estado !== 'listo'}>
                                    {['nombre', 'marca', 'modelo', 'precio'].map(campo => (
                                        <div key={campo} className="col-sm-6">
                                            <label className="form-label text-capitalize" htmlFor={'producto-' + campo}>{campo}</label>
                                            <input className="form-control" id={'producto-' + campo} required
                                                type={campo === 'precio' ? 'number' : 'text'}
                                                min={campo === 'precio' ? 0 : undefined} value={producto[campo]}
                                                onChange={evento => setProducto({ ...producto, [campo]: evento.target.value })} />
                                        </div>
                                    ))}
                                    <div className="col-12">
                                        <label className="form-label" htmlFor="producto-categoria">Categoría</label>
                                        <select className="form-select" id="producto-categoria" required value={producto.categoriaId}
                                            onChange={evento => setProducto({ ...producto, categoriaId: evento.target.value })}>
                                            <option value="">Selecciona una categoría</option>
                                            {categorias.map(categoria => <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label" htmlFor="producto-descripcion">Descripción</label>
                                        <textarea className="form-control" id="producto-descripcion" value={producto.descripcion}
                                            onChange={evento => setProducto({ ...producto, descripcion: evento.target.value })} />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label" htmlFor="producto-imagen">Imagen</label>
                                        <input className="form-control" id="producto-imagen" maxLength={600}
                                            placeholder="/assets/images/mi-producto.jpg" value={producto.imagen}
                                            onChange={evento => setProducto({ ...producto, imagen: evento.target.value })} />
                                        <small className="form-text">Usa una ruta del proyecto o una URL de imagen.</small>
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label" htmlFor="producto-especificaciones">Especificaciones</label>
                                        <textarea className="form-control" id="producto-especificaciones" rows={3}
                                            placeholder="Memoria: 16 GB" value={producto.especificaciones}
                                            onChange={evento => setProducto({ ...producto, especificaciones: evento.target.value })} />
                                        <small className="form-text">Una por línea, con el formato Nombre: valor.</small>
                                    </div>
                                    <div className="col-12"><button className="btn btn-success">Agregar producto</button></div>
                                </fieldset>
                            </form>
                        </div>

                        <div className="col-lg-5">
                            <form className="card border-0 shadow-sm rounded-4 p-4 mb-3" onSubmit={ingresarStock}>
                                <h2 className="h5">Ingresar stock</h2>
                                <fieldset disabled={guardando || estadoCatalogo.estado !== 'listo'}>
                                    <label className="form-label" htmlFor="stock-producto">Producto</label>
                                    <select className="form-select mb-3" id="stock-producto" required value={registroStock.productId}
                                        onChange={evento => setRegistroStock({ ...registroStock, productId: evento.target.value })}>
                                        <option value="">Selecciona un producto</option>
                                        {catalogo.map(item => <option key={item.id} value={item.id}>{item.nombre}</option>)}
                                    </select>
                                    <label className="form-label" htmlFor="stock-cantidad">Unidades</label>
                                    <input className="form-control mb-3" id="stock-cantidad" type="number" min={1} required
                                        value={registroStock.quantity} onChange={evento => setRegistroStock({ ...registroStock, quantity: evento.target.value })} />
                                    <label className="form-label" htmlFor="stock-bodega">Bodega</label>
                                    <input className="form-control mb-3" id="stock-bodega" minLength={3} maxLength={50} required
                                        value={registroStock.location} onChange={evento => setRegistroStock({ ...registroStock, location: evento.target.value })} />
                                    <button className="btn btn-success">Registrar stock</button>
                                </fieldset>
                            </form>
                            <form className="card border-0 shadow-sm rounded-4 p-4" onSubmit={retirarStock}>
                                <h2 className="h5">Rebajar stock</h2>
                                <fieldset disabled={guardando || estadoCatalogo.estado !== 'listo'}>
                                    <label className="form-label" htmlFor="retiro-producto">Producto</label>
                                    <select className="form-select mb-3" id="retiro-producto" required value={retiroStock.productId}
                                        onChange={evento => setRetiroStock({ ...retiroStock, productId: evento.target.value })}>
                                        <option value="">Selecciona un producto</option>
                                        {catalogo.map(item => <option key={item.id} value={item.id}>{item.nombre}</option>)}
                                    </select>
                                    <label className="form-label" htmlFor="retiro-cantidad">Unidades a rebajar</label>
                                    <input className="form-control mb-3" id="retiro-cantidad" type="number" min={1} required
                                        value={retiroStock.quantity} onChange={evento => setRetiroStock({ ...retiroStock, quantity: evento.target.value })} />
                                    <button className="btn btn-outline-danger">Rebajar stock</button>
                                </fieldset>
                            </form>
                        </div>
                    </div>

                    <h2 className="h5">Catálogo actual</h2>
                    {estadoCatalogo.estado === 'listo' && catalogo.length === 0 && <p>Todavía no hay productos.</p>}
                    <ul className="list-group">
                        {catalogo.map(item => (
                            <li className="list-group-item" key={item.id}>
                                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                                    <Link to={'/producto/' + item.id}>{item.nombre}</Link>
                                    <span>{item.stock} unidades · ${item.precio.toLocaleString('es-CL')}</span>
                                    <button type="button" className="btn btn-outline-success btn-sm" disabled={guardando}
                                        onClick={() => setEdicion({
                                            id: item.id,
                                            texto: Object.entries(item.especificaciones ?? {}).map(([clave, valor]) => clave + ': ' + valor).join('\n'),
                                        })}>Editar especificaciones</button>
                                </div>
                                {edicion?.id === item.id && (
                                    <form className="mt-3" onSubmit={guardarEdicion}>
                                        <label className="form-label" htmlFor="editar-especificaciones">Especificaciones de {item.nombre}</label>
                                        <textarea id="editar-especificaciones" className="form-control mb-2" rows={4}
                                            value={edicion.texto} disabled={guardando}
                                            onChange={evento => setEdicion({ ...edicion, texto: evento.target.value })} />
                                        <button className="btn btn-success me-2" disabled={guardando}>Guardar especificaciones</button>
                                        <button className="btn btn-outline-secondary" type="button" disabled={guardando}
                                            onClick={() => setEdicion(null)}>Cancelar</button>
                                    </form>
                                )}
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </main>
    );
}

function OrdenesAdmin({ solicitarConSesion, catalogo }) {
    const [ordenes, setOrdenes] = useState(null);
    const [error, setError] = useState('');
    const [aviso, setAviso] = useState('');
    const [ordenAbierta, setOrdenAbierta] = useState(null);
    const [procesando, setProcesando] = useState(null);

    function estaCancelada(orden) {
        return ['CANCELADA', 'CANCELED'].includes(String(orden.estado).toUpperCase());
    }

    useEffect(() => {
        const controlador = new AbortController();
        solicitarConSesion('/orders', { signal: controlador.signal })
            .then(datos => { if (!controlador.signal.aborted) setOrdenes(datos.filter(orden => !estaCancelada(orden))); })
            .catch(() => { if (!controlador.signal.aborted) setError('No pudimos consultar las órdenes.'); });
        return () => controlador.abort();
    }, [solicitarConSesion]);

    async function cambiarEstado(orden, accion) {
        if (accion === 'rechazar' && !window.confirm('¿Rechazar y cancelar la orden #' + orden.id + '?')) return;
        setProcesando(orden.id);
        setError('');
        setAviso('');
        try {
            const actualizada = accion === 'confirmar'
                ? await solicitarConSesion('/orders/' + orden.id + '/status?estado=PAGADA', { method: 'PUT' })
                : await solicitarConSesion('/orders/' + orden.id + '/cancel', { method: 'PUT' });
            if (accion === 'rechazar' || estaCancelada(actualizada)) {
                setOrdenes(actuales => actuales.filter(item => item.id !== orden.id));
                setOrdenAbierta(actual => actual === orden.id ? null : actual);
            } else {
                setOrdenes(actuales => actuales.map(item => item.id === actualizada.id ? actualizada : item));
            }
            setAviso(accion === 'confirmar' ? 'La orden #' + orden.id + ' fue confirmada.' : 'La orden #' + orden.id + ' fue rechazada y cancelada.');
        } catch (fallo) {
            setError(fallo.status ? fallo.message : 'No pudimos actualizar la orden. Intenta nuevamente.');
        } finally {
            setProcesando(null);
        }
    }

    if (!ordenes && error) return <p className="alert alert-danger" role="alert">{error}</p>;
    if (!ordenes) return <p role="status">Cargando órdenes…</p>;

    return (
        <>
        {aviso && <p className="alert alert-success" role="status">{aviso}</p>}
        {error && <p className="alert alert-danger" role="alert">{error}</p>}
        {!ordenes.length ? <p>No hay órdenes activas para administrar.</p> : <div className="table-responsive">
            <table className="table table-hover align-middle">
                <thead><tr><th>Orden</th><th>Cliente</th><th>Estado</th><th>Total</th><th>Acciones</th></tr></thead>
                <tbody>
                    {[...ordenes].sort((a, b) => b.id - a.id).map(orden => (
                        <Fragment key={orden.id}>
                            <tr><th scope="row">#{orden.id}</th>
                                <td>{orden.datosCheckout?.nombre || '#' + orden.usuarioId}</td><td>{orden.estado}</td>
                                <td>${(orden.total ?? 0).toLocaleString('es-CL')}</td>
                                <td><div className="d-flex flex-wrap gap-2">
                                    <button className="btn btn-outline-secondary btn-sm" type="button"
                                        aria-expanded={ordenAbierta === orden.id}
                                        onClick={() => setOrdenAbierta(actual => actual === orden.id ? null : orden.id)}>
                                        {ordenAbierta === orden.id ? 'Ocultar detalle' : 'Ver detalle'}
                                    </button>
                                    {orden.estado === 'PENDIENTE' && <>
                                        <button className="btn btn-success btn-sm" type="button" disabled={procesando === orden.id}
                                            onClick={() => cambiarEstado(orden, 'confirmar')}>{procesando === orden.id ? 'Guardando…' : 'Confirmar'}</button>
                                        <button className="btn btn-outline-danger btn-sm" type="button" disabled={procesando === orden.id}
                                            onClick={() => cambiarEstado(orden, 'rechazar')}>Rechazar</button>
                                    </>}
                                </div></td>
                            </tr>
                            {ordenAbierta === orden.id && <tr className="table-light"><td colSpan="5">
                                <section className="p-2" aria-label={'Detalle de la orden ' + orden.id}>
                                    <h3 className="h6 fw-bold">Datos de la compra</h3>
                                    <div className="row g-2 mb-3">
                                        <div className="col-md-6"><strong>Nombre:</strong> {orden.datosCheckout?.nombre || 'No informado'}</div>
                                        <div className="col-md-6 text-break"><strong>Correo:</strong> {orden.datosCheckout?.email || 'No informado'}</div>
                                        <div className="col-md-6"><strong>Teléfono:</strong> {orden.datosCheckout?.telefono || 'No informado'}</div>
                                        <div className="col-md-6"><strong>Dirección:</strong> {[orden.datosCheckout?.direccion, orden.datosCheckout?.comuna, orden.datosCheckout?.ciudad, orden.datosCheckout?.region].filter(Boolean).join(', ') || 'No informada'}</div>
                                        <div className="col-md-6"><strong>Método de pago:</strong> {orden.datosCheckout?.metodoPago || 'No informado'}</div>
                                        <div className="col-md-6"><strong>Fecha:</strong> {orden.fechaCreacion ? new Date(orden.fechaCreacion).toLocaleString('es-CL') : 'No informada'}</div>
                                        <div className="col-md-6"><strong>Subtotal:</strong> ${(orden.subtotal ?? 0).toLocaleString('es-CL')}</div>
                                    </div>
                                    <h4 className="h6 fw-bold">Productos</h4>
                                    <ul className="mb-3">{(orden.detalles ?? []).map(detalle => {
                                        const producto = catalogo.find(item => item.id === detalle.productoId);
                                        return <li key={detalle.id}>{producto?.nombre ?? 'Producto #' + detalle.productoId} · {detalle.cantidad} × ${(detalle.precioUnitario ?? 0).toLocaleString('es-CL')}</li>;
                                    })}</ul>
                                    {orden.codigoPromocion && <p className="mb-1"><strong>Cupón:</strong> {orden.codigoPromocion}</p>}
                                    <p className="mb-1"><strong>Descuento:</strong> ${(orden.descuento ?? 0).toLocaleString('es-CL')}</p>
                                    <p className="mb-0"><strong>Total:</strong> ${(orden.total ?? 0).toLocaleString('es-CL')}</p>
                                </section>
                            </td></tr>}
                        </Fragment>
                    ))}
                </tbody>
            </table>
        </div>}
        </>
    );
}
