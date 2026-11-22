import { useEffect, useState } from 'react';
import { solicitar } from '../services/api.js';
import { useSesion } from '../services/sesion.js';

const formularioVacio = { nombre: '', descripcion: '' };

export default function CategoriasAdmin({ onCambio }) {
    const { solicitarConSesion } = useSesion();
    const [categorias, setCategorias] = useState(null);
    const [revision, setRevision] = useState(0);
    const [formulario, setFormulario] = useState(formularioVacio);
    const [editando, setEditando] = useState(null);
    const [error, setError] = useState('');
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        const controlador = new AbortController();
        solicitar('/categories', { signal: controlador.signal })
            .then(datos => { if (!controlador.signal.aborted) setCategorias(datos); })
            .catch(() => { if (!controlador.signal.aborted) setError('No pudimos cargar las categorías.'); });
        return () => controlador.abort();
    }, [revision]);

    function cancelarEdicion() {
        setEditando(null);
        setFormulario(formularioVacio);
    }

    async function actualizar(ruta, opciones) {
        setGuardando(true);
        setError('');
        try {
            await solicitarConSesion(ruta, opciones);
            cancelarEdicion();
            setRevision(actual => actual + 1);
            onCambio();
        } catch (fallo) {
            setError(fallo.status ? fallo.message : 'No se pudo actualizar la categoría.');
        } finally {
            setGuardando(false);
        }
    }

    function guardar(evento) {
        evento.preventDefault();
        actualizar(editando ? '/categories/' + editando : '/categories', {
            method: editando ? 'PUT' : 'POST',
            body: { nombre: formulario.nombre.trim(), descripcion: formulario.descripcion.trim() },
        });
    }

    return (
        <main className="container py-4">
            <h1 className="h2">Gestionar categorías</h1>
            {error && <p className="alert alert-danger" role="alert">{error}</p>}
            <form onSubmit={guardar} className="card p-3 mb-4">
                <h2 className="h5">{editando ? 'Editar categoría' : 'Nueva categoría'}</h2>
                <label htmlFor="nombre-categoria" className="form-label">Nombre</label>
                <input id="nombre-categoria" className="form-control mb-2" required minLength={3} maxLength={50}
                    value={formulario.nombre}
                    onChange={evento => setFormulario({ ...formulario, nombre: evento.target.value })} />
                <label htmlFor="descripcion-categoria" className="form-label">Descripción</label>
                <textarea id="descripcion-categoria" className="form-control mb-3" maxLength={255}
                    value={formulario.descripcion}
                    onChange={evento => setFormulario({ ...formulario, descripcion: evento.target.value })} />
                <div className="d-flex gap-2">
                    <button className="btn btn-success" disabled={guardando}>Guardar</button>
                    {editando && <button className="btn btn-outline-secondary" type="button" onClick={cancelarEdicion}>Cancelar</button>}
                </div>
            </form>
            {!categorias && !error && <p role="status">Cargando categorías…</p>}
            {categorias?.length === 0 && <p>Todavía no hay categorías.</p>}
            <ul className="list-group">
                {categorias?.map(item => (
                    <li className="list-group-item d-flex flex-wrap justify-content-between gap-2" key={item.id}>
                        <div><strong>{item.nombre}</strong>{!item.estado && ' (inactiva)'}<p className="mb-0">{item.descripcion}</p></div>
                        <div className="d-flex align-items-center gap-2">
                            <button type="button" className="btn btn-outline-dark btn-sm" disabled={guardando}
                                onClick={() => {
                                    setEditando(item.id);
                                    setFormulario({ nombre: item.nombre, descripcion: item.descripcion ?? '' });
                                }}>Editar</button>
                            {item.estado && <button type="button" className="btn btn-outline-danger btn-sm" disabled={guardando}
                                onClick={() => {
                                    if (window.confirm('¿Desactivar la categoría ' + item.nombre + '?')) {
                                        actualizar('/categories/' + item.id, { method: 'DELETE' });
                                    }
                                }}>Desactivar</button>}
                        </div>
                    </li>
                ))}
            </ul>
        </main>
    );
}
