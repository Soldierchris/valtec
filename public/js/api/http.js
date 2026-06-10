// ============================================================
// public/js/api/http.js
// Helper centralizado para todas las llamadas fetch.
// Si mañana cambia la base URL o el manejo de errores,
// solo se modifica ESTE archivo.
// ============================================================

/**
 * Hace un fetch a la API y devuelve el JSON parseado.
 * Lanza un Error con el mensaje del backend si el status no es OK.
 *
 * @param {string} url
 * @param {'GET'|'POST'|'PUT'|'DELETE'} method
 * @param {object|null} body
 * @returns {Promise<any>}
 */
export async function fetchJSON(url, method = 'GET', body = null) {
    const opciones = {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : {},
        body:    body ? JSON.stringify(body) : null,
    };

    const res = await fetch(url, opciones);

    // Si la respuesta no es OK, intentamos leer el mensaje de error del backend
    if (!res.ok) {
        let mensaje = `Error HTTP ${res.status}`;
        try {
            const err = await res.json();
            mensaje = err.error || err.message || mensaje;
        } catch (_) { /* el body no era JSON, usamos el mensaje genérico */ }
        throw new Error(mensaje);
    }

    // 204 No Content — no hay body que parsear
    if (res.status === 204) return null;

    return res.json();
}