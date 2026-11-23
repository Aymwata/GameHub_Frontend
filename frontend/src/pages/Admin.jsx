import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import EstadoCatalogo from '../components/EstadoCatalogo.jsx';
import { useSesion } from '../services/sesion.js';

const productoInicial = {
    nombre: '', marca: '', modelo: '', precio: '', categoriaId: '', descripcion: '', imagen: '', especificaciones: '',
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
    const [producto, setProducto] = useState(productoInicial);
    const [edicion, setEdicion] = useState(null);
    const [registroStock, setRegistroStock] = useState({ productId: '', quantity: '', location: '' });
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

    return (
        <main className="container py-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <h1 className="h2 mb-0">Panel de Administración</h1>
                <div className="d-flex flex-wrap gap-2" aria-label="Secciones de administración">
                    <button className="btn btn-outline-success" type="button" aria-pressed={vista === 'productos'}
                        onClick={() => setVista('productos')}>Productos</button>
                    <button className="btn btn-outline-success" type="button" aria-pressed={vista === 'ordenes'}
                        onClick={() => setVista('ordenes')}>Órdenes</button>
                    <Link className="btn btn-outline-success" to="/admin/categorias">Gestionar categorías</Link>
                </div>
            </div>

            {vista === 'ordenes' ? <OrdenesAdmin solicitarConSesion={solicitarConSesion} /> : (
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
                            <form className="card border-0 shadow-sm rounded-4 p-4" onSubmit={ingresarStock}>
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

function OrdenesAdmin({ solicitarConSesion }) {
    const [ordenes, setOrdenes] = useState(null);
    const [error, setError] = useState('');
    useEffect(() => {
        const controlador = new AbortController();
        solicitarConSesion('/orders', { signal: controlador.signal })
            .then(datos => { if (!controlador.signal.aborted) setOrdenes(datos); })
            .catch(() => { if (!controlador.signal.aborted) setError('No pudimos consultar las órdenes.'); });
        return () => controlador.abort();
    }, [solicitarConSesion]);

    if (error) return <p className="alert alert-danger" role="alert">{error}</p>;
    if (!ordenes) return <p role="status">Cargando órdenes…</p>;
    if (!ordenes.length) return <p>Todavía no hay órdenes registradas.</p>;

    return (
        <div className="table-responsive">
            <table className="table table-hover align-middle">
                <thead><tr><th>Orden</th><th>Cliente</th><th>Estado</th><th>Total</th></tr></thead>
                <tbody>
                    {[...ordenes].sort((a, b) => b.id - a.id).map(orden => (
                        <tr key={orden.id}><th scope="row">#{orden.id}</th>
                            <td>#{orden.usuarioId}</td><td>{orden.estado}</td><td>${orden.total.toLocaleString('es-CL')}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
