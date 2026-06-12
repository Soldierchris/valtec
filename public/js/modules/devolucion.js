// ============================================================
// public/js/modules/devolucion.js NEW
// Lógica del modal "Registrar Devolución"
// ============================================================

import { buscarProductos, obtenerDetalle } from '../api/productos.api.js';
import { buscarColaboradores }             from '../api/colaboradores.api.js';
import { registrarDevolucion }             from '../api/movimientos.api.js';

// ── BUSCADOR DE COLABORADORES ────────────────────────────────

export function inicializarBuscadorColaboradorDevolucion() {
    const input = document.getElementById('rut-colab-dev');
    const lista = document.getElementById('sugerencias-colab-dev');
    if (!input || !lista) return;

    input.addEventListener('input', async (e) => {
        const filtro = e.target.value.trim();
        document.getElementById('nombre-colab-dev-confirmado').classList.add('d-none');
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
                    item.onclick   = () => {
                        input.value = c.rut;
                        lista.style.display = 'none';
                        document.getElementById('texto-nombre-colab-dev').textContent =
                            `${c.nombre1} ${c.nombre2 || ''} ${c.apellido1} ${c.apellido2 || ''}`.trim();
                        document.getElementById('nombre-colab-dev-confirmado').classList.remove('d-none');
                    };
                    lista.appendChild(item);
                });
            }
        } catch (err) {
            console.error('Error buscador colab dev:', err);
        }
    });
}

// ── BUSCADOR DE PRODUCTOS ────────────────────────────────────

export function inicializarBuscadorProductoDevolucion() {
    const input = document.getElementById('buscar-prod-dev');
    const lista = document.getElementById('sugerencias-prod-dev');
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
                                      <span class="badge bg-secondary">${p.categoria}</span>`;
                    item.onclick   = () => _seleccionarProductoDevolucion(p, input, lista);
                    lista.appendChild(item);
                });
            }
        } catch (err) {
            console.error('Error buscador prod dev:', err);
        }
    });
}

function _seleccionarProductoDevolucion(p, input, lista) {
    document.getElementById('id-articulo-dev').value  = p.id_articulo;
    document.getElementById('display-id-dev').value   = p.id_articulo;
    document.getElementById('cat-dev').value          = p.categoria;
    input.value = p.descripcion;
    lista.style.display = 'none';

    const panelSerie   = document.getElementById('panel-serie-dev');
    const btnConfirmar = document.getElementById('btn-confirmar-dev');
    const resultSerie  = document.getElementById('resultado-serie-dev');

    if (p.categoria === 'Seguridad' || p.categoria === 'Tablet') {
        panelSerie.classList.remove('d-none');
        document.getElementById('serie-dev').value = '';
        resultSerie.classList.add('d-none');
        btnConfirmar.disabled = true;
    } else {
        panelSerie.classList.add('d-none');
        btnConfirmar.disabled = false;
    }
}

// ── VERIFICAR SERIE ──────────────────────────────────────────

export async function verificarSerieDevolucion() {
    const idArticulo     = document.getElementById('id-articulo-dev').value;
    const serieIngresada = document.getElementById('serie-dev').value.trim();
    const resultado      = document.getElementById('resultado-serie-dev');
    const btnConfirmar   = document.getElementById('btn-confirmar-dev');

    if (!serieIngresada) {
        resultado.innerHTML = `<div class="alert alert-warning">⚠️ Ingrese un número de serie.</div>`;
        resultado.classList.remove('d-none');
        return;
    }

    try {
        const detalle  = await obtenerDetalle(idArticulo);
        const coincide = detalle.num_serie &&
            detalle.num_serie.trim().toLowerCase() === serieIngresada.toLowerCase();

        resultado.innerHTML = coincide
            ? `<div class="alert alert-success">
                   ✅ <strong>Serie verificada</strong><br>
                   Producto: ${detalle.descripcion}<br>
                   Modelo: ${detalle.modelo || 'N/A'} — Serie: <strong>${detalle.num_serie}</strong>
               </div>`
            : `<div class="alert alert-danger">
                   ❌ <strong>Serie no coincide</strong><br>
                   El número <strong>${serieIngresada}</strong> no corresponde a este producto.
               </div>`;

        btnConfirmar.disabled = !coincide;
        resultado.classList.remove('d-none');
    } catch (err) {
        resultado.innerHTML = `<div class="alert alert-danger">❌ Error al verificar: ${err.message}</div>`;
        resultado.classList.remove('d-none');
    }
}

// ── CONFIRMAR DEVOLUCIÓN ─────────────────────────────────────

export async function confirmarDevolucion() {
    const categoria = document.getElementById('cat-dev').value;

    const datos = {
        id_articulo:     document.getElementById('id-articulo-dev').value,
        rut_colaborador: document.getElementById('rut-colab-dev').value,
        ubicacion:       document.getElementById('bodega-dev').value,
        observacion:     document.getElementById('observacion-dev').value,
        cc:              typeof window.ccObtener === 'function' ? window.ccObtener('devolucion') : [],
        serie: (categoria === 'Seguridad' || categoria === 'Tablet')
            ? document.getElementById('serie-dev').value.trim()
            : null,
    };

    if (!datos.id_articulo || !datos.rut_colaborador) {
        alert('⚠️ Complete colaborador y producto.');
        return;
    }

    try {
        await registrarDevolucion(datos);
        alert('✅ Devolución registrada exitosamente');
        location.reload();
    } catch (err) {
        alert('❌ Error: ' + err.message);
    }
}