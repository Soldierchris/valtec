// ============================================================
// public/js/modules/entrega.js
// Lógica del modal "Registrar Entrega"
// ============================================================

import { buscarProductos, obtenerDetalle, obtenerUbicacionActual } from '../api/productos.api.js';
import { buscarColaboradores }                                      from '../api/colaboradores.api.js';
import { registrarEntrega }                                         from '../api/movimientos.api.js';

// ── BUSCADOR DE COLABORADORES ────────────────────────────────

export function inicializarBuscadorColaboradorEntrega() {
    const input = document.getElementById('rut-colaborador');
    const lista = document.getElementById('sugerencias-colab');
    if (!input || !lista) return;

    input.addEventListener('input', async (e) => {
        const filtro = e.target.value.trim();
        document.getElementById('nombre-colaborador-confirmado').classList.add('d-none');
        if (filtro.length < 2) { lista.style.display = 'none'; return; }

        try {
            const datos = await buscarColaboradores(filtro);
            lista.innerHTML = '';
            if (datos.length > 0) {
                lista.style.display = 'block';
                datos.forEach(c => {
                    const item = document.createElement('a');
                    item.className = 'list-group-item list-group-item-action';
                    item.innerHTML = `<strong>${c.rut}</strong> — ${c.nombre1} ${c.apellido1}
                                      <small class="text-muted">${c.cargo || ''}</small>`;
                    item.onclick   = () => _confirmarColaboradorEntrega(c, input, lista);
                    lista.appendChild(item);
                });
            }
        } catch (err) {
            console.error('Error buscador colaborador entrega:', err);
        }
    });
}

function _confirmarColaboradorEntrega(c, input, lista) {
    input.value = c.rut;
    lista.style.display = 'none';

    document.getElementById('texto-nombre-colab').textContent =
        `${c.nombre1} ${c.nombre2 || ''} ${c.apellido1} ${c.apellido2 || ''}`.trim();
    document.getElementById('nombre-colaborador-confirmado').classList.remove('d-none');

    const badgeSector = document.getElementById('badge-sector-colab');
    if (c.sector) {
        document.getElementById('texto-sector-colab').textContent = c.sector;
        badgeSector.style.display = 'inline-flex';
    } else {
        badgeSector.style.display = 'none';
    }
}

// ── BUSCADOR DE PRODUCTOS ────────────────────────────────────

export function inicializarBuscadorProductoEntrega() {
    const input = document.getElementById('buscar-producto-ent');
    const lista = document.getElementById('sugerencias-ent');
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
                    item.innerHTML = `<strong>${p.id_articulo}</strong> — ${p.descripcion}
                                      <span class="badge bg-info">Stock: ${p.stock ?? '?'}</span>`;
                    item.onclick   = () => _seleccionarProductoEntrega(p, input, lista);
                    lista.appendChild(item);
                });
            }
        } catch (err) {
            console.error('Error buscador producto entrega:', err);
        }
    });
}

async function _seleccionarProductoEntrega(p, input, lista) {
    document.getElementById('id-articulo-ent').value   = p.id_articulo;
    document.getElementById('display-id-ent').value    = p.id_articulo;
    document.getElementById('cat-ent').value           = p.categoria;
    input.value = p.descripcion;
    document.getElementById('cant-ent').max            = p.stock;
    lista.style.display = 'none';

    // Auto-detectar bodega origen
    await _detectarBodegaOrigen(p.id_articulo);

    // Panel de serie para Tablet/Seguridad
    const panelSerie    = document.getElementById('panel-serie-entrega');
    const resultSerie   = document.getElementById('resultado-serie');
    const btnConfirmar  = document.getElementById('btn-confirmar-entrega');

    if (p.categoria === 'Seguridad' || p.categoria === 'Tablet') {
        panelSerie.classList.remove('d-none');
        document.getElementById('serie-verificar').value = '';
        resultSerie.classList.add('d-none');
        resultSerie.innerHTML  = '';
        btnConfirmar.disabled  = true;
        document.getElementById('cant-ent').value    = 1;
        document.getElementById('cant-ent').readOnly = true;
    } else {
        panelSerie.classList.add('d-none');
        btnConfirmar.disabled  = false;
        document.getElementById('cant-ent').readOnly = false;
    }
}

async function _detectarBodegaOrigen(idArticulo) {
    const textoDisplay = document.getElementById('bodega-origen-texto');
    const displayDiv   = document.getElementById('bodega-origen-display');
    const stockInfo    = document.getElementById('stock-bodega-info');
    const stockValor   = document.getElementById('stock-bodega-valor');
    const inputBodega  = document.getElementById('bodega-origen');

    textoDisplay.textContent = 'Detectando bodega...';
    displayDiv.style.borderColor = '#6c757d';

    try {
        const { ubicacion, stock_en_bodega } = await obtenerUbicacionActual(idArticulo);

        if (ubicacion) {
            inputBodega.value              = ubicacion;
            textoDisplay.textContent       = ubicacion;
            textoDisplay.style.color       = '#0d6efd';
            textoDisplay.style.fontStyle   = 'normal';
            displayDiv.style.borderColor   = '#0d6efd';
            displayDiv.style.background    = '#e8f4fd';

            if (stock_en_bodega !== undefined) {
                stockValor.textContent = stock_en_bodega;
                stockValor.className   = stock_en_bodega > 0 ? 'text-success' : 'text-danger';
                stockInfo.classList.remove('d-none');
            }
        } else {
            inputBodega.value             = '';
            textoDisplay.textContent      = '⚠️ Sin movimientos previos';
            textoDisplay.style.color      = '#dc3545';
            textoDisplay.style.fontStyle  = 'italic';
            displayDiv.style.borderColor  = '#dc3545';
            displayDiv.style.background   = '#fff5f5';
            stockInfo.classList.add('d-none');
        }
    } catch (err) {
        textoDisplay.textContent = 'Error al detectar bodega';
        textoDisplay.style.color = '#dc3545';
    }
}

// ── VERIFICAR SERIE ──────────────────────────────────────────

export async function verificarSerie() {
    const idArticulo     = document.getElementById('id-articulo-ent').value;
    const serieIngresada = document.getElementById('serie-verificar').value.trim();
    const resultado      = document.getElementById('resultado-serie');
    const btnConfirmar   = document.getElementById('btn-confirmar-entrega');

    if (!serieIngresada) {
        resultado.innerHTML = `<div class="alert alert-warning">⚠️ Ingrese un número de serie.</div>`;
        resultado.classList.remove('d-none');
        return;
    }

    try {
        const detalle = await obtenerDetalle(idArticulo);
        const coincide = detalle.num_serie &&
            detalle.num_serie.trim().toLowerCase() === serieIngresada.toLowerCase();

        if (coincide) {
            resultado.innerHTML = `
                <div class="alert alert-success">
                    ✅ <strong>Serie verificada correctamente</strong><br>
                    Producto: ${detalle.descripcion}<br>
                    Modelo: ${detalle.modelo || 'N/A'} — Serie: <strong>${detalle.num_serie}</strong>
                </div>`;
            btnConfirmar.disabled = false;
        } else {
            resultado.innerHTML = `
                <div class="alert alert-danger">
                    ❌ <strong>Serie no coincide</strong><br>
                    El número <strong>${serieIngresada}</strong> no corresponde a este producto.
                </div>`;
            btnConfirmar.disabled = true;
        }
        resultado.classList.remove('d-none');
    } catch (err) {
        resultado.innerHTML = `<div class="alert alert-danger">❌ Error al verificar: ${err.message}</div>`;
        resultado.classList.remove('d-none');
    }
}

// ── CONFIRMAR ENTREGA ────────────────────────────────────────

export async function confirmarEntrega() {
    const categoria   = document.getElementById('cat-ent').value;
    const idArticulo  = document.getElementById('id-articulo-ent').value;
    const bodegaOrigen = document.getElementById('bodega-origen').value;

    if (!bodegaOrigen) {
        alert('⚠️ No se pudo detectar la bodega de origen.');
        return;
    }

    const datos = {
        id_articulo:      idArticulo,
        rut_colaborador:  document.getElementById('rut-colaborador').value,
        cantidad:         document.getElementById('cant-ent').value,
        ubicacion:        bodegaOrigen,
        id_usuario:       1,
        serie:            null,
        modelo:           null,
<<<<<<< HEAD
=======
        cc:               typeof window.ccObtener === 'function' ? window.ccObtener('entrega') : [],
>>>>>>> 8-al-momento-de-entregar-un-producto-se-envie-un-correo-automático
    };

    if (!datos.id_articulo || !datos.rut_colaborador || !datos.cantidad) {
        alert('⚠️ Faltan datos obligatorios.');
        return;
    }

    if (categoria === 'Seguridad' || categoria === 'Tablet') {
        const serieVerificada = document.getElementById('serie-verificar')?.value.trim();
        if (!serieVerificada) {
            alert('⚠️ Debe verificar el N° de Serie antes de confirmar.');
            return;
        }
        try {
            const detalle = await obtenerDetalle(idArticulo);
            datos.serie  = detalle.num_serie  || null;
            datos.modelo = detalle.modelo     || null;
        } catch (err) {
            alert('❌ Error al obtener detalle del producto.');
            return;
        }
    }

    try {
        await registrarEntrega(datos);
        alert('✅ Entrega registrada exitosamente');
        location.reload();
    } catch (err) {
        alert('❌ Error: ' + err.message);
    }
}

// ── RESET AL CERRAR MODAL ────────────────────────────────────

export function resetModalEntrega() {
    const textoDisplay = document.getElementById('bodega-origen-texto');
    const displayDiv   = document.getElementById('bodega-origen-display');
    const stockInfo    = document.getElementById('stock-bodega-info');

    if (textoDisplay) {
        textoDisplay.textContent   = 'Seleccione un producto...';
        textoDisplay.style.color   = '#6c757d';
        textoDisplay.style.fontStyle = 'italic';
    }
    if (displayDiv) {
        displayDiv.style.borderColor = '#6c757d';
        displayDiv.style.background  = '#f8f9fa';
    }
    if (stockInfo) stockInfo.classList.add('d-none');

    document.getElementById('bodega-origen').value = '';
    document.getElementById('badge-sector-colab')?.style?.setProperty('display', 'none');
    document.getElementById('nombre-colaborador-confirmado')?.classList.add('d-none');
    document.getElementById('panel-serie-entrega')?.classList.add('d-none');
    document.getElementById('btn-confirmar-entrega').disabled = false;
}