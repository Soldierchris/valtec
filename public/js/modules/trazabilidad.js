// ============================================================
// public/js/modules/trazabilidad.js
// Lógica de Trazabilidad de activos y Custodia por RUT
// ============================================================

import { obtenerTrazabilidad, obtenerCustodiaDeColaborador } from '../api/movimientos.api.js';
import { buscarColaboradores }                               from '../api/colaboradores.api.js';

// ── CONFIGURACIÓN VISUAL POR TIPO DE MOVIMIENTO ──────────────

const CONFIG_MOVIMIENTO = {
    Ingreso:    { color: '#38a169', bg: '#f0fff4', border: '#9ae6b4', icono: '📥', label: 'INGRESO A BODEGA' },
    Entrega:    { color: '#3182ce', bg: '#ebf8ff', border: '#90cdf4', icono: '📤', label: 'ENTREGA A COLABORADOR' },
    Devolución: { color: '#e53e3e', bg: '#fff5f5', border: '#feb2b2', icono: '↩️', label: 'DEVOLUCIÓN A BODEGA' },
    Traslado:   { color: '#d69e2e', bg: '#fffff0', border: '#faf089', icono: '🔄', label: 'TRASLADO' },
};

// ── MODAL TRAZABILIDAD (buscar por serie) ─────────────────────

export async function buscarTrazabilidad() {
    const serie     = document.getElementById('serie-trazabilidad')?.value.trim();
    const resultado = document.getElementById('resultado-trazabilidad');
    if (!serie || !resultado) return;

    resultado.innerHTML = `<div class="text-center text-muted">Buscando historial...</div>`;

    try {
        const movimientos = await obtenerTrazabilidad(serie);
        resultado.innerHTML = movimientos.length === 0
            ? `<div class="alert alert-warning">
                   No se encontraron movimientos para la serie <strong>${serie}</strong>.
               </div>`
            : _renderTimelineSimple(serie, movimientos);
    } catch (err) {
        resultado.innerHTML = `<div class="alert alert-danger">❌ Error: ${err.message}</div>`;
    }
}

// ── VISTA COMPLETA DE TRAZABILIDAD (en página principal) ──────

export function cargarVistaTrazabilidad() {
    const titulo   = document.getElementById('titulo-reporte');
    const cabecera = document.querySelector('thead');
    const cuerpo   = document.getElementById('tabla-cuerpo');

    titulo.innerText   = 'Trazabilidad de Activos';
    cabecera.innerHTML = '';
    cuerpo.innerHTML   = `
        <tr><td style="padding:0; border:none;">
        <div style="padding: 24px 8px;">
            <div style="
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
                border-radius: 16px; padding: 32px; margin-bottom: 28px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.2);
            ">
                <div style="text-align:center; margin-bottom:20px;">
                    <span style="font-size:2.5rem;">🔍</span>
                    <h2 style="color:white; margin:8px 0 4px; font-weight:700;">Trazabilidad de Activo</h2>
                    <p style="color:#a0aec0; margin:0; font-size:0.95rem;">
                        Ingrese el número de serie para ver el historial completo de custodia
                    </p>
                </div>
                <div style="display:flex; gap:12px; max-width:600px; margin:0 auto;">
                    <input type="text" id="input-trazabilidad-pagina"
                        placeholder="Ej: ABC-001, SN-SAM-002..."
                        style="flex:1; padding:14px 20px; border-radius:10px; border:2px solid #4a5568;
                               background:rgba(255,255,255,0.1); color:white; font-size:1.05rem; outline:none;"
                        onkeydown="if(event.key==='Enter') window.ejecutarTrazabilidad()"
                        onfocus="this.style.borderColor='#63b3ed'"
                        onblur="this.style.borderColor='#4a5568'">
                    <button onclick="window.ejecutarTrazabilidad()"
                        style="padding:14px 28px; border-radius:10px; border:none;
                               background:linear-gradient(135deg,#667eea,#764ba2);
                               color:white; font-weight:700; cursor:pointer;">
                        🔍 Buscar
                    </button>
                </div>
            </div>
            <div id="resultado-trazabilidad-pagina"></div>
        </div>
        </td></tr>`;
}

export async function ejecutarTrazabilidad() {
    const serie     = document.getElementById('input-trazabilidad-pagina')?.value.trim();
    const contenedor = document.getElementById('resultado-trazabilidad-pagina');
    if (!serie || !contenedor) return;

    contenedor.innerHTML = `<div style="text-align:center;padding:40px;color:#718096;">
        <div style="font-size:2rem;">⏳</div><p>Buscando historial...</p></div>`;

    try {
        const movimientos = await obtenerTrazabilidad(serie);
        contenedor.innerHTML = movimientos.length === 0
            ? _renderSinResultados(serie)
            : _renderTimelineCompleto(serie, movimientos);
    } catch (err) {
        contenedor.innerHTML = `
            <div style="background:#fff5f5;border-left:5px solid #e53e3e;border-radius:12px;padding:24px;">
                <strong style="color:#c53030;">❌ Error al buscar</strong>
                <p style="color:#742a2a;margin:4px 0 0;">${err.message}</p>
            </div>`;
    }
}

// ── CUSTODIA POR RUT ─────────────────────────────────────────

let _rutCustodioSeleccionado = null;

export function inicializarBuscadorCustodia() {
    const input = document.getElementById('rut-custodia');
    const lista = document.getElementById('sugerencias-colab-custodia');
    if (!input || !lista) return;

    input.addEventListener('input', async function () {
        const q = this.value.trim();
        if (q.length < 2) { lista.style.display = 'none'; return; }

        try {
            const data = await buscarColaboradores(q);
            lista.innerHTML = '';
            if (!data.length) { lista.style.display = 'none'; return; }

            data.forEach(c => {
                const li = document.createElement('li');
                li.className  = 'list-group-item list-group-item-action';
                li.textContent = `${c.rut} — ${c.nombre1} ${c.apellido1}`;
                li.onclick     = () => _seleccionarCustodio(c);
                lista.appendChild(li);
            });
            lista.style.display = 'block';
        } catch (err) {
            console.error('Error buscar custodio:', err);
        }
    });
}

function _seleccionarCustodio(c) {
    _rutCustodioSeleccionado = c.rut;
    document.getElementById('rut-custodia').value              = `${c.rut} — ${c.nombre1} ${c.apellido1}`;
    document.getElementById('sugerencias-colab-custodia').style.display = 'none';
    document.getElementById('custodio-nombre').textContent     = `${c.nombre1} ${c.apellido1} · ${c.cargo}`;
    document.getElementById('custodio-rut-badge').textContent  = c.rut;
    document.getElementById('custodio-confirmado').classList.remove('d-none');
    _cargarCustodia(c.rut);
}

async function _cargarCustodia(rut) {
    const container = document.getElementById('tabla-custodia-container');
    const sinRes    = document.getElementById('custodia-sin-resultados');
    const tbody     = document.getElementById('tbody-custodia');

    container.classList.add('d-none');
    sinRes.classList.add('d-none');
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Cargando...</td></tr>';
    container.classList.remove('d-none');

    try {
        const data = await obtenerCustodiaDeColaborador(rut);

        if (!data.length) {
            container.classList.add('d-none');
            sinRes.classList.remove('d-none');
            return;
        }

        document.getElementById('badge-total-custodia').textContent = `${data.length} activo(s)`;
        tbody.innerHTML = data.map(item => {
            const diasClass = item.dias_en_custodia > 30
                ? 'text-danger fw-bold'
                : item.dias_en_custodia > 7 ? 'text-warning' : '';
            return `<tr>
                <td>${item.descripcion}</td>
                <td><span class="badge bg-secondary">${item.categoria}</span></td>
                <td>${item.serie ? `<code>${item.serie}</code>` : '—'}
                    ${item.modelo ? `<small class="text-muted">${item.modelo}</small>` : ''}</td>
                <td>${new Date(item.fecha_movimiento).toLocaleDateString('es-CL')}</td>
                <td class="${diasClass}">${item.dias_en_custodia} días</td>
            </tr>`;
        }).join('');
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-danger">❌ Error: ${err.message}</td></tr>`;
    }
}

export function resetModalCustodia() {
    document.getElementById('rut-custodia').value = '';
    document.getElementById('sugerencias-colab-custodia').style.display = 'none';
    document.getElementById('custodio-confirmado').classList.add('d-none');
    document.getElementById('tabla-custodia-container').classList.add('d-none');
    document.getElementById('custodia-sin-resultados').classList.add('d-none');
    _rutCustodioSeleccionado = null;
}

// ── HELPERS DE RENDER ─────────────────────────────────────────

function _renderSinResultados(serie) {
    return `<div style="background:#fff8e1;border-left:5px solid #f6c90e;border-radius:12px;
                        padding:24px 28px;display:flex;align-items:center;gap:16px;">
        <span style="font-size:2rem;">⚠️</span>
        <div>
            <strong style="color:#744210;font-size:1.1rem;">Serie no encontrada</strong>
            <p style="color:#975a16;margin:4px 0 0;">
                No hay movimientos para <code>${serie}</code>. Verifique el número.
            </p>
        </div>
    </div>`;
}

function _renderTimelineSimple(serie, movimientos) {
    const iconos = {
        Ingreso:    { icon: '📥', color: 'success' },
        Entrega:    { icon: '📤', color: 'primary' },
        Devolución: { icon: '↩️', color: 'danger'  },
        Traslado:   { icon: '🔄', color: 'warning' },
    };
    const ultimo      = movimientos[movimientos.length - 1];
    const estadoActual = iconos[ultimo.tipo_movimiento] || { icon: '❓', color: 'secondary' };

    let html = `
        <div class="card mb-3">
            <div class="card-header bg-dark text-white">
                <strong>${movimientos[0].descripcion}</strong> — Serie: <code>${serie}</code>
                <span class="badge bg-${estadoActual.color} float-end">
                    ${estadoActual.icon} ${ultimo.tipo_movimiento}
                </span>
            </div>
            <div class="card-body p-2">`;

    movimientos.forEach((m, i) => {
        const cfg   = iconos[m.tipo_movimiento] || { icon: '❓', color: 'secondary' };
        const fecha = new Date(m.fecha_movimiento).toLocaleString('es-CL');
        html += `
            <div class="d-flex align-items-start mb-3">
                <div class="me-3 text-center" style="min-width:40px">
                    <span class="badge bg-${cfg.color} rounded-circle p-2">${cfg.icon}</span>
                    ${i < movimientos.length - 1
                        ? '<div style="width:2px;height:30px;background:#dee2e6;margin:4px auto"></div>'
                        : ''}
                </div>
                <div class="flex-grow-1 border rounded p-2 bg-light">
                    <span class="badge bg-${cfg.color}">${m.tipo_movimiento}</span>
                    <span class="ms-2 text-muted small">📅 ${fecha}</span>
                    <br><small>📍 ${m.ubicacion || 'Sin ubicación'}</small>
                    ${m.nombre_colaborador
                        ? `<br><small>👤 ${m.nombre_colaborador} (${m.rut_colaborador})</small>`
                        : ''}
                    ${m.observacion
                        ? `<br><small class="fst-italic text-muted">💬 ${m.observacion}</small>`
                        : ''}
                </div>
            </div>`;
    });

    html += `</div></div>`;
    return html;
}

function _renderTimelineCompleto(serie, movimientos) {
    const stats = { Ingreso: 0, Entrega: 0, Devolución: 0, Traslado: 0 };
    movimientos.forEach(m => { if (stats[m.tipo_movimiento] !== undefined) stats[m.tipo_movimiento]++; });

    const ultimo     = movimientos[movimientos.length - 1];
    const cfgUltimo  = CONFIG_MOVIMIENTO[ultimo.tipo_movimiento] || { color: '#718096', icono: '❓', label: ultimo.tipo_movimiento };

    let html = `
        <div style="background:white;border-radius:16px;padding:28px 32px;margin-bottom:24px;
                    box-shadow:0 4px 20px rgba(0,0,0,0.08);border-top:5px solid ${cfgUltimo.color};">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:16px;">
                <div>
                    <p style="color:#718096;font-size:0.8rem;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">Activo</p>
                    <h3 style="margin:0 0 6px;color:#1a202c;font-size:1.4rem;font-weight:700;">${movimientos[0].descripcion}</h3>
                    <div style="display:flex;gap:12px;flex-wrap:wrap;">
                        <span style="background:#edf2f7;color:#4a5568;padding:4px 12px;border-radius:20px;font-size:0.85rem;">
                            🔖 Serie: <strong>${serie}</strong>
                        </span>
                        <span style="background:#edf2f7;color:#4a5568;padding:4px 12px;border-radius:20px;font-size:0.85rem;">
                            📂 ${movimientos[0].categoria}
                        </span>
                    </div>
                </div>
                <div style="text-align:center;">
                    <p style="color:#718096;font-size:0.75rem;text-transform:uppercase;margin:0 0 6px;">Estado Actual</p>
                    <span style="background:${cfgUltimo.color};color:white;padding:10px 20px;
                                 border-radius:30px;font-weight:700;display:inline-block;">
                        ${cfgUltimo.icono} ${ultimo.tipo_movimiento}
                    </span>
                    ${ultimo.nombre_colaborador
                        ? `<p style="color:#718096;font-size:0.8rem;margin:8px 0 0;">
                               En poder de: <strong>${ultimo.nombre_colaborador}</strong>
                           </p>`
                        : ''}
                </div>
            </div>

            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;
                        margin-top:24px;padding-top:20px;border-top:1px solid #e2e8f0;">
                ${[
                    { key: 'Ingreso',    icono: '📥', color: '#38a169', label: 'Ingresos'     },
                    { key: 'Entrega',    icono: '📤', color: '#3182ce', label: 'Entregas'     },
                    { key: 'Devolución', icono: '↩️', color: '#e53e3e', label: 'Devoluciones' },
                    { key: 'Traslado',   icono: '🔄', color: '#d69e2e', label: 'Traslados'    },
                ].map(s => `
                    <div style="text-align:center;padding:12px;background:#f7fafc;border-radius:10px;">
                        <div style="font-size:1.5rem;">${s.icono}</div>
                        <div style="font-size:1.6rem;font-weight:700;color:${s.color};">${stats[s.key]}</div>
                        <div style="font-size:0.75rem;color:#718096;text-transform:uppercase;">${s.label}</div>
                    </div>`).join('')}
            </div>
        </div>

        <div style="background:white;border-radius:16px;padding:28px 32px;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
            <h5 style="color:#2d3748;font-weight:700;margin:0 0 24px;">📋 Historial Completo</h5>
            <div style="position:relative;">
                <div style="position:absolute;left:27px;top:0;bottom:0;width:3px;
                            background:#e2e8f0;border-radius:3px;"></div>`;

    movimientos.forEach((m, i) => {
        const cfg        = CONFIG_MOVIMIENTO[m.tipo_movimiento] || { color: '#718096', bg: '#f7fafc', border: '#e2e8f0', icono: '❓', label: m.tipo_movimiento };
        const fecha      = new Date(m.fecha_movimiento);
        const fechaFmt   = fecha.toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' });
        const horaFmt    = fecha.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
        const esUltimo   = i === movimientos.length - 1;

        html += `
            <div style="display:flex;align-items:flex-start;gap:20px;margin-bottom:${esUltimo ? '0' : '24px'};position:relative;">
                <div style="width:56px;height:56px;min-width:56px;border-radius:50%;
                            background:${cfg.bg};border:3px solid ${cfg.color};
                            display:flex;align-items:center;justify-content:center;
                            font-size:1.4rem;position:relative;z-index:1;
                            box-shadow:0 0 0 4px white${esUltimo ? `,0 0 0 7px ${cfg.color}33` : ''};">
                    ${cfg.icono}
                </div>
                <div style="flex:1;background:${cfg.bg};border:1px solid ${cfg.border};
                            border-left:4px solid ${cfg.color};border-radius:12px;padding:16px 20px;">
                    <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:8px;">
                        <span style="background:${cfg.color};color:white;padding:3px 12px;
                                     border-radius:20px;font-size:0.78rem;font-weight:700;
                                     text-transform:uppercase;">${cfg.label}</span>
                        <span style="color:#718096;font-size:0.82rem;">📅 ${fechaFmt} &nbsp;🕐 ${horaFmt}</span>
                    </div>
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px;margin-top:8px;">
                        ${m.ubicacion ? `<div>📍 <span style="color:#4a5568;font-size:0.9rem;">${m.ubicacion}</span></div>` : ''}
                        ${m.nombre_colaborador
                            ? `<div>👤 <strong style="color:#4a5568;">${m.nombre_colaborador}</strong>
                               <br><span style="color:#718096;font-size:0.78rem;">${m.rut_colaborador} · ${m.cargo || ''}</span></div>`
                            : ''}
                        ${m.observacion
                            ? `<div style="grid-column:1/-1;">💬 <span style="color:#718096;font-style:italic;">${m.observacion}</span></div>`
                            : ''}
                    </div>
                </div>
            </div>`;
    });

    html += `</div></div>`;
    return html;
}