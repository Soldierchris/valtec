// ============================================================
// public/js/api/colaboradores.api.js
// ============================================================

import { fetchJSON } from './http.js';

const BASE = '/api/colaboradores';

/**
 * Busca colaboradores por RUT o nombre (autocompletado).
 * @param {string} texto
 * @returns {Promise<Array<{rut, nombre1, nombre2, apellido1, apellido2, cargo, sector}>>}
 */
export function buscarColaboradores(texto) {
    return fetchJSON(`${BASE}/buscar?q=${encodeURIComponent(texto)}`);
}

/**
 * Registra un nuevo colaborador.
 * @param {{ rut, nombre1, nombre2?, apellido1, apellido2?, cargo, sector, telefono1?, telefono2?, mail? }} datos
 */
export function crearColaborador(datos) {
    return fetchJSON(BASE, 'POST', datos);
}


// ============================================================
// public/js/api/formularios.api.js
// ============================================================

const BASE_FORM = '/api/formularios';

/**
 * Devuelve el inventario de formularios por aerolínea.
 * @param {'LATAM'|'SKY'|'OTRO'} aerolinea
 * @returns {Promise<Array>}
 */
export function obtenerFormulariosPorAerolinea(aerolinea) {
    return fetchJSON(`${BASE_FORM}/${aerolinea}`);
}


// ============================================================
// public/js/api/tablets.api.js
// ============================================================

/**
 * Devuelve el listado completo de tablets con estado y ubicación.
 * @returns {Promise<Array>}
 */
export function obtenerTablets() {
    return fetchJSON('/api/tablets');
}