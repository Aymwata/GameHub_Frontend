import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import './styles/tema.css';
import App from './App.jsx';
import ProveedorSesion from './components/ProveedorSesion.jsx';

// Inicia React y habilita la navegación entre páginas.
createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <ProveedorSesion>
            <App />
        </ProveedorSesion>
    </BrowserRouter>
);
