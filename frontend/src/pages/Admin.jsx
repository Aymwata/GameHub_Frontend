import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { categorias } from '../data/categorias.js';
import { obtenerHeadersAuth } from '../services/autenticacion.js';

const API_PRODUCTOS = 'http://localhost:8080/api/v1/productos';

function Admin({ sesion, catalogo, setCatalogo, ordenes }) {

    const [vistaActiva, setVistaActiva] = useState('productos');
    const [editandoId, setEditandoId] = useState(null);
    const [mensaje, setMensaje] = useState('');

    const [nombre, setNombre] = useState('');
    const [precio, setPrecio] = useState('');
    const [stock, setStock] = useState('');
    const [categoria, setCategoria] = useState('perifericos');
    const [marca, setMarca] = useState('samsung');
    const [imagen, setImagen] = useState('assets/images/monitorSamsung.jpg');
    const [descripcion, setDescripcion] = useState('');


    if (!sesion || sesion.rol !== 'ADMIN') {
        return <Navigate to="/login" replace />;
    }

    function limpiarFormulario() {
        setEditandoId(null);
        setNombre('');
        setPrecio('');
        setStock('');
        setCategoria('perifericos');
        setMarca('samsung');
        setImagen('assets/images/monitorSamsung.jpg');
        setDescripcion('');
    }

    function cargarProductoParaEditar(producto) {
        setEditandoId(producto.id);
        setNombre(producto.nombre);
        setPrecio(String(producto.precio));
        setStock(String(producto.stock));
        setCategoria(producto.categoria);
        setMarca(producto.marca);
        setImagen(producto.imagen);
        setDescripcion(producto.descripcion || '');
    }

    async function guardarProducto(evento) {
        evento.preventDefault();
        setMensaje('');

        const datosProducto = {
            nombre: nombre.trim(),
            precio: Number(precio),
            stock: Number(stock),
            categoria,
            marca,
            imagen: imagen.trim(),
            descripcion: descripcion.trim()
        };

        if (!datosProducto.nombre || datosProducto.precio <= 0) {
            setMensaje('Completa el nombre y un precio válido.');
            return;
        }

        try {
            if (editandoId) {

                await fetch(`${API_PRODUCTOS}/${editandoId}`, {
                    method: 'PUT',
                    headers: obtenerHeadersAuth(),
                    body: JSON.stringify(datosProducto)
                }).catch(() => null);

                setCatalogo(
                    catalogo.map(item =>
                        item.id === editandoId ? { ...item, ...datosProducto } : item
                    )
                );
                setMensaje('Producto actualizado correctamente.');
            } else {

                const respuesta = await fetch(API_PRODUCTOS, {
                    method: 'POST',
                    headers: obtenerHeadersAuth(),
                    body: JSON.stringify(datosProducto)
                }).catch(() => null);

                const creado = respuesta && respuesta.ok
                    ? await respuesta.json()
                    : { ...datosProducto, id: Date.now() };

                setCatalogo([...catalogo, creado]);
                setMensaje('Producto agregado al catálogo.');
            }

            limpiarFormulario();
        } catch {
            setMensaje('Error al guardar el producto.');
        }
    }

    async function eliminarProducto(id) {
        await fetch(`${API_PRODUCTOS}/${id}`, {
            method: 'DELETE',
            headers: obtenerHeadersAuth()
        }).catch(() => null);

        setCatalogo(catalogo.filter(item => item.id !== id));
        setMensaje('Producto eliminado.');
    }

    return (
        <main>
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
                <h1 className="mb-0">Panel de Administración</h1>

                <div className="btn-group" role="group" aria-label="Secciones de administración">
                    <button
                        type="button"
                        className={`btn ${vistaActiva === 'productos' ? 'btn-success' : 'btn-outline-success'}`}
                        onClick={() => setVistaActiva('productos')}
                    >
                        Productos ({catalogo.length})
                    </button>
                    <button
                        type="button"
                        className={`btn ${vistaActiva === 'ordenes' ? 'btn-success' : 'btn-outline-success'}`}
                        onClick={() => setVistaActiva('ordenes')}
                    >
                        Órdenes ({ordenes.length})
                    </button>
                </div>
            </div>

            {mensaje && (
                <div className="alert alert-success" role="status">
                    {mensaje}
                </div>
            )}

            {vistaActiva === 'productos' && (
                <>
                    {/* Formulario para Crear / Editar Producto */}
                    <section className="card p-4 mb-4">
                        <h2 className="h4 mb-3">
                            {editandoId ? 'Editar producto' : 'Agregar nuevo producto'}
                        </h2>

                        <form onSubmit={guardarProducto} className="row g-3">
                            <div className="col-md-6">
                                <label htmlFor="adm-nombre" className="form-label fw-bold">
                                    Nombre del producto
                                </label>
                                <input
                                    id="adm-nombre"
                                    type="text"
                                    className="form-control"
                                    value={nombre}
                                    onChange={e => setNombre(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="col-md-3">
                                <label htmlFor="adm-precio" className="form-label fw-bold">
                                    Precio (CLP)
                                </label>
                                <input
                                    id="adm-precio"
                                    type="number"
                                    min="1"
                                    className="form-control"
                                    value={precio}
                                    onChange={e => setPrecio(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="col-md-3">
                                <label htmlFor="adm-stock" className="form-label fw-bold">
                                    Stock
                                </label>
                                <input
                                    id="adm-stock"
                                    type="number"
                                    min="0"
                                    className="form-control"
                                    value={stock}
                                    onChange={e => setStock(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="col-md-4">
                                <label htmlFor="adm-categoria" className="form-label fw-bold">
                                    Categoría
                                </label>
                                <select
                                    id="adm-categoria"
                                    className="form-select"
                                    value={categoria}
                                    onChange={e => setCategoria(e.target.value)}
                                >
                                    {categorias.map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-md-4">
                                <label htmlFor="adm-marca" className="form-label fw-bold">
                                    Marca
                                </label>
                                <select
                                    id="adm-marca"
                                    className="form-select"
                                    value={marca}
                                    onChange={e => setMarca(e.target.value)}
                                >
                                    <option value="samsung">Samsung</option>
                                    <option value="lenovo">Lenovo</option>
                                    <option value="msi">MSI</option>
                                    <option value="esgaming">Esgaming</option>
                                </select>
                            </div>

                            <div className="col-md-4">
                                <label htmlFor="adm-imagen" className="form-label fw-bold">
                                    Ruta de imagen
                                </label>
                                <input
                                    id="adm-imagen"
                                    type="text"
                                    className="form-control"
                                    value={imagen}
                                    onChange={e => setImagen(e.target.value)}
                                />
                            </div>

                            <div className="col-12">
                                <label htmlFor="adm-descripcion" className="form-label fw-bold">
                                    Descripción
                                </label>
                                <textarea
                                    id="adm-descripcion"
                                    className="form-control"
                                    rows="2"
                                    value={descripcion}
                                    onChange={e => setDescripcion(e.target.value)}
                                />
                            </div>

                            <div className="col-12 d-flex gap-2">
                                <button type="submit" className="btn btn-success">
                                    {editandoId ? 'Guardar cambios' : 'Crear producto'}
                                </button>
                                {editandoId && (
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={limpiarFormulario}
                                    >
                                        Cancelar edición
                                    </button>
                                )}
                            </div>
                        </form>
                    </section>

                    {/* Tabla de Inventario */}
                    <div className="table-responsive">
                        <table className="table table-bordered align-middle">
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Producto</th>
                                <th>Categoría</th>
                                <th>Precio</th>
                                <th>Stock</th>
                                <th>Acciones</th>
                            </tr>
                            </thead>
                            <tbody>
                            {catalogo.map(producto => (
                                <tr key={producto.id}>
                                    <td>{producto.id}</td>
                                    <td>{producto.nombre}</td>
                                    <td className="text-capitalize">{producto.categoria}</td>
                                    <td>${producto.precio.toLocaleString('es-CL')}</td>
                                    <td>
                                            <span
                                                className={`badge ${
                                                    producto.stock === 0
                                                        ? 'bg-danger'
                                                        : producto.stock <= 5
                                                            ? 'bg-warning text-dark'
                                                            : 'bg-success'
                                                }`}
                                            >
                                                {producto.stock} un.
                                            </span>
                                    </td>
                                    <td>
                                        <div className="d-flex gap-2">
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-success"
                                                onClick={() => cargarProductoParaEditar(producto)}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => eliminarProducto(producto.id)}
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {vistaActiva === 'ordenes' && (
                <section>
                    {ordenes.length === 0 ? (
                        <p className="text-muted">Aún no se han registrado ventas.</p>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-bordered align-middle">
                                <thead>
                                <tr>
                                    <th>Orden</th>
                                    <th>Fecha</th>
                                    <th>Cliente</th>
                                    <th>Estado</th>
                                    <th>Total</th>
                                </tr>
                                </thead>
                                <tbody>
                                {ordenes.map(orden => (
                                    <tr key={orden.id}>
                                        <td className="fw-bold">{orden.id}</td>
                                        <td>{new Date(orden.fecha).toLocaleDateString('es-CL')}</td>
                                        <td>{orden.despacho?.nombre || 'Cliente'}</td>
                                        <td>{orden.estado}</td>
                                        <td className="fw-bold">
                                            ${orden.total.toLocaleString('es-CL')}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            )}
        </main>
    );
}

export default Admin;