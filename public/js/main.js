// ============================================================
// public/js/main.js  — Punto de entrada único
//
// Este archivo SOLO:
//   1. Importa funciones de los módulos
//   2. Inicializa event listeners al cargar el DOM
//   3. Expone al HTML global las funciones que usan onclick=""
//
// NO contiene lógica de negocio ni fetch directos.
// ============================================================

// ── MÓDULOS DE NEGOCIO ────────────────────────────────────────
import { inicializarBuscadorIngreso, confirmarIngreso }            from './modules/ingreso.js';
import {
    inicializarBuscadorColaboradorEntrega,
    inicializarBuscadorProductoEntrega,
    verificarSerie,
    confirmarEntrega,
    resetModalEntrega,
}                                                                  from './modules/entrega.js';
import {
    inicializarBuscadorColaboradorDevolucion,
    inicializarBuscadorProductoDevolucion,
    verificarSerieDevolucion,
    confirmarDevolucion,
}                                                                  from './modules/devolucion.js';
import {
    buscarTrazabilidad,
    cargarVistaTrazabilidad,
    ejecutarTrazabilidad,
    inicializarBuscadorCustodia,
    resetModalCustodia,
}                                                                  from './modules/trazabilidad.js';
import { cargarFormularios, cargarTablets, cargarBodegaSeguridad, cargarBodegaGrande }
                                                                   from './modules/reportes.js';

// ── COLABORADOR (formulario simple, sin módulo propio aún) ────
import { crearColaborador }   from './api/colaboradores.api.js';
import { crearProducto }      from './api/productos.api.js';

// ============================================================
// INICIALIZACIÓN AL CARGAR EL DOM
// ============================================================
document.addEventListener('DOMContentLoaded', () => {

    // Buscadores de cada modal
    inicializarBuscadorIngreso();
    inicializarBuscadorColaboradorEntrega();
    inicializarBuscadorProductoEntrega();
    inicializarBuscadorColaboradorDevolucion();
    inicializarBuscadorProductoDevolucion();
    inicializarBuscadorCustodia();

    // Reset modal entrega al cerrar
    document.getElementById('modalEntrega')
        ?.addEventListener('hidden.bs.modal', resetModalEntrega);

    // Reset modal custodia al cerrar
    document.getElementById('modalCustodia')
    
        ?.addEventListener('hidden.bs.modal', resetModalCustodia);
    // ── NUEVO: Uniformes pendientes ──────────────────────────
    document.getElementById('modalUniformesPendientes')
        ?.addEventListener('show.bs.modal', () => {
            import('./modules/uniformes.js').then(m => m.initUniformes());
        });

    // Cerrar listas de autocompletado al hacer clic fuera
    document.addEventListener('click', _cerrarListas, true);
});

// ── CIERRE DE LISTAS DE AUTOCOMPLETADO ───────────────────────

function _cerrarListas(e) {
    const pares = [
        ['buscar-producto',     'sugerencias'],
        ['buscar-producto-ent', 'sugerencias-ent'],
        ['rut-colaborador',     'sugerencias-colab'],
        ['rut-colab-dev',       'sugerencias-colab-dev'],
        ['buscar-prod-dev',     'sugerencias-prod-dev'],
        ['rut-custodia',        'sugerencias-colab-custodia'],
    ];

    pares.forEach(([inputId, listaId]) => {
        const input = document.getElementById(inputId);
        const lista = document.getElementById(listaId);
        if (input && lista && !input.contains(e.target)) {
            lista.style.display = 'none';
        }
    });
}

// ============================================================
// FUNCIONES GLOBALES — Expuestas al HTML (onclick="...")
// El HTML usa onclick="window.xxx()" con módulos ES6.
// ============================================================

// Reportes / Inventarios
window.cargarFormularios     = cargarFormularios;
window.cargarTablets         = cargarTablets;
window.cargarBodegaSeguridad = cargarBodegaSeguridad;
window.cargarBodegaGrande    = cargarBodegaGrande;

// Trazabilidad
window.cargarVistaTrazabilidad = cargarVistaTrazabilidad;
window.ejecutarTrazabilidad    = ejecutarTrazabilidad;
window.buscarTrazabilidad      = buscarTrazabilidad;

// Ingreso
window.confirmarIngreso = confirmarIngreso;

// Entrega
window.verificarSerie   = verificarSerie;
window.confirmarEntrega = confirmarEntrega;

// Devolución
window.verificarSerieDevolucion = verificarSerieDevolucion;
window.confirmarDevolucion      = confirmarDevolucion;

// Colaborador
window.guardarColaborador = async function () {
    const datos = {
        rut:       document.getElementById('rut').value,
        nombre1:   document.getElementById('nombre1').value,
        nombre2:   document.getElementById('nombre2').value,
        apellido1: document.getElementById('apellido1').value,
        apellido2: document.getElementById('apellido2').value,
        cargo:     document.getElementById('cargo').value,
        sector:    document.getElementById('sector').value,
        telefono1: document.getElementById('telefono1').value,
        telefono2: document.getElementById('telefono2').value,
        mail:      document.getElementById('mail').value,
    };
    try {
        await crearColaborador(datos);
        alert('✅ Colaborador registrado correctamente');
        bootstrap.Modal.getInstance(document.getElementById('modalColaborador')).hide();
        document.getElementById('formColaborador').reset();
    } catch (err) {
        alert('❌ Error: ' + err.message);
    }
};

// Producto
window.guardarProducto = async function () {
    const descripcion = document.getElementById('prod-descripcion').value.trim();
    const categoria   = document.getElementById('prod-categoria').value;

    if (!descripcion || !categoria) {
        alert('⚠️ Descripción y Categoría son obligatorias.');
        return;
    }

    const datos = {
        descripcion,
        categoria,
        modelo:         document.getElementById('prod-modelo')?.value      || null,
        num_serie:      document.getElementById('prod-serie')?.value       || null,
        aerolinea:      document.getElementById('prod-aerolinea')?.value   || null,
        tipo_documento: document.getElementById('prod-tipo-doc')?.value    || null,
        marca:          document.getElementById('prod-marca')?.value       || null,
        medida:         document.getElementById('prod-medida')?.value      || null,
    };

    try {
        await crearProducto(datos);
        alert('✅ Producto registrado correctamente');
        location.reload();
    } catch (err) {
        alert('❌ Error: ' + err.message);
    }
};

// Categoría producto (muestra/oculta campos del modal)
window.verificarCategoria = function (valor) {
    document.getElementById('campos-serializados').style.display =
        (valor === 'Tablet' || valor === 'Seguridad') ? 'flex' : 'none';
    document.getElementById('campos-formularios').style.display =
        valor === 'Formulario' ? 'flex' : 'none';
    document.getElementById('campos-suministros').style.display =
        valor === 'Suministro' ? 'flex' : 'none';
};