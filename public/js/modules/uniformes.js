// ============================================================
// public/js/modules/uniformes.js
// Módulo: Uniformes y Artículos Pendientes de Retiro
// Patrón consistente con entrega.js, devolucion.js, etc.
// ============================================================

import { uniformesAPI }      from '../api/uniformesAPI.js';
import { buscarColaboradores } from '../api/colaboradores.api.js'; // ← reutiliza el mismo que entrega.js

// ── Estado local ──────────────────────────────────────────────
let pendientes       = [];
let colaboradorSelec = null;

// ── Inicialización ────────────────────────────────────────────
export async function initUniformes() {
    await renderTabla();
    bindEvents();
}

// ── Render tabla principal ────────────────────────────────────
async function renderTabla() {
    try {
        pendientes = await uniformesAPI.listar();
    } catch (err) {
        console.error('[uniformes] Error al listar:', err);
        pendientes = [];
    }

    const contenedor = document.getElementById('uniformes-contenedor');
    if (!contenedor) return;

    contenedor.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="mb-0 fw-semibold text-secondary">
                📦 Uniformes y Artículos Pendientes de Retiro — Bodega Central
            </h5>
            <button class="btn btn-primary btn-sm" id="btn-add-uniforme">
                ➕ Add
            </button>
        </div>

        ${pendientes.length === 0
            ? `<div class="alert alert-success mb-0">
                   ✅ No hay artículos pendientes de retiro.
               </div>`
            : `<div class="table-responsive">
                   <table class="table table-hover table-sm align-middle">
                       <thead class="table-dark">
                           <tr>
                               <th>Ingreso</th>
                               <th>RUT</th>
                               <th>Nombre</th>
                               <th>Sector</th>
                               <th>Descripción</th>
                               <th class="text-center">Notificaciones</th>
                               <th class="text-center">Días en bodega</th>
                               <th class="text-center">Acciones</th>
                           </tr>
                       </thead>
                       <tbody>
                           ${pendientes.map(filaHTML).join('')}
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
            <td><small class="text-muted">${p.colaborador_rut}</small></td>
            <td>${p.nombre_completo}</td>
            <td>${p.sector || '—'}</td>
            <td><small>${p.descripcion || '—'}</small></td>
            <td class="text-center">
                <span class="badge bg-secondary">${p.notificaciones}</span>
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
/*
function bindEvents() {
    const contenedor = document.getElementById('uniformes-contenedor');
    if (!contenedor) return;

    contenedor.addEventListener('click', (e) => {
        if (e.target.closest('#btn-add-uniforme'))  abrirModalAdd();
        if (e.target.closest('.btn-notificar'))     handleNotificar(e.target.closest('.btn-notificar'));
        if (e.target.closest('.btn-cerrar'))        handleCerrar(e.target.closest('.btn-cerrar'));
    });
}*/
function bindEvents() {
    const contenedor = document.getElementById('uniformes-contenedor');
    
    // 🛡️ Si el contenedor no existe o ya tiene los eventos vinculados, salimos.
    if (!contenedor || contenedor.dataset.eventsBound) return;

    contenedor.addEventListener('click', (e) => {
        if (e.target.closest('#btn-add-uniforme'))  abrirModalAdd();
        if (e.target.closest('.btn-notificar'))     handleNotificar(e.target.closest('.btn-notificar'));
        if (e.target.closest('.btn-cerrar'))        handleCerrar(e.target.closest('.btn-cerrar'));
    });

    // 🏷️ Marcamos el contenedor para saber que ya está protegido
    contenedor.dataset.eventsBound = "true";
}

// ── Modal Add ─────────────────────────────────────────────────
function abrirModalAdd() {
    colaboradorSelec = null;

    // Inyectar modal si no existe aún en el DOM
    if (!document.getElementById('modal-add-uniforme')) {
        document.body.insertAdjacentHTML('beforeend', modalAddHTML());
    }

    // Resetear campos
    document.getElementById('uniforme-rut').value  = '';
    document.getElementById('uniforme-desc').value = '';
    document.getElementById('btn-guardar-uniforme').disabled = true;
    document.getElementById('uniforme-autocomplete').style.display = 'none';

    const modal = new bootstrap.Modal(document.getElementById('modal-add-uniforme'));
    modal.show();

    // Autocomplete — usa buscarColaboradores igual que entrega.js y devolucion.js
    const inputRut   = document.getElementById('uniforme-rut');
    const inputDesc  = document.getElementById('uniforme-desc');
    const dropdown   = document.getElementById('uniforme-autocomplete');
    const btnGuardar = document.getElementById('btn-guardar-uniforme');

    // Remover listeners previos clonando el nodo
    const inputRutNuevo = inputRut.cloneNode(true);
    inputRut.parentNode.replaceChild(inputRutNuevo, inputRut);

    inputRutNuevo.addEventListener('input', async function () {
        const q = this.value.trim();
        colaboradorSelec = null;
        //btnGuardar.disabled = true;
        document.getElementById('btn-guardar-uniforme').disabled = true;

        if (q.length < 2) {
            dropdown.innerHTML = '';
            dropdown.style.display = 'none';
            return;
        }

        try {
            // ← Mismo endpoint que usa entrega.js: /api/colaboradores/buscar?q=
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
              /*  li.addEventListener('click', () => {
                    colaboradorSelec         = c;
                    inputRutNuevo.value      = `${c.rut} — ${c.nombre1} ${c.apellido1}`;
                    dropdown.style.display   = 'none';
                    btnGuardar.disabled      = false;
                    inputDesc.focus();
                });*/

                li.addEventListener('click', () => {
                    colaboradorSelec = c;
                    inputRutNuevo.value = `${c.rut} — ${c.nombre1} ${c.apellido1}`;
                    dropdown.style.display = 'none';
                    document.getElementById('btn-guardar-uniforme').disabled = false; // ✅ Apunta al botón real en pantalla
                    inputDesc.focus();
                });

                dropdown.appendChild(li);
            });

            dropdown.style.display = 'block';
        } catch (err) {
            console.error('[uniformes] Error autocomplete:', err);
        }
    });

    // Cerrar dropdown al click afuera
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target) && e.target !== inputRutNuevo) {
            dropdown.style.display = 'none';
        }
    });

    // Guardar — nuevo listener limpio
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
            await renderTabla();
            bindEvents();
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
        await renderTabla();
        //bindEvents();
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
        await renderTabla();
        //bindEvents();
    } catch (err) {
        console.error('[uniformes] Error al cerrar:', err);
        mostrarToast('❌ Error al cerrar el registro', 'danger');
        btn.disabled  = false;
        btn.innerHTML = '✔️ Cerrar';
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
             role="alert" style="z-index:9999">
            <div class="d-flex">
                <div class="toast-body">${mensaje}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto"
                        data-bs-dismiss="toast"></button>
            </div>
        </div>
    `);
    const el = document.getElementById(id);
    new bootstrap.Toast(el, { delay: 3500 }).show();
    el.addEventListener('hidden.bs.toast', () => el.remove());
}

function confirmar(titulo, subtitulo = '') {
    return new Promise((resolve) => {
        const id = `confirm-${Date.now()}`;
        document.body.insertAdjacentHTML('beforeend', `
            <div class="modal fade" id="${id}" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered modal-sm">
                    <div class="modal-content">
                        <div class="modal-body text-center pt-4">
                            <div style="font-size:2.5rem">⚠️</div>
                            <p class="mb-1 mt-2">${titulo}</p>
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