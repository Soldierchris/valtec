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
        _mostrarBotonImprimir();
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
        _mostrarBotonImprimir();
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
            <th>Serie</th><th>Stock</th>
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
        _mostrarBotonImprimir();
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
            <th>Modelo</th><th>Serie</th><th>Stock</th>
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
        _mostrarBotonImprimir();
    } catch (err) {
        console.error('Error bodega grande:', err);
        _setCuerpo('<tr><td colspan="6" class="text-center text-danger">Error al cargar inventario</td></tr>');
    }
}

// Mostrar el botón de imprimir cuando se carga cualquier reporte
function _mostrarBotonImprimir() {
    const btn = document.getElementById('btn-imprimir-reporte');
    if (btn) btn.classList.remove('d-none');
}

// Lógica para imprimir la tabla actual
export function imprimirReporte() {
    const titulo = document.getElementById('titulo-reporte').innerText;
    const cabecera = document.querySelector('thead').innerHTML;
    const cuerpo = document.getElementById('tabla-cuerpo').innerHTML;

    const fechaImpresion = new Date().toLocaleString('es-CL', {
        timeZone: 'America/Santiago',
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });

    const html = `<!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <title>${titulo} — VALTEC</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; font-size: 12px; color: #111; padding: 20px; }
            .encabezado { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; border-bottom: 2px solid #1e3a5f; padding-bottom: 10px; }
            .encabezado h1 { font-size: 16px; color: #1e3a5f; }
            .meta { font-size: 10px; color: #555; text-align: right; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            thead tr { background-color: #1e3a5f; color: #fff; }
            thead th { padding: 8px; text-align: left; }
            tbody td { padding: 6px 8px; border-bottom: 1px solid #e5e7eb; }
            .pie { margin-top: 20px; font-size: 10px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 8px; text-align: center; }
            @page { size: A4 landscape; margin: 15mm; }
        </style>
    </head>
    <body>
        <div class="encabezado">
            <div>
                <h1>📦 ${titulo}</h1>
                <div style="color:#555; font-size:11px; margin-top:4px;">VALTEC Logística</div>
            </div>
            <div class="meta">
                <div>Impreso: ${fechaImpresion}</div>
            </div>
        </div>
        <table>
            <thead>${cabecera}</thead>
            <tbody>${cuerpo}</tbody>
        </table>
        <div class="pie">
            Documento generado automáticamente por el sistema VALTEC. — ${fechaImpresion}
        </div>
    </body>
    </html>`;

    const ventana = window.open('', '_blank', 'width=1000,height=700');
    ventana.document.write(html);
    ventana.document.close();
    ventana.focus();
    setTimeout(() => {
        ventana.print();
        ventana.close();
    }, 300);
}

// Vincular el evento de clic al botón (puedes poner esto al inicio del archivo o en una función init)
document.addEventListener('DOMContentLoaded', () => {
    const btnImprimir = document.getElementById('btn-imprimir-reporte');
    if (btnImprimir) {
        btnImprimir.addEventListener('click', imprimirReporte);
    }
});