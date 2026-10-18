import { CLAVE_ESTADO } from './almacenamiento.js';
import { crearEstadoCompra } from './estado.js';
import {
    prepararAvisos,
    prepararBuscador,
    prepararCategorias,
    actualizarContador
} from './componentes.js';
import { iniciarInicio } from './vistas/inicio.js';
import { iniciarCatalogo } from './vistas/catalogo.js';
import { iniciarDetalle } from './vistas/detalle.js';
import { iniciarCarrito } from './vistas/carrito.js';
import { iniciarCheckout } from './vistas/checkout.js';
import { iniciarOrdenes } from './vistas/ordenes.js';

// Prepara las funciones compartidas y recupera la compra guardada en el navegador.
const informar = prepararAvisos();
const parametros = new URLSearchParams(location.search);
const compra = crearEstadoCompra({
    alGuardar: actualizarContador,
    alError: informar
});

prepararBuscador(parametros);
prepararCategorias();
actualizarContador(compra.obtener());

// Elige la vista indicada en el HTML y ejecuta únicamente su preparación.
const vistas = {
    inicio: iniciarInicio,
    catalogo: iniciarCatalogo,
    detalle: iniciarDetalle,
    carrito: iniciarCarrito,
    checkout: iniciarCheckout,
    ordenes: iniciarOrdenes
};
const iniciarVista = vistas[document.body.dataset.vista];
const actualizarVista = iniciarVista({ compra, informar, parametros });

if (compra.errorInicial) {
    informar(compra.errorInicial, true);
}

// Sincroniza el contador y la vista actual si otra pestaña cambia los datos de compra.
window.addEventListener('storage', (evento) => {
    if (evento.key !== CLAVE_ESTADO && evento.key !== null) return;

    compra.recargar();
    actualizarVista?.();
});
