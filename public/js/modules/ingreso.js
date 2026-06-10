// ============================================================
// public/js/modules/ingreso.js
// Lógica del modal "Nuevo Ingreso" — separada del DOM global.
// ============================================================

import { buscarProductos, obtenerDetalle } from '../api/productos.api.js';
import { registrarIngreso }                from '../api/movimientos.api.js';

// ── BUSCADOR DE PRODUCTOS ────────────────────────────────────

export function inicializarBuscadorIngreso() {
    const input  = document.getElementById('buscar-producto');
    const lista  = document.getElementById('sugerencias');
    if (!input || !lista) return;

    input.addEventListener('input', async (e) => {
        const texto = e.target.value.trim();
        if (texto.length < 2) { lista.style.display = 'none'; return; }

        try {
            const productos = await buscarProductos(texto);
            lista.innerHTML = '';

            if (productos.length > 0) {
                lista.style.display = 'block';
                productos.forEach(p => {
                    const item = document.createElement('a');
                    item.className = 'list-group-item list-group-item-action';
                    item.innerHTML = `<strong>ID: ${p.id_articulo}</strong> — ${p.descripcion}`;
                    item.onclick   = () => seleccionarProductoIngreso(p);
                    lista.appendChild(item);
                });
            }
        } catch (err) {
            console.error('Error buscador ingreso:', err);
        }
    });
}

// ── SELECCIÓN DE PRODUCTO ────────────────────────────────────

async function seleccionarProductoIngreso(producto) {
    document.getElementById('buscar-producto').value      = producto.descripcion;
    document.getElementById('id_articulo').value          = producto.id_articulo;
    document.getElementById('display-id').value           = producto.id_articulo;
    document.getElementById('categoria-detectada').value  = producto.categoria;
    document.getElementById('sugerencias').style.display  = 'none';

    _actualizarPanelDinamico(producto.categoria);

    // Tablets y Seguridad → bloquear cantidad en 1 y autorellenar modelo
    const campoCantidad = document.getElementById('cantidad');
    if (producto.categoria === 'Tablet' || producto.categoria === 'Seguridad') {
        try {
            const detalle   = await obtenerDetalle(producto.id_articulo);
            const idModelo  = producto.categoria === 'Tablet' ? 'modelo-tablet' : 'modelo-seguridad';
            const campoMod  = document.getElementById(idModelo);
            if (campoMod && detalle.modelo) campoMod.value = detalle.modelo;
        } catch (err) {
            console.error('Error obteniendo detalle:', err);
        }
        campoCantidad.value    = 1;
        campoCantidad.readOnly = true;
        campoCantidad.classList.add('bg-light');
    } else {
        campoCantidad.readOnly = false;
        campoCantidad.classList.remove('bg-light');
    }
}

// ── PANEL DINÁMICO POR CATEGORÍA ─────────────────────────────

function _actualizarPanelDinamico(categoria) {
    const panel = document.getElementById('panel-dinamico');
    if (!panel) return;

    panel.innerHTML = '';
    panel.classList.add('d-none');

    const plantillas = {
        Formulario: `
            <div class="row">
                <div class="col-md-12">
                    <label class="form-label fw-bold">Aerolínea</label>
                    <select id="aerolinea" class="form-select" required>
                        <option value="">Seleccione Aerolínea...</option>
                        <option value="LATAM">LATAM</option>
                        <option value="SKY">SKY</option>
                        <option value="Otro">OTRO</option>
                    </select>
                </div>
            </div>`,

        Seguridad: `
            <div class="row g-2">
                <div class="col-md-6">
                    <label class="form-label fw-bold">Modelo</label>
                    <input type="text" id="modelo-seguridad" class="form-control bg-light text-muted"
                           readonly placeholder="Se carga automáticamente...">
                </div>
                <div class="col-md-6">
                    <label class="form-label fw-bold">🔖 N° de Serie (EPI)</label>
                    <input type="text" id="serie-seguridad" class="form-control"
                           placeholder="Tipee el número de serie..." required>
                </div>
            </div>`,

        Tablet: `
            <div class="row g-2">
                <div class="col-md-6">
                    <label class="form-label fw-bold">Modelo</label>
                    <input type="text" id="modelo-tablet" class="form-control bg-light text-muted"
                           readonly placeholder="Se carga automáticamente...">
                </div>
                <div class="col-md-6">
                    <label class="form-label fw-bold">🔖 Número de Serie</label>
                    <input type="text" id="serie-tablet" class="form-control"
                           placeholder="S/N del dispositivo" required>
                </div>
            </div>`,
    };

    if (plantillas[categoria]) {
        panel.innerHTML = plantillas[categoria];
        panel.classList.remove('d-none');
    }
}

// ── CONFIRMAR INGRESO ────────────────────────────────────────

export async function confirmarIngreso() {
    const categoria  = document.getElementById('categoria-detectada').value;
    const idArticulo = document.getElementById('id_articulo').value;

    const datos = {
        id_articulo: idArticulo,
        cantidad:    document.getElementById('cantidad').value,
        ubicacion:   document.getElementById('ubicacion').value,
        id_usuario:  1,
        modelo:      null,
        serie:       null,
        aerolinea:   null,
    };

    if (!datos.id_articulo || !datos.cantidad || !datos.ubicacion) {
        alert('⚠️ Por favor, complete todos los campos del ingreso.');
        return;
    }

    // Campos por categoría
    if (categoria === 'Tablet') {
        datos.modelo = document.getElementById('modelo-tablet')?.value  || null;
        datos.serie  = document.getElementById('serie-tablet')?.value   || null;
    } else if (categoria === 'Seguridad') {
        datos.modelo = document.getElementById('modelo-seguridad')?.value || null;
        datos.serie  = document.getElementById('serie-seguridad')?.value  || null;
    } else if (categoria === 'Formulario') {
        datos.aerolinea = document.getElementById('aerolinea')?.value || null;
    }

    // Validar serie para Tablet/Seguridad
    if (categoria === 'Tablet' || categoria === 'Seguridad') {
        if (!datos.serie) {
            alert('⚠️ Debe ingresar el N° de Serie.');
            return;
        }
        try {
            const detalle = await obtenerDetalle(idArticulo);
            if (!detalle.num_serie ||
                detalle.num_serie.trim().toLowerCase() !== datos.serie.trim().toLowerCase()) {
                alert(`❌ Serie incorrecta.\n"${datos.serie}" no corresponde a este producto.\nVerifique el número físico.`);
                return;
            }
        } catch (err) {
            alert('❌ Error al verificar la serie. Intente nuevamente.');
            return;
        }
    }

    try {
        await registrarIngreso(datos);
        alert('✅ Ingreso registrado correctamente.');
        location.reload();
    } catch (err) {
        alert('❌ Error al registrar: ' + err.message);
    }
}