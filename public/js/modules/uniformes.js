// ============================================================
// public/js/modules/uniformes.js
// Módulo: Uniformes y Artículos Pendientes de Retiro
// ============================================================

import { uniformesAPI }        from '../api/uniformesAPI.js';
import { buscarColaboradores } from '../api/colaboradores.api.js';

// ── Estado local ──────────────────────────────────────────────
let pendientes       = [];
let colaboradorSelec = null;
let criterioOrden    = 'ingreso'; // Controla el orden seleccionado
let eventosAtados    = false;     // Evita la duplicidad de eventos en el DOM

// ── Inicialización ────────────────────────────────────────────
export async function initUniformes() {
    await renderTabla(true);
    bindEvents();
}

// ── Render tabla principal ────────────────────────────────────
// forceFetch permite re-renderizar (para ordenar) sin volver a consultar la BD
async function renderTabla(forceFetch = true) {
    if (forceFetch) {
        try {
            pendientes = await uniformesAPI.listar();
        } catch (err) {
            console.error('[uniformes] Error al listar:', err);
            pendientes = [];
        }
    }

    // Ordenar la lista en memoria según el criterio seleccionado
    const listaOrdenada = [...pendientes].sort((a, b) => {
        switch (criterioOrden) {
            case 'ingreso':        return new Date(a.fecha_ingreso) - new Date(b.fecha_ingreso);
            case 'rut':            return a.colaborador_rut.localeCompare(b.colaborador_rut);
            case 'nombre':         return (a.nombre_completo || '').localeCompare(b.nombre_completo || '');
            case 'sector':         return (a.sector || '').localeCompare(b.sector || '');
            case 'descripcion':    return (a.descripcion || '').localeCompare(b.descripcion || '');
            case 'notificaciones': return b.notificaciones - a.notificaciones; // Mayor a menor
            case 'dias':           return b.dias_en_bodega - a.dias_en_bodega; // Mayor a menor
            default:               return 0;
        }
    });

    const contenedor = document.getElementById('uniformes-contenedor');
    if (!contenedor) return;

    contenedor.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
           <h5 class="mb-0 fw-semibold text-secondary">
                📦 Uniformes y Artículos Pendientes de Retiro — Bodega Central
            </h5>
            
            <div class="d-flex align-items-center gap-3">
                <!-- CONTADOR PROFESIONAL -->
                <span class="badge bg-warning text-dark fs-6 px-3 py-2 shadow-sm border border-warning" style="border-radius: 6px;">
                    Pendientes de retiro: <strong>${listaOrdenada.length}</strong>
                </span>

                <!-- SELECT DE ORDENAMIENTO -->
                <div class="input-group input-group-sm shadow-sm" style="width: auto;">
                    <span class="input-group-text bg-light fw-bold text-secondary">
                        Ordenar por:
                    </span>
                    <select id="select-orden-uniformes" class="form-select form-select-sm" style="cursor:pointer; font-weight: 500;">
                        <option value="ingreso" ${criterioOrden === 'ingreso' ? 'selected' : ''}>Ingreso</option>
                        <option value="rut" ${criterioOrden === 'rut' ? 'selected' : ''}>RUT</option>
                        <option value="nombre" ${criterioOrden === 'nombre' ? 'selected' : ''}>Nombre</option>
                        <option value="sector" ${criterioOrden === 'sector' ? 'selected' : ''}>Sector</option>
                        <option value="descripcion" ${criterioOrden === 'descripcion' ? 'selected' : ''}>Descripción</option>
                        <option value="notificaciones" ${criterioOrden === 'notificaciones' ? 'selected' : ''}>Notificaciones</option>
                        <option value="dias" ${criterioOrden === 'dias' ? 'selected' : ''}>Días en bodega</option>
                    </select>
                </div>

                <!-- BOTÓN IMPRIMIR -->
                <button class="btn btn-outline-secondary btn-sm shadow-sm" id="btn-imprimir-uniformes">
                    🖨️ Imprimir
                </button>

                <!-- BOTÓN ADD -->
                <button class="btn btn-primary btn-sm shadow-sm" id="btn-add-uniforme">
                    ➕ Add
                </button>
            </div>
        </div>

        ${listaOrdenada.length === 0
            ? `<div class="alert alert-success mb-0 shadow-sm">
                   ✅ No hay artículos pendientes de retiro.
               </div>`
            : `<div class="table-responsive shadow-sm border rounded">
                   <table class="table table-hover table-sm align-middle mb-0">
                       <thead class="table-dark">
                           <tr>
                               <th>Fecha ingreso</th>
                               <th>RUT</th>
                               <th>Nombre</th>
                               <th>Sector</th>
                               <th>Descripción</th>
                               <th class="text-center">Avisos</th>
                               <th class="text-center">Días en bodega</th>
                               <th class="text-center">Acciones</th>
                           </tr>
                       </thead>
                       <tbody class="bg-white">
                           ${listaOrdenada.map(filaHTML).join('')}
                       </tbody>
                   </table>
               </div>`
        }
    `;
}

function filaHTML(p) {
    return `
        <tr>
            <td>${formatFecha(p.fecha_ingreso)}</td>
            
            <td style="white-space: nowrap;"><small class="text-muted">${p.colaborador_rut}</small></td>
            <td>${p.nombre_completo}</td>
            <td>${p.sector || '—'}</td>
            <td>
                <div class="d-flex align-items-center justify-content-between">
                    <small id="desc-${p.id}">${p.descripcion || '—'}</small>
                    <button class="btn btn-sm btn-link text-decoration-none btn-editar p-0 ms-2"
                            data-id="${p.id}"
                            data-desc="${p.descripcion || ''}"
                            title="Editar descripción">✏️</button>
                </div>
            </td>
            <td class="text-center">
                <span class="badge ${p.notificaciones > 0 ? 'bg-primary' : 'bg-secondary'}">${p.notificaciones}</span>
            </td>
            <td class="text-center">${badgeDias(p.dias_en_bodega)}</td>
            <td class="text-center" style="white-space:nowrap">
                <button class="btn btn-outline-primary btn-sm btn-notificar me-1"
                        data-id="${p.id}"
                        data-nombre="${p.nombre_completo}">
                    ✉️ Notificar
                </button>
                <button class="btn btn-outline-success btn-sm btn-cerrar"
                        data-id="${p.id}"
                        data-nombre="${p.nombre_completo}">
                    ✔️ Cerrar
                </button>
            </td>
        </tr>
    `;
}

// ── Eventos ───────────────────────────────────────────────────
function bindEvents() {
    if (eventosAtados) return; // Evita registrar múltiples veces los eventos
    const contenedor = document.getElementById('uniformes-contenedor');
    if (!contenedor) return;

    contenedor.addEventListener('click', (e) => {
        if (e.target.closest('#btn-add-uniforme'))      abrirModalAdd();
        if (e.target.closest('#btn-imprimir-uniformes')) imprimirUniformes();
        if (e.target.closest('.btn-notificar'))          handleNotificar(e.target.closest('.btn-notificar'));
        if (e.target.closest('.btn-cerrar'))        handleCerrar(e.target.closest('.btn-cerrar'));
        if (e.target.closest('.btn-editar'))        handleEditar(e.target.closest('.btn-editar')); // ← NUEVO
    });

    // Escuchar el cambio en el selector de orden
    contenedor.addEventListener('change', (e) => {
        if (e.target.id === 'select-orden-uniformes') {
            criterioOrden = e.target.value;
            renderTabla(false); // Renderizamos de nuevo, pero sin hacer peticiones a la DB
        }
    });

    eventosAtados = true; 
}

// ── Modal Add ─────────────────────────────────────────────────
function abrirModalAdd() {
    colaboradorSelec = null;

    if (!document.getElementById('modal-add-uniforme')) {
        document.body.insertAdjacentHTML('beforeend', modalAddHTML());
    }

    document.getElementById('uniforme-rut').value  = '';
    document.getElementById('uniforme-desc').value = '';
    document.getElementById('btn-guardar-uniforme').disabled = true;
    document.getElementById('uniforme-autocomplete').style.display = 'none';

    const modal = new bootstrap.Modal(document.getElementById('modal-add-uniforme'));
    modal.show();

    const inputRut   = document.getElementById('uniforme-rut');
    const inputDesc  = document.getElementById('uniforme-desc');
    const dropdown   = document.getElementById('uniforme-autocomplete');
    const btnGuardar = document.getElementById('btn-guardar-uniforme');

    const inputRutNuevo = inputRut.cloneNode(true);
    inputRut.parentNode.replaceChild(inputRutNuevo, inputRut);

    inputRutNuevo.addEventListener('input', async function () {
        const q = this.value.trim();
        colaboradorSelec = null;
        btnGuardar.disabled = true;

        if (q.length < 2) {
            dropdown.innerHTML = '';
            dropdown.style.display = 'none';
            return;
        }

        try {
            const datos = await buscarColaboradores(q);
            dropdown.innerHTML = '';

            if (!datos.length) {
                dropdown.innerHTML = '<li class="list-group-item text-muted small">Sin resultados</li>';
                dropdown.style.display = 'block';
                return;
            }

            datos.forEach(c => {
                const li = document.createElement('li');
                li.className   = 'list-group-item list-group-item-action';
                li.style.cursor = 'pointer';
                li.innerHTML   = `<strong>${c.rut}</strong> — ${c.nombre1} ${c.apellido1}
                                  <small class="text-muted ms-1">(${c.sector || 'Sin sector'})</small>`;
                li.addEventListener('click', () => {
                    colaboradorSelec         = c;
                    inputRutNuevo.value      = `${c.rut} — ${c.nombre1} ${c.apellido1}`;
                    dropdown.style.display   = 'none';
                    //btnGuardar.disabled      = false;
                    document.getElementById('btn-guardar-uniforme').disabled = false;
                    inputDesc.focus();
                });
                dropdown.appendChild(li);
            });

            dropdown.style.display = 'block';
        } catch (err) {
            console.error('[uniformes] Error autocomplete:', err);
        }
    });

    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target) && e.target !== inputRutNuevo) {
            dropdown.style.display = 'none';
        }
    });

    const btnGuardarNuevo = document.getElementById('btn-guardar-uniforme');
    const btnClone = btnGuardarNuevo.cloneNode(true);
    btnGuardarNuevo.parentNode.replaceChild(btnClone, btnGuardarNuevo);

    btnClone.addEventListener('click', async () => {
        if (!colaboradorSelec) return;

        btnClone.disabled   = true;
        btnClone.innerHTML  = '<span class="spinner-border spinner-border-sm me-1"></span>Guardando...';

        try {
            await uniformesAPI.crear({
                colaborador_rut: colaboradorSelec.rut,
                descripcion:     document.getElementById('uniforme-desc').value.trim() || 'Artículo pendiente de retiro'
            });

            bootstrap.Modal.getInstance(document.getElementById('modal-add-uniforme')).hide();
            mostrarToast('Registro guardado correctamente', 'success');
            await renderTabla(true); 
        } catch (err) {
            console.error('[uniformes] Error al guardar:', err);
            mostrarToast('Error al guardar el registro', 'danger');
            btnClone.disabled  = false;
            btnClone.innerHTML = '💾 Guardar';
        }
    });
}

function modalAddHTML() {
    return `
    <div class="modal fade" id="modal-add-uniforme" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title">📦 Agregar artículo pendiente de retiro</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3 position-relative">
                        <label class="form-label fw-bold">Colaborador <span class="text-danger">*</span></label>
                        <input type="text" id="uniforme-rut" class="form-control"
                               placeholder="Buscar por RUT o nombre..." autocomplete="off">
                        <ul id="uniforme-autocomplete"
                            class="list-group position-absolute w-100 shadow"
                            style="display:none; z-index:10500; max-height:200px; overflow-y:auto; top:100%;">
                        </ul>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-bold">Descripción del artículo</label>
                        <input type="text" id="uniforme-desc" class="form-control"
                               placeholder="Ej: Chaqueta talla M, par de zapatos negros...">
                        <div class="form-text text-muted">Opcional — si no completa se usa descripción genérica.</div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary" id="btn-guardar-uniforme" disabled>
                        💾 Guardar
                    </button>
                </div>
            </div>
        </div>
    </div>`;
}

// ── Notificar ─────────────────────────────────────────────────
async function handleNotificar(btn) {
    const id     = btn.dataset.id;
    const nombre = btn.dataset.nombre;

    const ok = await confirmar(
        `¿Enviar notificación a <strong>${nombre}</strong>?`,
        'Se enviará un correo automático al colaborador.'
    );
    if (!ok) return;

    btn.disabled  = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';

    try {
        await uniformesAPI.notificar(id);
        mostrarToast('✉️ Notificación enviada correctamente', 'success');
        await renderTabla(true);
    } catch (err) {
        console.error('[uniformes] Error al notificar:', err);
        mostrarToast('❌ ' + (err.message || 'Error al enviar la notificación'), 'danger');
        btn.disabled  = false;
        btn.innerHTML = '✉️ Notificar';
    }
}

// ── Cerrar ────────────────────────────────────────────────────
async function handleCerrar(btn) {
    const id     = btn.dataset.id;
    const nombre = btn.dataset.nombre;

    const ok = await confirmar(
        `¿Marcar como retirado el artículo de <strong>${nombre}</strong>?`,
        'El registro se cerrará y dejará de aparecer en la lista.'
    );
    if (!ok) return;

    btn.disabled  = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';

    try {
        await uniformesAPI.cerrar(id);
        mostrarToast('✔️ Registro cerrado correctamente', 'success');
        await renderTabla(true);
    } catch (err) {
        console.error('[uniformes] Error al cerrar:', err);
        mostrarToast('❌ Error al cerrar el registro', 'danger');
        btn.disabled  = false;
        btn.innerHTML = '✔️ Cerrar';
    }
}

// ── Editar Descripción ────────────────────────────────────────
async function handleEditar(btn) {
    const id = btn.dataset.id;
    const descActual = btn.dataset.desc;

    // Usamos un prompt sencillo para pedir la nueva descripción
    const nuevaDesc = prompt("✏️ Editar descripción del artículo:", descActual);

    // Si el usuario cancela o no cambia nada, salimos
    if (nuevaDesc === null || nuevaDesc.trim() === descActual.trim()) return;

    try {
        btn.disabled = true;
        await uniformesAPI.actualizar(id, { descripcion: nuevaDesc.trim() });
        mostrarToast('✏️ Descripción actualizada correctamente', 'success');
        await renderTabla(); // Recarga la tabla para mostrar el cambio
        bindEvents();
    } catch (err) {
        console.error('[uniformes] Error al actualizar:', err);
        mostrarToast('❌ Error al actualizar descripción', 'danger');
        btn.disabled = false;
    }
}

// ── Helpers ───────────────────────────────────────────────────
function formatFecha(fechaISO) {
    if (!fechaISO) return '—';
    const [y, m, d] = String(fechaISO).slice(0, 10).split('-');
    return `${d}/${m}/${y}`;
}

function badgeDias(dias) {
    dias = Number(dias);
    if (dias <= 3) return `<span class="badge bg-success">${dias} día${dias !== 1 ? 's' : ''}</span>`;
    if (dias <= 7) return `<span class="badge bg-warning text-dark">${dias} días</span>`;
    return             `<span class="badge bg-danger">${dias} días</span>`;
}

function mostrarToast(mensaje, tipo = 'success') {
    const id = `toast-${Date.now()}`;
    document.body.insertAdjacentHTML('beforeend', `
        <div id="${id}" class="toast align-items-center text-bg-${tipo} border-0 position-fixed bottom-0 end-0 m-3"
             role="alert" style="z-index:9999; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
            <div class="d-flex">
                <div class="toast-body fw-semibold">${mensaje}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto"
                        data-bs-dismiss="toast"></button>
            </div>
        </div>
    `);
    const el = document.getElementById(id);
    new bootstrap.Toast(el, { delay: 3500 }).show();
    el.addEventListener('hidden.bs.toast', () => el.remove());
}

// ── Imprimir ──────────────────────────────────────────────────
function imprimirUniformes() {
    // Usa la lista ya ordenada que está en memoria — sin fetch adicional
    const listaOrdenada = [...pendientes].sort((a, b) => {
        switch (criterioOrden) {
            case 'ingreso':        return new Date(a.fecha_ingreso) - new Date(b.fecha_ingreso);
            case 'rut':            return a.colaborador_rut.localeCompare(b.colaborador_rut);
            case 'nombre':         return (a.nombre_completo || '').localeCompare(b.nombre_completo || '');
            case 'sector':         return (a.sector || '').localeCompare(b.sector || '');
            case 'descripcion':    return (a.descripcion || '').localeCompare(b.descripcion || '');
            case 'notificaciones': return b.notificaciones - a.notificaciones;
            case 'dias':           return b.dias_en_bodega - a.dias_en_bodega;
            default:               return 0;
        }
    });

    const fechaImpresion = new Date().toLocaleString('es-CL', {
        timeZone: 'America/Santiago',
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });

    const filas = listaOrdenada.map((p, i) => {
        const dias = Number(p.dias_en_bodega);
        const colorDias = dias <= 3 ? '#16a34a' : dias <= 7 ? '#d97706' : '#dc2626';
        return `
            <tr class="${i % 2 === 0 ? 'fila-par' : ''}">
                <td>${i + 1}</td>
                <td>${formatFecha(p.fecha_ingreso)}</td>
                <td style="white-space:nowrap">${p.colaborador_rut}</td>
                <td>${p.nombre_completo}</td>
                <td>${p.sector || '—'}</td>
                <td>${p.descripcion || 'Artículo pendiente de retiro'}</td>
                <td style="text-align:center">${p.notificaciones}</td>
                <td style="text-align:center; color:${colorDias}; font-weight:700">${dias} día${dias !== 1 ? 's' : ''}</td>
            </tr>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Uniformes Pendientes — VALTEC</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 11px; color: #111; padding: 20px; }

        .encabezado { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; border-bottom: 2px solid #1e3a5f; padding-bottom: 10px; }
        .encabezado h1 { font-size: 15px; color: #1e3a5f; }
        .encabezado .meta { font-size: 10px; color: #555; text-align: right; }

        .resumen { margin-bottom: 12px; font-size: 11px; }
        .resumen strong { color: #1e3a5f; }

        table { width: 100%; border-collapse: collapse; }
        thead tr { background-color: #1e3a5f; color: #fff; }
        thead th { padding: 7px 8px; text-align: left; font-size: 10px; letter-spacing: 0.4px; }
        tbody td { padding: 6px 8px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
        tbody .fila-par { background-color: #f8fafc; }

        .pie { margin-top: 20px; font-size: 9px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 8px; text-align: center; }

        @page { size: A4 landscape; margin: 15mm; }
    </style>
</head>
<body>
    <div class="encabezado">
        <div>
            <h1>📦 Uniformes y Artículos Pendientes de Retiro</h1>
            <div style="color:#555; font-size:10px; margin-top:4px;">Bodega Central — VALTEC Logística</div>
        </div>
        <div class="meta">
            <div>Impreso: ${fechaImpresion}</div>
        </div>
    </div>

    <div class="resumen">
        Total pendientes: <strong>${listaOrdenada.length}</strong> &nbsp;|&nbsp;
        Ordenado por: <strong>${criterioOrden.charAt(0).toUpperCase() + criterioOrden.slice(1)}</strong>
    </div>

    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>Fecha Ingreso</th>
                <th style="white-space:nowrap">RUT</th>
                <th>Nombre</th>
                <th>Sector</th>
                <th>Descripción</th>
                <th style="text-align:center">Avisos</th>
                <th style="text-align:center">Días en Bodega</th>
            </tr>
        </thead>
        <tbody>${filas}</tbody>
    </table>

    <div class="pie">
        Este documento es generado automáticamente por el sistema VALTEC Logística. — ${fechaImpresion}
    </div>
</body>
</html>`;

    const ventana = window.open('', '_blank', 'width=1000,height=700');
    ventana.document.write(html);
    ventana.document.close();
    ventana.focus();
    // Pequeño delay para que el navegador termine de renderizar antes de abrir el diálogo
    setTimeout(() => {
        ventana.print();
        ventana.close();
    }, 300);
}

function confirmar(titulo, subtitulo = '') {
    return new Promise((resolve) => {
        const id = `confirm-${Date.now()}`;
        document.body.insertAdjacentHTML('beforeend', `
            <div class="modal fade" id="${id}" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered modal-sm">
                    <div class="modal-content shadow">
                        <div class="modal-body text-center pt-4">
                            <div style="font-size:2.5rem">⚠️</div>
                            <p class="mb-1 mt-2 fw-bold text-dark">${titulo}</p>
                            ${subtitulo ? `<small class="text-muted">${subtitulo}</small>` : ''}
                        </div>
                        <div class="modal-footer justify-content-center border-0 pb-4">
                            <button class="btn btn-secondary btn-sm" id="${id}-no">Cancelar</button>
                            <button class="btn btn-primary btn-sm"   id="${id}-si">Confirmar</button>
                        </div>
                    </div>
                </div>
            </div>
        `);
        const modal = new bootstrap.Modal(document.getElementById(id));
        modal.show();
        document.getElementById(`${id}-si`).onclick = () => { modal.hide(); resolve(true);  };
        document.getElementById(`${id}-no`).onclick = () => { modal.hide(); resolve(false); };
        document.getElementById(id).addEventListener('hidden.bs.modal', () => {
            document.getElementById(id).remove();
        });
    });
}