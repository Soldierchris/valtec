// ============================================================
// public/js/modules/reportes.js
// Carga de vistas en la tabla principal: LATAM, SKY, Tablets,
// Bodega Grande, Bodega Seguridad
// ============================================================

import { obtenerFormulariosPorAerolinea, obtenerTablets } from '../api/colaboradores.api.js';
import { obtenerBodegaSeguridad, obtenerBodegaGrande }   from '../api/movimientos.api.js';

// ── HELPERS ──────────────────────────────────────────────────

function _setTitulo(texto) {
    const el = document.getElementById('titulo-reporte');
    if (el) el.innerText = texto;
}

function _setCabecera(html) {
    const el = document.querySelector('thead');
    if (el) el.innerHTML = html;
}

function _setCuerpo(html) {
    const el = document.getElementById('tabla-cuerpo');
    if (el) el.innerHTML = html;
}

function _badgeStock(stock) {
    return `<span class="badge ${stock > 0 ? 'bg-success' : 'bg-danger'}">${stock}</span>`;
}

// ── FORMULARIOS LATAM / SKY ───────────────────────────────────

export async function cargarFormularios(aerolinea) {
    _setTitulo(`Cargando Inventario ${aerolinea}...`);
    _setCabecera(`<tr><th>ID</th><th>Descripción</th><th>Codigo</th><th>Stock </th></tr>`);

    try {
        const datos = await obtenerFormulariosPorAerolinea(aerolinea);

        if (!datos.length) {
            _setCuerpo('<tr><td colspan="4" class="text-center">No hay datos</td></tr>');
        } else {
            _setCuerpo(datos.map(item => `
                <tr>
                    <td>${item.id_articulo}</td>
                    <td>${item.descripcion}</td>
                    <td>${item.tipo_documento}</td>
                    <td>${_badgeStock(item.stock_disponible)}</td>
                </tr>`).join(''));
        }
        _setTitulo(`Inventario de Formularios: ${aerolinea}`);
    } catch (err) {
        console.error('Error cargando formularios:', err);
        _setCuerpo(`<tr><td colspan="4" class="text-center text-danger">Error: ${err.message}</td></tr>`);
    }
}

// ── TABLETS ───────────────────────────────────────────────────

export async function cargarTablets() {
    _setTitulo('Cargando Listado de Tablets...');
    _setCabecera(`
        <tr>
            <th>ID</th><th>Modelo / Serie</th><th>Descripción</th>
            <th>Cantidad</th><th>Estado</th><th>Ubicación</th>
        </tr>`);

    try {
        const datos = await obtenerTablets();
        _setCuerpo(datos.map(t => `
            <tr>
                <td>${t.id_articulo}</td>
                <td><strong>${t.modelo}</strong><br>
                    <small class="text-muted">${t.num_serie}</small></td>
                <td>${t.descripcion}</td>
                <td>1</td>
                <td><span class="badge ${t.estado === 'Disponible' ? 'bg-success' : 'bg-primary'}">
                    ${t.estado}</span></td>
                <td>${t.ubicacion || 'Sin asignar'}</td>
            </tr>`).join(''));
        _setTitulo('Inventario General de Tablets');
    } catch (err) {
        console.error('Error cargando tablets:', err);
        _setCuerpo('<tr><td colspan="6" class="text-center text-danger">Error al cargar tablets</td></tr>');
    }
}

// ── BODEGA SEGURIDAD ──────────────────────────────────────────

export async function cargarBodegaSeguridad() {
    _setTitulo('Cargando Inventario Bodega Seguridad...');
    _setCabecera(`
        <tr>
            <th>ID</th><th>Descripción</th><th>Modelo</th>
            <th>N° de Serie</th><th>Stock</th>
        </tr>`);

    try {
        const datos = await obtenerBodegaSeguridad();

        if (!datos.length) {
            _setCuerpo('<tr><td colspan="5" class="text-center">No hay productos de Seguridad registrados</td></tr>');
        } else {
            _setCuerpo(datos.map(item => `
                <tr>
                    <td>${item.id_articulo}</td>
                    <td>${item.descripcion}</td>
                    <td>${item.modelo || 'N/A'}</td>
                    <td><strong>${item.num_serie || 'Sin serie'}</strong></td>
                    <td>${_badgeStock(item.stock_disponible)}</td>
                </tr>`).join(''));
        }
        _setTitulo('Inventario Bodega Seguridad');
    } catch (err) {
        console.error('Error bodega seguridad:', err);
        _setCuerpo('<tr><td colspan="5" class="text-center text-danger">Error al cargar inventario</td></tr>');
    }
}

// ── BODEGA GRANDE ─────────────────────────────────────────────

export async function cargarBodegaGrande() {
    _setTitulo('Cargando Inventario Bodega Grande...');
    _setCabecera(`
        <tr>
            <th>ID</th><th>Descripción</th><th>Categoría</th>
            <th>Modelo</th><th>N° de Serie</th><th>Stock</th>
        </tr>`);

    try {
        const datos = await obtenerBodegaGrande();

        if (!datos.length) {
            _setCuerpo('<tr><td colspan="6" class="text-center">No hay productos en Bodega Grande</td></tr>');
        } else {
            _setCuerpo(datos.map(item => `
                <tr>
                    <td>${item.id_articulo}</td>
                    <td>${item.descripcion}</td>
                    <td><span class="badge bg-secondary">${item.categoria}</span></td>
                    <td>${item.modelo || 'N/A'}</td>
                    <td><strong>${item.num_serie || '—'}</strong></td>
                    <td>${_badgeStock(item.stock_disponible)}</td>
                </tr>`).join(''));
        }
        _setTitulo('Inventario Bodega Grande');
    } catch (err) {
        console.error('Error bodega grande:', err);
        _setCuerpo('<tr><td colspan="6" class="text-center text-danger">Error al cargar inventario</td></tr>');
    }
}