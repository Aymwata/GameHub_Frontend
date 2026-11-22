export async function solicitar(ruta, { method = 'GET', body, token, headers, signal } = {}) {
    const respuesta = await fetch('/api' + ruta, {
        method,
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json',
            ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
            ...(token ? { Authorization: 'Bearer ' + token } : {}),
            ...headers,
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal,
    });

    if (respuesta.status === 204) return undefined;
    const datos = await respuesta.json().catch(() => null);
    if (!respuesta.ok || datos === null) {
        throw Object.assign(new Error(datos?.message || datos?.error || 'No se pudo completar la solicitud.'), {
            status: respuesta.status,
        });
    }
    return datos;
}
