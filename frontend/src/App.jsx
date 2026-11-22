import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { leerCompra, guardarCompra } from './services/almacenamiento.js';
import { obtenerSesion, cerrarSesion } from './services/autenticacion.js';
import { buscarCupon, calcularResumen } from './utils/precios.js';

import { productos as catalogoOriginal } from './data/productos.js';

import Cabecera from './components/Cabecera.jsx';
import Inicio from './pages/Inicio.jsx';
import Catalogo from './pages/Catalogo.jsx';
import Producto from './pages/Producto.jsx';
import Carrito from './pages/Carrito.jsx';
import Checkout from './pages/Checkout.jsx';
import MisOrdenes from './pages/MisOrdenes.jsx';
import Login from './pages/Login.jsx';
import Registro from './pages/Registro.jsx';
import Admin from './pages/Admin.jsx';
import PieDePagina from './components/PieDePagina.jsx';

function App() {
    const [sesion, setSesion] = useState(obtenerSesion);
    const [compra, setCompra] = useState(leerCompra);
    const [catalogo, setCatalogo] = useState(catalogoOriginal);

    const carrito = compra.carrito;
    const ordenes = compra.ordenes;
    const [mensaje, setMensaje] = useState('');

    let cantidadProductos = 0;
    for (const producto of carrito) {
        cantidadProductos += producto.cantidad;
    }

    function manejarCerrarSesion() {
        cerrarSesion();
        setSesion(null);
    }

    function actualizarCarrito(nuevoCarrito) {
        let cupon = compra.cupon;

        if (nuevoCarrito.length === 0) {
            cupon = '';
        }

        if (!guardarCompra(nuevoCarrito, ordenes, cupon)) {
            setMensaje('No se pudo guardar el carrito.');
            return false;
        }

        setCompra({ carrito: nuevoCarrito, ordenes, cupon });
        setMensaje('');
        return true;
    }

    function agregarProducto(producto, cantidad) {
        if (!Number.isInteger(cantidad) || cantidad < 1) {
            setMensaje('La cantidad debe ser un numero entero mayor que cero.');
            return false;
        }

        const existente = carrito.find(item => item.id === producto.id);
        let nuevaCantidad = cantidad;

        if (existente) {
            nuevaCantidad += existente.cantidad;
        }

        if (nuevaCantidad > producto.stock) {
            setMensaje('La cantidad total supera el stock disponible.');
            return false;
        }

        let nuevoCarrito;

        if (existente) {
            nuevoCarrito = carrito.map(item =>
                item.id === producto.id ? { ...item, cantidad: nuevaCantidad } : item
            );
        } else {
            nuevoCarrito = [...carrito, { ...producto, cantidad }];
        }

        return actualizarCarrito(nuevoCarrito);
    }

    function cambiarCantidad(id, cantidad) {
        const producto = carrito.find(item => item.id === id);

        if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > producto.stock) {
            setMensaje('La cantidad debe estar entre 1 y el stock disponible.');
            return;
        }

        const nuevoCarrito = carrito.map(item =>
            item.id === id ? { ...item, cantidad } : item
        );

        actualizarCarrito(nuevoCarrito);
    }

    function quitarProducto(id) {
        const nuevoCarrito = carrito.filter(item => item.id !== id);
        actualizarCarrito(nuevoCarrito);
    }

    function vaciarCarrito() {
        actualizarCarrito([]);
    }

    function finalizarCompra(datos) {
        if (carrito.length === 0) {
            setMensaje('Agrega productos antes de comprar.');
            return false;
        }

        const resumen = calcularResumen(carrito, compra.cupon);

        const nuevoCatalogo = catalogo.map(productoOriginal => {
            const itemComprado = carrito.find(item => item.id === productoOriginal.id);
            if (itemComprado) {
                return {
                    ...productoOriginal,
                    stock: productoOriginal.stock - itemComprado.cantidad
                };
            }
            return productoOriginal;
        });
        setCatalogo(nuevoCatalogo);

        const orden = {
            id: 'ORD-' + Date.now(),
            fecha: new Date().toISOString(),
            estado: 'Confirmada',
            productos: carrito,
            despacho: datos,
            subtotal: resumen.subtotal,
            descuento: resumen.descuento,
            total: resumen.total
        };

        const nuevasOrdenes = [orden, ...ordenes];

        if (!guardarCompra([], nuevasOrdenes, '')) {
            setMensaje('No se pudo guardar la compra.');
            return false;
        }

        setCompra({ carrito: [], ordenes: nuevasOrdenes, cupon: '' });
        setMensaje('');
        return true;
    }

    function aplicarCupon(codigo) {
        let codigoValido = '';

        if (codigo.trim() !== '') {
            const cupon = buscarCupon(codigo);

            if (!cupon) {
                setMensaje('Cupon invalido o vencido. No se cambio el descuento.');
                return false;
            }

            codigoValido = cupon.codigo;
        }

        if (!guardarCompra(carrito, ordenes, codigoValido)) {
            setMensaje('No se pudo guardar el cupon.');
            return false;
        }

        setCompra({ carrito, ordenes, cupon: codigoValido });
        setMensaje('');
        return true;
    }

    return (
        <>
            <Cabecera
                cantidad={cantidadProductos}
                sesion={sesion}
                alCerrarSesion={manejarCerrarSesion}
            />

            {mensaje && (
                <p className="alert alert-danger m-3" role="alert">
                    {mensaje}
                </p>
            )}

            <Routes>
                {/* VISTA CLIENTE (Tienda) */}
                <Route path="/" element={<Inicio />} />
                <Route path="/catalogo" element={<Catalogo catalogo={catalogo} />} />
                <Route
                    path="/producto/:id"
                    element={<Producto catalogo={catalogo} agregarProducto={agregarProducto} />}
                />
                <Route
                    path="/carrito"
                    element={
                        <Carrito
                            carrito={carrito}
                            codigoCupon={compra.cupon}
                            aplicarCupon={aplicarCupon}
                            cambiarCantidad={cambiarCantidad}
                            quitarProducto={quitarProducto}
                            vaciarCarrito={vaciarCarrito}
                        />
                    }
                />
                <Route
                    path="/checkout"
                    element={
                        <Checkout
                            carrito={carrito}
                            codigoCupon={compra.cupon}
                            finalizarCompra={finalizarCompra}
                        />
                    }
                />
                <Route
                    path="/ordenes"
                    element={<MisOrdenes ordenes={ordenes} />}
                />

                {/* AUTENTICACIÓN */}
                <Route path="/login" element={<Login alIniciarSesion={setSesion} />} />
                <Route path="/registro" element={<Registro alIniciarSesion={setSesion} />} />

                {/* VISTA ADMIN */}
                <Route
                    path="/admin"
                    element={
                        <Admin
                            sesion={sesion}
                            catalogo={catalogo}
                            setCatalogo={setCatalogo}
                            ordenes={ordenes}
                        />
                    }
                />

                <Route
                    path="*"
                    element={<main><h1>Pagina no encontrada</h1></main>}
                />
            </Routes>

            <PieDePagina />
        </>
    );
}

export default App;