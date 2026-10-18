# GameHub Store — PMV en React

Proyecto académico de Desarrollo FullStack II (DSY1104).

Integrantes: Martín Naranjo, David Pérez y Maximiliano Isamit.

## Abrir el proyecto

Necesitas Node.js compatible con Vite 7: 20.19+ o 22.12+; se recomienda una versión LTS vigente.

Desde la terminal de VS Code, dentro del proyecto:

```bash
npm install
npm run dev
```

Abre la dirección que muestra Vite, normalmente `http://localhost:5173`.

**Esta versión se abre con Vite, no con Live Preview ni haciendo doble clic en el HTML.** Al guardar cambios, Vite actualiza la página automáticamente.

## Organización

```text
src/
├── data/
│   └── datos.js                # Productos, categorías, marcas y cupones.
├── pages/
│   ├── Inicio.jsx
│   ├── Catalogo.jsx
│   ├── Producto.jsx
│   ├── Carrito.jsx
│   ├── Checkout.jsx
│   └── MisOrdenes.jsx
├── components/
│   ├── Cabecera.jsx
│   ├── PieDePagina.jsx
│   ├── TarjetaProducto.jsx
│   ├── LineaCarrito.jsx
│   └── ResumenCompra.jsx
├── services/
│   └── almacenamiento.js      # Lee y guarda la compra en el navegador.
├── styles/
│   ├── tema.css                # Colores y estilos compartidos.
│   ├── carrito.css
│   └── producto.css
├── utils/
│   ├── carrito.js              # Agregar productos y recuperar cantidades.
│   ├── precios.js              # Subtotal, descuento, total y formato de pesos.
│   ├── validaciones.js         # Stock, vigencia del cupón y despacho.
│   └── catalogo.js             # Ordenar los productos.
├── App.jsx                     # Guarda la compra y define las rutas.
└── main.jsx                    # Inicia React y carga los estilos.

public/assets/images/           # Imágenes utilizadas por las páginas.
tests/                          # Pruebas de cálculos, validaciones y almacenamiento.
```

## Cómo entender el código

1. **Datos:** `datos.js` contiene los productos de ejemplo.
2. **Páginas:** cada archivo de `pages` representa una pantalla.
3. **Componentes:** una tarjeta o una cabecera se escriben una vez y se reutilizan.
4. **Estado:** `App.jsx` conserva un objeto llamado `compra`, con carrito, cupón y órdenes.
5. **Props:** App entrega esos datos a las páginas que los necesitan.
6. **Guardado:** una página llama a `guardarCambios`, que guarda en el navegador y actualiza el estado de React.

El estado representa datos que pueden cambiar. Por ejemplo, cuando cambia la cantidad de un producto, React vuelve a mostrar el contador y los totales con ese valor.

## Ejemplo para explicar una compra

1. `Producto.jsx` recibe la compra desde App y recoge una cantidad.
2. `agregarAlCarrito` comprueba el stock y prepara el nuevo carrito.
3. `guardarCambios` guarda la compra y actualiza su estado.
4. `Carrito.jsx` muestra los productos y permite editarlos.
5. `ResumenCompra.jsx` calcula y presenta los importes.
6. `Checkout.jsx` valida el despacho y crea una orden con una copia de los productos y sus precios.
7. La orden se guarda junto con el carrito vacío y se muestra en `MisOrdenes.jsx`.

## Qué incluye este PMV

- Inicio con banner, destacados, categorías y video.
- Catálogo con búsqueda, categoría, marca, precios, orden y botón para cargar más productos.
- Detalle con precio, características y validación de stock.
- Carrito con cantidades editables, eliminación y cupón.
- Formulario controlado de despacho y pago simulado.
- Historial con detalle de las órdenes guardadas.
- Diseño adaptable con Bootstrap y tres hojas CSS sencillas.

`GAME20` ofrece un 20 % de descuento con tope de $100.000, vigente durante 2026. `VENCIDO` permite comprobar el rechazo de un cupón fuera de fecha. Son datos modificables en `src/data/datos.js`.

Se retiraron la fábrica de estado, la sincronización entre pestañas, los avisos genéricos reutilizables, las plantillas HTML construidas como cadenas y el carrusel automático. Para el PMV se utilizan estado y props, funciones directas y un banner estático.

Los datos son de demostración y se guardan con la clave `gamehub-store-v1` en `localStorage`. Se mantiene el formato anterior; al cambiar de servidor o puerto, el navegador utiliza un almacenamiento distinto. No hay pagos reales ni stock compartido entre usuarios. Utiliza datos ficticios.

## Comprobar el proyecto

```bash
npm test
npm run build
npm run preview
```

Las pruebas actuales utilizan el ejecutor de Node y no sustituyen las pruebas de Jasmine y Karma de la evaluación.

## Pendientes para completar EP2

Este PMV es la base de React, no la entrega completa de EP2. Faltan los perfiles simulados, las reseñas y garantías con sus restricciones, las pruebas obligatorias de componentes con Jasmine y Karma, la cobertura y los documentos de evaluación. La autenticación real y la integración con el backend corresponden a EP3.

## Formato del código

Los comentarios explican cada función con una frase. La configuración de Prettier mantiene una indentación de cuatro espacios. Puedes formatear con la extensión de VS Code o con `npx prettier@3.6.2 --write .`.
