# GameHub Store

Proyecto académico de Desarrollo FullStack II (DSY1104).

Integrantes: Martín Naranjo, David Pérez y Maximiliano Isamit.

## Ejecutar la versión actual

Esta versión usa HTML, CSS y JavaScript, sin React ni backend.

1. Abre la carpeta del repositorio en VS Code.
2. Inicia Live Preview o Live Server desde `index.html`.
3. Usa siempre el mismo servidor y puerto para conservar el carrito y las órdenes.

También puedes ejecutar `python -m http.server 8000` desde la carpeta del proyecto y abrir `http://localhost:8000`.

Bootstrap 5.3.8 se carga desde CDN y requiere conexión a Internet. La aplicación usa módulos JavaScript y debe abrirse mediante un servidor HTTP local, como Live Preview; abrir los HTML con `file://` impide cargar esos módulos.

## Estructura

```text
GameHub_Frontend/
├── index.html, catalogo.html, detalle.html
├── carrito.html, checkout.html, ordenes.html
├── js/
│   ├── app.js                  # Inicia los módulos y la vista actual.
│   ├── datos.js                # Productos, categorías, marcas y cupones.
│   ├── tienda.js               # Cálculos y validaciones de la compra.
│   ├── almacenamiento.js      # Lee y guarda los datos en localStorage.
│   ├── estado.js               # Mantiene los datos actuales de la compra.
│   ├── utilidades.js           # Formato de importes, fechas y texto seguro.
│   ├── componentes.js          # Tarjetas, totales y controles compartidos.
│   └── vistas/
│       ├── inicio.js
│       ├── catalogo.js
│       ├── detalle.js
│       ├── carrito.js
│       ├── checkout.js
│       └── ordenes.js
├── css/
│   ├── styles.css              # Entrada común que carga las otras hojas.
│   ├── base.css                # Colores, disposición y accesibilidad.
│   ├── navegacion.css          # Encabezado, buscador y pie de página.
│   ├── componentes.css         # Tarjetas, formularios y resúmenes.
│   └── vistas.css              # Estilos propios de las vistas.
├── assets/images/
└── tests/
    ├── tienda.test.js
    └── almacenamiento.test.js
```

Los archivos JavaScript usan `import` y `export`, que permiten compartir funciones sin variables globales. Cada HTML carga únicamente `js/app.js` como módulo y declara su vista mediante `data-vista` en el elemento `body`. La cabecera y el pie conservan el mismo marcado en las seis páginas; se convertirán en componentes al migrar a React.

Para comprender el proyecto, comienza por `datos.js` y `tienda.js`, continúa con `almacenamiento.js` y `estado.js`, y revisa después `app.js` y el archivo de la vista que te interese. Las funciones y secciones mantienen comentarios breves en español.

El checkout valida los campos sin reconstruir el resumen en cada pulsación. El carrito actualiza los importes sin reemplazar el campo de cantidad mientras se edita. Los porcentajes y topes que se muestran en los mensajes se obtienen de los cupones definidos en `datos.js`.

## Comprobar el recorrido de compra

1. Busca un producto o aplica categoría, marca, precio y orden en el catálogo.
2. Abre su detalle y agrega una cantidad válida. Agregar nuevamente acumula unidades hasta el stock.
3. Edita cantidades, elimina productos o vacía el carrito. El contador refleja las unidades.
4. Aplica `GAME20`: 20 % de descuento con tope de $100.000, vigente del 1 de enero al 31 de diciembre de 2026. `VENCIDO` sirve para comprobar el rechazo por fecha. Estas condiciones son datos de demostración configurables en `js/datos.js`.
5. Completa todos los campos de despacho con datos ficticios. El pago se habilita cuando el formulario es válido y el carrito tiene productos.
6. Confirma el pago simulado. Se guarda una orden con sus productos y totales y se vacía el carrito. Consulta el detalle desde Mis órdenes.

Carrito, cupón y órdenes se guardan en `localStorage`, en la clave `gamehub-store-v1`. No hay stock compartido entre usuarios ni pagos reales. Las órdenes solo existen en el navegador y origen utilizados. Para reiniciar la demostración, elimina esa clave desde las herramientas de desarrollo del navegador. No ingreses datos personales reales.

## Pruebas previas a la migración

Requieren Node.js 18 o superior. Ejecuta `npm test`; no se necesitan dependencias npm.

Las pruebas revisan cálculos, validaciones, compatibilidad de datos guardados y fallos de almacenamiento con el ejecutor integrado de Node. **No sustituyen las pruebas obligatorias de EP2 con Jasmine y Karma ni su reporte de cobertura.**

## Mantener el formato

El archivo `.prettierrc.json` define una indentación de cuatro espacios y un formato consistente para HTML, CSS y JavaScript. Si tienes la extensión Prettier de VS Code, puede utilizar esa configuración al formatear.

También puedes ejecutar `npx prettier@3.6.2 --write .`; la primera ejecución necesita conexión para descargar la herramienta. Este paso es opcional y no hace falta para abrir la tienda ni ejecutar las pruebas.

## Continuación en EP2

Migrar las vistas a React, incorporar enrutamiento y formularios controlados, trasladar el estado compartido del carrito y configurar Jasmine, Karma y cobertura conforme al caso. Las reglas en `js/tienda.js` están separadas para facilitar esa migración.

Pendientes de alcance funcional que deben abordarse al contrastar el avance con el caso: selector de perfiles simulados, reseñas con sus restricciones y solicitudes de garantía. Se retiraron los enlaces a `login.html` y `register.html`, que no existían, y los botones de órdenes que solo mostraban alertas sin realizar esas operaciones. La autenticación real y la integración con microservicios corresponden a EP3.
