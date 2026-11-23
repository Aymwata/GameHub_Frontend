# GameHub Frontend

Clona la rama `martin` de ambos repositorios. En IntelliJ, inicia **GameHub Demo - Eureka**, **GameHub Demo - Microservicios** y **GameHub Demo - Gateway**, en ese orden. Cuando el [catálogo del backend](http://127.0.0.1:8099/api/products) responda, abre PowerShell desde el repositorio del frontend con Node.js 24.

```powershell
cd frontend
npm.cmd ci
npm.cmd run dev -- --host 127.0.0.1
```

Vite reenvía `/api` al Gateway en el puerto `8099`. Abre la URL que muestra la terminal, normalmente [http://127.0.0.1:5173](http://127.0.0.1:5173/). Usa la misma dirección para todas las pruebas de sesión.

| Vista de prueba | Correo | Contraseña inicial |
| --- | --- | --- |
| [Cliente](http://127.0.0.1:5173/login) | `cliente@gamehub.cl` | `cliente1234` |
| [Administrador](http://127.0.0.1:5173/admin/login) | `admin@gamehub.cl` | `admin1234` |

## Acceso y sesión

Los clientes entran por `/login` o se registran en `/registro`. Los administradores entran por `/admin/login`. Ambos formularios usan `useSesion` desde `src/services/sesion.js`, cuyo proveedor envuelve la aplicación desde `main.jsx`.

- `iniciarSesion({ email, password, perfil })` devuelve el usuario. Usa `CLIENTE` o `ADMIN` según la pantalla.
- `registrar({ nombre, email, telefono, password })` devuelve el cliente creado.
- `usuario` y `estado` exponen la sesión actual. El proveedor restaura la sesión con la cookie del backend y mantiene el JWT de acceso en memoria.
- El cliente puede volver a `/ordenes` o `/checkout` después de iniciar sesión. El administrador puede crear productos, ingresar stock y consultar órdenes en `/admin`, y gestionar categorías en `/admin/categorias`.

El catálogo viene de Spring e incluye las imágenes y especificaciones de los productos de prueba. El carrito almacena IDs, cantidades y el código del cupón en el navegador. Spring valida el stock y el cupón, calcula el total definitivo y guarda los datos de entrega y el método de pago preferido con la orden. El pedido queda pendiente de pago. Mis órdenes muestra estos datos al cliente autenticado.

En `/admin`, abre **Productos**. En **Nuevo producto**, la imagen puede ser una URL o un archivo que hayas agregado a `frontend/public/assets/images`, por ejemplo `/assets/images/mi-producto.jpg`. Escribe las especificaciones en líneas como `Memoria: 16 GB`. Después de guardar el producto, usa **Ingresar stock** para dejarlo disponible para comprar.

## Verificación

```powershell
npm.cmd test -- --run
npm.cmd run lint
npm.cmd run build
```
