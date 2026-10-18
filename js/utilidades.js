// Prepara una sola vez los formatos de moneda y fecha utilizados en la tienda.
const formatoMoneda = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
});
const formatoFecha = new Intl.DateTimeFormat('es-CL');

// Convierte un número en un precio expresado en pesos chilenos.
export function moneda(valor) {
    return formatoMoneda.format(valor);
}

// Presenta una fecha guardada con el formato utilizado por la tienda.
export function fechaCorta(valor) {
    return formatoFecha.format(new Date(valor));
}

// Muestra texto sin permitir que sus caracteres especiales se interpreten como HTML.
export function escapar(valor) {
    const caracteres = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    };

    return String(valor).replace(/[&<>"']/g, (caracter) => caracteres[caracter]);
}
