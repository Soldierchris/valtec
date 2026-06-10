// ============================================================
// public/js/api/movimientos.api.js
// Una función por cada endpoint de /api/movimientos
// Los módulos de negocio importan desde aquí — NUNCA hacen
// fetch directamente.
// ============================================================

import { fetchJSON } from './http.js';

const BASE = '/api/movimientos';

// ── ESCRITURA ────────────────────────────────────────────────

/**
 * Registra un ingreso de producto a bodega.
 * @param {{ id_articulo, cantidad, ubicacion, id_usuario, serie?, modelo?, aerolinea? }} datos
 */
export function registrarIngreso(datos) {
    return fetchJSON(`${BASE}/ingreso`, 'POST', datos);
}

/**
 * Registra la entrega de un artículo a un colaborador.
 * @param {{ id_articulo, cantidad, ubicacion, rut_colaborador, id_usuario_bodega?, serie?, modelo? }} datos
 */
export function registrarEntrega(datos) {
    return fetchJSON(`${BASE}/entrega`, 'POST', datos);
}

/**
 * Registra la devolución de un artículo a bodega.
 * @param {{ id_articulo, rut_colaborador, ubicacion, serie?, observacion? }} datos
 */
export function registrarDevolucion(datos) {
    return fetchJSON(`${BASE}/devolucion`, 'POST', datos);
}

// ── LECTURA ──────────────────────────────────────────────────

/**
 * Devuelve el inventario actual de Bodega Seguridad.
 * @returns {Promise<Array>}
 */
export function obtenerBodegaSeguridad() {
    return fetchJSON(`${BASE}/bodega-seguridad`);
}

/**
 * Devuelve el inventario actual de Bodega Grande.
 * @returns {Promise<Array>}
 */
export function obtenerBodegaGrande() {
    return fetchJSON(`${BASE}/bodega-grande`);
}

/**
 * Devuelve el historial completo de movimientos de un N° de serie.
 * @param {string} serie
 * @returns {Promise<Array>}
 */
export function obtenerTrazabilidad(serie) {
    return fetchJSON(`${BASE}/trazabilidad/${encodeURIComponent(serie)}`);
}

/**
 * Devuelve los activos actualmente en custodia de un colaborador.
 * @param {string} rut
 * @returns {Promise<Array>}
 */
export function obtenerCustodiaDeColaborador(rut) {
    return fetchJSON(`${BASE}/custodia/${encodeURIComponent(rut)}`);
}