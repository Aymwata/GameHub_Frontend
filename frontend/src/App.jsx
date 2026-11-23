import { useEffect, useRef, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { leerCompra, guardarCompra } from './services/almacenamiento.js';
import { cargarCatalogo } from './services/catalogo.js';
import { useSesion } from './services/sesion.js';
import AccesoRequerido from './components/AccesoRequerido.jsx';
import Cabecera from './components/Cabecera.jsx';
import EstadoCatalogo from './components/EstadoCatalogo.jsx';
import Inicio from './pages/Inicio.jsx';
import Catalogo from './pages/Catalogo.jsx';
import Producto from './pages/Producto.jsx';
import Carrito from './pages/Carrito.jsx';
import Checkout from './pages/Checkout.jsx';
import MisOrdenes from './pages/MisOrdenes.jsx';
import CategoriasAdmin from './pages/CategoriasAdmin.jsx';
import Admin from './pages/Admin.jsx';
import Login from './pages/Login.jsx';
import Registro from './pages/Registro.jsx';
import PieDePagina from './components/PieDePagina.jsx';

function App() {
    const { usuario, cerrarSesion, solicitarConSesion } = useSesion();
    const [compra, setCompra] = useState(leerCompra);
    const compraActual = useRef(compra);
    const enviandoPedido = useRef(false);
    const [catalogo, setCatalogo] = useState({ productos: [], categorias: [], estado: 'cargando' });
    const [revision, setRevision] = useState(0);
    const [mensaje, setMensaje] = useState('');
    const { productos, categorias, estado } = catalogo;

    useEffect(() => {
        const peticion = new AbortController();
        cargarCatalogo(peticion.signal).then(datos => {
            if (!peticion.signal.aborted) setCatalogo({ ...datos, estado: 'listo' });
        }).catch(() => {
            if (!peticion.signal.aborted) setCatalogo({ productos: [], categorias: [], estado: 'error' });
        });
        return () => peticion.abort();
    }, [revision]);

    function recargarCatalogo() {
        setRevision(actual => actual + 1);
    }

    function reintentarCatalogo() {
        setCatalogo(actual => ({ ...actual, estado: 'cargando' }));
        recargarCatalogo();
    }

    const productosPorId = new Map(productos.map(producto => [producto.id, producto]));
    const carrito = compra.carrito.map(({ id, cantidad }) => ({
        ...(productosPorId.get(id) ?? { id, nombre: 'Producto #' + id, stock: 0, precio: 0 }),
        cantidad,
    }));
    const cantidadProductos = compra.carrito.reduce((total, producto) => total + producto.cantidad, 0);
    const carritoValido = carrito.every(producto => producto.cantidad <= producto.stock);

    function persistir(carritoNuevo, cupon) {
        const nuevaCompra = { carrito: carritoNuevo, cupon: carritoNuevo.length ? cupon : '' };
        compraActual.current = nuevaCompra;
        setCompra(nuevaCompra);
        setMensaje(guardarCompra(nuevaCompra) ? '' : 'No se pudo guardar el carrito en el navegador.');
    }

    function actualizarCantidad(id, cantidad) {
        const producto = productosPorId.get(id);
        if (!producto || !Number.isInteger(cantidad) || cantidad < 1 || cantidad > producto.stock) {
            setMensaje('La cantidad debe estar entre 1 y el stock disponible.');
            return false;
        }
        const { carrito: lineas, cupon } = compraActual.current;
        const nuevasLineas = lineas.some(linea => linea.id === id)
            ? lineas.map(linea => linea.id === id ? { id, cantidad } : linea)
            : [...lineas, { id, cantidad }];
        persistir(nuevasLineas, cupon);
        return true;
    }

    function agregarProducto(producto, cantidad) {
        const existente = compraActual.current.carrito.find(linea => linea.id === producto.id);
        return actualizarCantidad(producto.id, (existente?.cantidad ?? 0) + cantidad);
    }

    function quitarProducto(id) {
        const { carrito: lineas, cupon } = compraActual.current;
        persistir(lineas.filter(item => item.id !== id), cupon);
    }

    function guardarCupon(codigo) {
        persistir(compraActual.current.carrito, codigo.trim().toUpperCase());
        return true;
    }

    async function finalizarCompra(datosContacto) {
        if (enviandoPedido.current) throw Object.assign(new Error('Ya hay un pedido en curso.'), { status: 409 });
        enviandoPedido.current = true;
        const pedido = compraActual.current;
        let orden;
        try {
            orden = await solicitarConSesion('/orders/me', {
                method: 'POST',
                body: {
                    codigoPromocion: pedido.cupon || undefined,
                    ...datosContacto,
                    detalles: pedido.carrito.map(({ id, cantidad }) => ({ productoId: id, cantidad })),
                },
            });
        } finally {
            enviandoPedido.current = false;
        }
        const compradas = new Map(pedido.carrito.map(({ id, cantidad }) => [id, cantidad]));
        const actual = compraActual.current;
        const pendientes = actual.carrito.map(({ id, cantidad }) => ({
            id, cantidad: cantidad - (compradas.get(id) ?? 0),
        })).filter(item => item.cantidad > 0);
        persistir(pendientes, actual.cupon === pedido.cupon ? '' : actual.cupon);
        recargarCatalogo();
        return orden;
    }

    const estadoCatalogo = { estado, reintentar: reintentarCatalogo };
    const esperarCatalogo = estado !== 'listo' && compra.carrito.length > 0;

    return (
        <>
            <Cabecera cantidad={cantidadProductos} categorias={categorias} usuario={usuario}
                cerrarSesion={() => cerrarSesion().catch(() => setMensaje('No pudimos cerrar la sesión. Intenta nuevamente.'))} />
            {mensaje && <p className="alert alert-warning m-3" role="alert">{mensaje}</p>}
            <Routes>
                <Route path="/login" element={<Login key="cliente" perfil="CLIENTE" />} />
                <Route path="/admin/login" element={<Login key="admin" perfil="ADMIN" />} />
                <Route path="/registro" element={<Registro />} />
                <Route path="/" element={<Inicio productos={productos} categorias={categorias} {...estadoCatalogo} />} />
                <Route path="/catalogo" element={<Catalogo catalogo={productos} categorias={categorias} {...estadoCatalogo} />} />
                <Route path="/producto/:id" element={<Producto catalogo={productos} agregarProducto={agregarProducto} {...estadoCatalogo} />} />
                <Route path="/carrito" element={esperarCatalogo ? <main><EstadoCatalogo {...estadoCatalogo} /></main> : (
                    <Carrito carrito={carrito} codigoCupon={compra.cupon} aplicarCupon={guardarCupon}
                        carritoValido={carritoValido} cambiarCantidad={actualizarCantidad}
                        quitarProducto={quitarProducto} vaciarCarrito={() => persistir([], '')} />
                )} />
                <Route path="/checkout" element={
                    <AccesoRequerido rol="CLIENTE">
                        {esperarCatalogo ? <main><EstadoCatalogo {...estadoCatalogo} /></main> : (
                            <Checkout carrito={carrito} codigoCupon={compra.cupon} usuario={usuario}
                                carritoValido={carritoValido} finalizarCompra={finalizarCompra} />
                        )}
                    </AccesoRequerido>
                } />
                <Route path="/ordenes" element={
                    <AccesoRequerido rol="CLIENTE">
                        <MisOrdenes productos={productosPorId} usuario={usuario} solicitarConSesion={solicitarConSesion} />
                    </AccesoRequerido>
                } />
                <Route path="/admin" element={
                    <AccesoRequerido rol="ADMIN">
                        <Admin catalogo={productos} categorias={categorias} estadoCatalogo={estadoCatalogo}
                            onCambio={recargarCatalogo} />
                    </AccesoRequerido>
                } />
                <Route path="/admin/categorias" element={
                    <AccesoRequerido rol="ADMIN">
                        <CategoriasAdmin onCambio={recargarCatalogo} />
                    </AccesoRequerido>
                } />
                <Route path="*" element={<main><h1>Página no encontrada</h1></main>} />
            </Routes>
            <PieDePagina />
        </>
    );
}

export default App;
