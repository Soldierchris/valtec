// ============================================================
// public/js/api/productos.api.js
// Una función por cada endpoint de /api/productos
// ============================================================

import { fetchJSON } from './http.js';

const BASE = '/api/productos';

/**
 * Busca productos por nombre (autocompletado).
 * @param {string} texto - Mínimo 2 caracteres
 * @returns {Promise<Array<{id_articulo, descripcion, categoria, stock}>>}
 */
export function buscarProductos(texto) {
    return fetchJSON(`${BASE}/buscar?q=${encodeURIComponent(texto)}`);
}

/**
 * Devuelve el detalle serializado de un producto (num_serie, modelo).
 * Usado para verificar serie en entregas y devoluciones.
 * @param {number|string} id
 * @returns {Promise<{id_articulo, descripcion, categoria, num_serie, modelo}>}
 */
export function obtenerDetalle(id) {
    return fetchJSON(`${BASE}/${id}/detalle`);
}

/**
 * Devuelve la bodega donde está actualmente el producto
 * y el stock disponible en esa bodega.
 * @param {number|string} id
 * @returns {Promise<{ubicacion, stock_en_bodega}>}
 */
export function obtenerUbicacionActual(id) {
    return fetchJSON(`${BASE}/${id}/ubicacion-actual`);
}

/**
 * Crea un nuevo producto en el sistema.
 * @param {{ descripcion, categoria, modelo?, num_serie?, aerolinea?, tipo_documento?, marca?, medida? }} datos
 * @returns {Promise<{exito, id}>}
 */
export function crearProducto(datos) {
    return fetchJSON(BASE, 'POST', datos);
}