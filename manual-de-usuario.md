# Manual de usuario de GameHub Store

## Presentación

GameHub Store tiene dos perfiles: **Cliente** y **Administrador**. El cliente consulta productos, arma un carrito, crea pedidos y revisa sus órdenes. El administrador gestiona el catálogo, el inventario, las órdenes, las categorías y los cupones.

Para iniciar sesión y guardar cambios, la aplicación y los servicios del backend deben estar en ejecución. Para demostraciones de compra, usa una base H2 aislada: crear una orden reserva stock y cambia los datos persistentes del inventario.

## Cliente

### Crear una cuenta e iniciar sesión

1. Abre **Registro** desde el acceso de cliente.
2. Completa tu nombre, correo electrónico y teléfono de 9 dígitos.
3. Crea una contraseña de al menos 8 caracteres y repítela para confirmarla.
4. Selecciona **Crear cuenta**. Cuando termine el registro, inicia sesión con el correo y la contraseña.

Si ya tienes cuenta, abre **Iniciar sesión**, escribe tus credenciales y selecciona **Ingresar**. La cuenta de cliente permite comprar y consultar órdenes; no da acceso a Administración.

### Buscar productos

1. Abre **Catálogo** desde la navegación principal.
2. Escribe el nombre del producto en la búsqueda o utiliza los filtros disponibles: categoría, marca y rango de precio.
3. Cambia el orden si quieres organizar los resultados de otra forma. Usa **Limpiar filtros** para volver a la lista completa.
4. En una tarjeta de producto, selecciona **Ver detalle** para abrir su ficha.

La ficha muestra el precio y la disponibilidad, además de la descripción y las especificaciones técnicas cuando existen. El stock disponible puede cambiar si se procesan otras órdenes.

### Agregar productos y revisar el carrito

1. En el detalle del producto, escribe la cantidad que deseas comprar. No puede ser mayor que el stock disponible.
2. Selecciona **Agregar al carrito**. La cabecera muestra la cantidad total de unidades agregadas.
3. Abre **Carrito** para revisar productos, cantidades, subtotal y descuentos.
4. Cambia una cantidad, quita un producto o vacía el carrito antes de continuar.

Si la cantidad supera el stock actual, el sistema no permitirá continuar con un pedido válido. Ajusta la cantidad o vuelve a revisar el catálogo.

### Usar un cupón

1. En el carrito, escribe el código promocional y selecciona **Aplicar**.
2. El código se guarda en el carrito y se envía al servidor al crear el pedido.
3. El backend comprueba que el cupón exista y esté activo y vigente. También puede verificar un monto mínimo o un límite de usos.

El mensaje de que el código quedó guardado no significa que el descuento ya esté aprobado. La validación final ocurre al crear la orden. Si se rechaza, revisa el código y sus condiciones o consulta al administrador. Un código como `GAME20` debe crearse primero en Administración → **Cupones**.

### Completar y crear el pedido

1. Desde el carrito, continúa al checkout. Si no has iniciado sesión, accede con tu cuenta de cliente.
2. Revisa los productos y el resumen de compra.
3. Completa los datos solicitados: nombre completo, correo, teléfono de 9 dígitos, región, ciudad, comuna, calle y número.
4. Selecciona el método de pago preferido: tarjeta o transferencia.
5. Selecciona **Crear pedido** y espera la respuesta del servidor. Si el pedido se registra, la aplicación abre **Mis órdenes**.

La orden queda pendiente de pago. Elegir un método preferido no procesa un pago electrónico. Si el servidor muestra un error de stock o cupón, corrige el problema y vuelve a intentar.

### Consultar órdenes y cerrar sesión

En **Mis órdenes**, abre cada tarjeta para revisar el estado, los productos, cantidades, datos de contacto y entrega, cupón, descuento y total. Las órdenes canceladas se ocultan de las listas activas. La interfaz actual no muestra seguimiento de despacho ni solicitudes de garantía.

Para salir de tu cuenta, selecciona **Cerrar sesión** en la cabecera.

## Administrador

### Acceder al panel

1. Abre **Acceso de administradores**.
2. Inicia sesión con una cuenta que tenga perfil ADMIN.
3. Abre `/admin` para acceder al Panel de Administración.

La cuenta de cliente no tiene permisos para administrar la tienda. Si una acción no está disponible, comprueba que hayas iniciado sesión con el perfil correcto.

### Crear un producto

1. En la pestaña **Productos**, completa nombre, marca, modelo y precio.
2. Selecciona una categoría existente.
3. Añade una descripción y una imagen si están disponibles.
4. Escribe las especificaciones técnicas, una por línea, con el formato `Nombre: valor`; por ejemplo, `Memoria: 16 GB`.
5. Selecciona **Agregar producto**. El producto aparecerá en **Catálogo actual** si se guardó correctamente.

Para cambiar especificaciones, busca el producto en Catálogo actual, selecciona **Editar especificaciones**, realiza los cambios y guarda.

### Registrar o rebajar inventario

**Ingresar stock:** abre el formulario correspondiente, selecciona un producto, indica una cantidad positiva y escribe la bodega. Selecciona **Registrar stock** para guardar el ingreso.

**Rebajar stock:** selecciona el producto, indica las unidades que vas a retirar y selecciona **Rebajar stock**. El sistema no permite retirar más unidades que las disponibles ni descontar unidades reservadas por pedidos. Revisa el stock actualizado en el catálogo.

Los ingresos y retiros se registran como movimientos del inventario.

### Revisar, confirmar o rechazar pedidos

1. Selecciona la pestaña **Órdenes**.
2. Revisa el cliente, estado y total de cada pedido activo.
3. Selecciona **Ver detalle** para consultar datos de compra y contacto, dirección, método de pago preferido, fecha, productos, cantidades, cupón, descuento y total.
4. Para un pedido pendiente, selecciona **Confirmar** para actualizar su estado.
5. Para rechazarlo, selecciona **Rechazar** y confirma la acción. El pedido se oculta de las listas activas y el backend libera el stock reservado asociado.

Los pedidos cancelados se mantienen registrados en el backend, pero no aparecen en las listas activas del administrador ni del cliente.

### Crear un cupón

1. Abre la pestaña **Cupones**.
2. Escribe el código; el formulario lo guarda en mayúsculas.
3. Elige **Porcentaje** o **Monto fijo** e indica el valor del descuento.
4. Define las fechas y horas de inicio y término, y la cantidad máxima de usos.
5. Si corresponde, especifica una compra mínima. Déjala vacía si no quieres establecerla.
6. Selecciona **Crear cupón** y espera el aviso de confirmación.

El formulario registra la promoción en el backend. El cliente podrá usarla si está dentro de la vigencia y cumple las condiciones configuradas.

### Gestionar categorías

Selecciona **Gestionar categorías** para crear una categoría con nombre y descripción, editarla o desactivarla. Las categorías disponibles se utilizan al crear productos y filtrar el catálogo.

