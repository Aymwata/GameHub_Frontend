import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './styles/tema.css';
import './styles/carrito.css';
import './styles/producto.css';
import App from './App.jsx';

// Inicia React y permite navegar entre las páginas sin recargar la tienda.
createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <App />
    </BrowserRouter>
);
