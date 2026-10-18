// Comprueba que la cantidad sea un entero positivo y no supere las unidades disponibles.
export function validarStock(cantidad, stock) {
    return Number.isInteger(cantidad) && cantidad > 0 && cantidad <= stock;
}

// Comprueba que la fecha esté dentro del período de validez del cupón.
export function cuponVigente(cupon, fecha = new Date()) {
    if (!cupon) return false;

    const inicio = new Date(cupon.inicio + 'T00:00:00');
    const fin = new Date(cupon.fin + 'T23:59:59.999');

    return fecha >= inicio && fecha <= fin;
}

// Devuelve los mensajes de error de los datos de despacho y del método de pago.
export function validarCheckout(datos) {
    const errores = {};
    const correo = String(datos.correo || '').trim();
    const telefono = String(datos.telefono || '').trim();
    const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
    const telefonoValido = /^\d{9}$/.test(telefono);
    const metodosPago = ['tarjeta', 'transferencia'];

    for (const campo of ['nombre', 'region', 'comuna', 'direccion']) {
        if (!String(datos[campo] || '').trim()) {
            errores[campo] = 'Este campo es obligatorio.';
        }
    }

    if (!correoValido) {
        errores.correo = 'Ingresa un correo electrónico válido.';
    }

    if (!telefonoValido) {
        errores.telefono = 'Ingresa un teléfono de 9 dígitos.';
    }

    if (!metodosPago.includes(datos.pago)) {
        errores.pago = 'Selecciona un método de pago válido.';
    }

    return errores;
}
