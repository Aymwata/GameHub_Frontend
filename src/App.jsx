import { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { leerCompra, guardarCompra } from './services/almacenamiento.js';
import Cabecera from './components/Cabecera.jsx';
import PieDePagina from './components/PieDePagina.jsx';
import Inicio from './pages/Inicio.jsx';
import Catalogo from './pages/Catalogo.jsx';
import Producto from './pages/Producto.jsx';
import Carrito from './pages/Carrito.jsx';
import Checkout from './pages/Checkout.jsx';
import MisOrdenes from './pages/MisOrdenes.jsx';

// Mantiene la compra en un solo lugar y la comparte con las páginas que la necesitan.
export default function App() {
    const [compra, setCompra] = useState(leerCompra);
    const [mensaje, setMensaje] = useState('');
    let cantidad = 0;

    for (const linea of compra.carrito) {
        cantidad = cantidad + linea.cantidad;
    }

    // Actualiza la compra solo después de guardarla correctamente en el navegador.
    function guardarCambios(nuevaCompra) {
        if (!guardarCompra(nuevaCompra)) {
            setMensaje('No se pudo guardar el cambio. Revisa el almacenamiento del navegador.');
            return false;
        }

        setCompra(nuevaCompra);
        setMensaje('');
        return true;
    }

    return (
        <div className="aplicacion">
            <Cabecera cantidad={cantidad} />
            {mensaje && (
                <p className="contenedor-pagina text-danger" role="alert">
                    {mensaje}
                </p>
            )}
            <main>
                <Routes>
                    <Route path="/" element={<Inicio />} />
                    <Route path="/catalogo" element={<Catalogo />} />
                    <Route
                        path="/producto/:id"
                        element={<Producto compra={compra} guardarCambios={guardarCambios} />}
                    />
                    <Route
                        path="/carrito"
                        element={<Carrito compra={compra} guardarCambios={guardarCambios} />}
                    />
                    <Route
                        path="/checkout"
                        element={<Checkout compra={compra} guardarCambios={guardarCambios} />}
                    />
                    <Route path="/ordenes" element={<MisOrdenes ordenes={compra.ordenes} />} />
                    <Route
                        path="*"
                        element={
                            <div className="contenedor-pagina">
                                <h1>Página no encontrada</h1>
                                <Link to="/">Volver al inicio</Link>
                            </div>
                        }
                    />
                </Routes>
            </main>
            <PieDePagina />
        </div>
    );
}
