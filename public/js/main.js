// ==========================================
// 1. CARGA DE REPORTES (TABLAS LATAM/SKY) NO TOCAR TOTALMENTE OPERATICO 
// ==========================================
async function cargarFormularios(aerolinea) {
    const titulo = document.getElementById('titulo-reporte');
    const cuerpo = document.getElementById('tabla-cuerpo');
    if (!cuerpo) return;

    try {
        const respuesta = await fetch(`/api/formularios/${aerolinea}`);
        const datos = await respuesta.json();
        cuerpo.innerHTML = '';

        if (datos.length === 0) {
            cuerpo.innerHTML = '<tr><td colspan="4" class="text-center">No hay datos</td></tr>';
            return;
        }

        datos.forEach(item => {
            cuerpo.innerHTML += `
                <tr>
                    <td>${item.id_articulo}</td>
                    <td>${item.descripcion}</td>
                    <td>${item.tipo_documento}</td>
                    <td><span class="badge ${item.stock_disponible > 0 ? 'bg-success' : 'bg-danger'}">${item.stock_disponible}</span></td>
                </tr>`;
        });
        if (titulo) titulo.innerText = `Inventario de Formularios: ${aerolinea}`;
    } catch (error) {
        console.error("Error cargando reportes:", error);
    }
}  

// ==========================================
// VERIFICA CATEGORIA AL INGRESAR PRODUCTOS  
// ==========================================
// Hace que aparezcan los campos de Serie/Modelo
function verificarCategoria(valor) {
    // Ocultamos todo primero
    const seccionSerial = document.getElementById('campos-serializados');
    const seccionForms = document.getElementById('campos-formularios');
    const seccionSuministros = document.getElementById('campos-suministros');

    seccionSerial.style.display = 'none';
    seccionForms.style.display = 'none';
    seccionSuministros.style.display = 'none';

    // Mostramos según la selección
    if (valor === 'Tablet' || valor === 'Seguridad') {
        seccionSerial.style.display = 'flex';
    } else if (valor === 'Formulario') {
        seccionForms.style.display = 'flex';
    } else if (valor === 'Suministro') {
        seccionSuministros.style.display = 'flex';
    }
}

// Envía los datos al Backend
async function guardarProducto() {
    // 1. Capturamos los elementos del DOM
    const inputDesc = document.getElementById('prod-descripcion');
    const selectCat = document.getElementById('prod-categoria');
    
    // 2. Extraemos los valores (Una sola vez por variable)
    const descripcion = inputDesc.value.trim();
    const categoria = selectCat.value;

    // 3. Validamos los campos obligatorios
    if (!descripcion || !categoria) {
        alert("⚠️ Descripción y Categoría son obligatorias.");
        return;
    }

    // 4. Armamos el objeto con TODAS las posibles categorías
    const datos = {
        descripcion: descripcion,
        categoria: categoria,
        // Campos para Tablet / Seguridad
        modelo: document.getElementById('prod-modelo')?.value || null,
        num_serie: document.getElementById('prod-serie')?.value || null,
        // Campos para Formulario
        aerolinea: document.getElementById('prod-aerolinea')?.value || null,
        tipo_documento: document.getElementById('prod-tipo-doc')?.value || null,
        // Campos para Suministro
        marca: document.getElementById('prod-marca')?.value || null,
        medida: document.getElementById('prod-medida')?.value || null
    };

    console.log("DATOS A ENVIAR:", datos);

    try {
        const respuesta = await fetch('/api/productos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        if (respuesta.ok) {
            alert("✅ Producto registrado correctamente");
            location.reload();
        } else {
            const res = await respuesta.json();
            alert("❌ Error: " + (res.error || "Desconocido"));
        }
    } catch (error) {
        console.error("Error en el fetch:", error);
        alert("Error de conexión con el servidor");
    }
}

// ==========================================
// 1. CARGA DE TABLTES  
// ==========================================
async function cargarTablets() {
    const titulo = document.getElementById('titulo-reporte');
    const cuerpo = document.getElementById('tabla-cuerpo');
    const cabecera = document.querySelector('thead');
    
    titulo.innerText = "Cargando Listado de Tablets...";
    
    // Cambiamos la cabecera para que coincida con los datos de las tablets
    cabecera.innerHTML = `
        <tr>
            <th>ID</th>
            <th>Modelo / Serie</th>
            <th>Descripción</th>
            <th>Cantidad</th>
            <th>Estado</th>
            <th>Ubicacion</th>
        </tr>
    `;

    try {
        const respuesta = await fetch('/api/tablets');
        const datos = await respuesta.json();

        cuerpo.innerHTML = '';
        datos.forEach(tablet => {
            const fila = `
                <tr>
                    <td>${tablet.id_articulo}</td>
                    <td><strong>${tablet.modelo}</strong><br>
                    <small class="text-muted">${tablet.num_serie}</small></td>
                    <td>${tablet.descripcion}</td>
                    <td>1</td>
                    <td>
                        <span class="badge ${tablet.estado === 'Disponible' ? 'bg-success' : 'bg-primary'}">
                            ${tablet.estado}
                        </span>
                    </td>
                    <td>${tablet.ubicacion || 'Sin asignar'}</td>
                </tr>
            `;
            cuerpo.innerHTML += fila;
        });
        
        titulo.innerText = "Inventario General de Tablets";

    } catch (error) {
        console.error("Error:", error);
        cuerpo.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Error al cargar tablets</td></tr>';
    }
}

// ==========================================
// INVENTARIO BODEGA SEGURIDAD
// ==========================================
async function cargarBodegaSeguridad() {
    const titulo = document.getElementById('titulo-reporte');
    const cuerpo = document.getElementById('tabla-cuerpo');
    const cabecera = document.querySelector('thead');

    titulo.innerText = "Cargando Inventario Bodega Seguridad...";

    cabecera.innerHTML = `
        <tr>
            <th>ID</th>
            <th>Descripción</th>
            <th>Modelo</th>
            <th>N° de Serie</th>
            <th>Stock Disponible</th>
        </tr>
    `;

    try {
        const respuesta = await fetch('/api/movimientos/bodega-seguridad');
        const datos = await respuesta.json();

        cuerpo.innerHTML = '';

        if (datos.length === 0) {
            cuerpo.innerHTML = '<tr><td colspan="5" class="text-center">No hay productos de Seguridad registrados</td></tr>';
            titulo.innerText = "Inventario Bodega Seguridad";
            return;
        }

        datos.forEach(item => {
            cuerpo.innerHTML += `
                <tr>
                    <td>${item.id_articulo}</td>
                    <td>${item.descripcion}</td>
                    <td>${item.modelo || 'N/A'}</td>
                    <td><strong>${item.num_serie || 'Sin serie'}</strong></td>
                    <td>
                        <span class="badge ${item.stock_disponible > 0 ? 'bg-success' : 'bg-danger'}">
                            ${item.stock_disponible}
                        </span>
                    </td>
                </tr>
            `;
        });

        titulo.innerText = "Inventario Bodega Seguridad";

    } catch (error) {
        console.error("Error:", error);
        cuerpo.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error al cargar inventario</td></tr>';
    }
}
// ==========================================
// INVENTARIO BODEGA GRANDE
// ==========================================
async function cargarBodegaGrande() {
    const titulo = document.getElementById('titulo-reporte');
    const cuerpo = document.getElementById('tabla-cuerpo');
    const cabecera = document.querySelector('thead');

    titulo.innerText = "Cargando Inventario Bodega Grande...";

    cabecera.innerHTML = `
        <tr>
            <th>ID</th>
            <th>Descripción</th>
            <th>Categoría</th>
            <th>Modelo</th>
            <th>N° de Serie</th>
            <th>Stock Disponible</th>
        </tr>
    `;

    try {
        const respuesta = await fetch('/api/movimientos/bodega-grande');
        const datos = await respuesta.json();

        cuerpo.innerHTML = '';

        if (datos.length === 0) {
            cuerpo.innerHTML = '<tr><td colspan="6" class="text-center">No hay productos en Bodega Grande</td></tr>';
            titulo.innerText = "Inventario Bodega Grande";
            return;
        }

        datos.forEach(item => {
            cuerpo.innerHTML += `
                <tr>
                    <td>${item.id_articulo}</td>
                    <td>${item.descripcion}</td>
                    <td><span class="badge bg-secondary">${item.categoria}</span></td>
                    <td>${item.modelo || 'N/A'}</td>
                    <td><strong>${item.num_serie || '—'}</strong></td>
                    <td>
                        <span class="badge ${item.stock_disponible > 0 ? 'bg-success' : 'bg-danger'}">
                            ${item.stock_disponible}
                        </span>
                    </td>
                </tr>
            `;
        });

        titulo.innerText = "Inventario Bodega Grande";

    } catch (error) {
        console.error("Error:", error);
        cuerpo.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error al cargar inventario</td></tr>';
    }
}

// ==========================================
// TRAZABILIDAD — VISTA COMPLETA EN PÁGINA
// ==========================================
function cargarVistaTrazabilidad() {
    const titulo = document.getElementById('titulo-reporte');
    const cabecera = document.querySelector('thead');
    const cuerpo = document.getElementById('tabla-cuerpo');

    titulo.innerText = "Trazabilidad de Activos";

    // Reemplazamos la tabla con la vista completa
    cabecera.innerHTML = '';
    cuerpo.innerHTML = `
        <tr><td style="padding:0; border:none;">
        <div style="padding: 24px 8px;">

            <!-- BUSCADOR -->
            <div style="
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
                border-radius: 16px;
                padding: 32px;
                margin-bottom: 28px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.2);
            ">
                <div style="text-align:center; margin-bottom:20px;">
                    <span style="font-size:2.5rem;">🔍</span>
                    <h2 style="color:white; margin:8px 0 4px; font-weight:700; letter-spacing:1px;">
                        Trazabilidad de Activo
                    </h2>
                    <p style="color:#a0aec0; margin:0; font-size:0.95rem;">
                        Ingrese el número de serie para ver el historial completo de custodia
                    </p>
                </div>
                <div style="display:flex; gap:12px; max-width:600px; margin:0 auto;">
                    <input 
                        type="text" 
                        id="input-trazabilidad-pagina"
                        placeholder="Ej: ABC-001, SN-SAM-002..."
                        style="
                            flex:1;
                            padding: 14px 20px;
                            border-radius: 10px;
                            border: 2px solid #4a5568;
                            background: rgba(255,255,255,0.1);
                            color: white;
                            font-size: 1.05rem;
                            outline: none;
                            backdrop-filter: blur(10px);
                        "
                        onkeydown="if(event.key==='Enter') ejecutarTrazabilidad()"
                        onfocus="this.style.borderColor='#63b3ed'"
                        onblur="this.style.borderColor='#4a5568'"
                    >
                    <button 
                        onclick="ejecutarTrazabilidad()"
                        style="
                            padding: 14px 28px;
                            border-radius: 10px;
                            border: none;
                            background: linear-gradient(135deg, #667eea, #764ba2);
                            color: white;
                            font-weight: 700;
                            font-size: 1rem;
                            cursor: pointer;
                            white-space: nowrap;
                            box-shadow: 0 4px 15px rgba(102,126,234,0.4);
                            transition: transform 0.1s;
                        "
                        onmouseover="this.style.transform='translateY(-2px)'"
                        onmouseout="this.style.transform='translateY(0)'"
                    >
                        🔍 Buscar
                    </button>
                </div>
            </div>

            <!-- RESULTADO -->
            <div id="resultado-trazabilidad-pagina"></div>

        </div>
        </td></tr>
    `;
}

async function ejecutarTrazabilidad() {
    const serie = document.getElementById('input-trazabilidad-pagina')?.value.trim();
    const contenedor = document.getElementById('resultado-trazabilidad-pagina');
    if (!serie) return;

    contenedor.innerHTML = `
        <div style="text-align:center; padding:40px; color:#718096;">
            <div style="font-size:2rem; margin-bottom:8px;">⏳</div>
            <p>Buscando historial de custodia...</p>
        </div>`;

    try {
        const res = await fetch(`/api/movimientos/trazabilidad/${encodeURIComponent(serie)}`);
        const movimientos = await res.json();

        if (movimientos.length === 0) {
            contenedor.innerHTML = `
                <div style="
                    background: #fff8e1;
                    border-left: 5px solid #f6c90e;
                    border-radius: 12px;
                    padding: 24px 28px;
                    display:flex; align-items:center; gap:16px;
                ">
                    <span style="font-size:2rem;">⚠️</span>
                    <div>
                        <strong style="color:#744210; font-size:1.1rem;">Serie no encontrada</strong>
                        <p style="color:#975a16; margin:4px 0 0;">
                            No se encontraron movimientos para la serie <code>${serie}</code>.<br>
                            Verifique que el número sea correcto.
                        </p>
                    </div>
                </div>`;
            return;
        }

        // Config visual por tipo de movimiento
        const config = {
            'Ingreso':    { color: '#38a169', bg: '#f0fff4', border: '#9ae6b4', icono: '📥', label: 'INGRESO A BODEGA' },
            'Entrega':    { color: '#3182ce', bg: '#ebf8ff', border: '#90cdf4', icono: '📤', label: 'ENTREGA A COLABORADOR' },
            'Devolución': { color: '#e53e3e', bg: '#fff5f5', border: '#feb2b2', icono: '↩️', label: 'DEVOLUCIÓN A BODEGA' },
            'Traslado':   { color: '#d69e2e', bg: '#fffff0', border: '#faf089', icono: '🔄', label: 'TRASLADO' },
        };

        const ultimo = movimientos[movimientos.length - 1];
        const cfgUltimo = config[ultimo.tipo_movimiento] || { color:'#718096', icono:'❓', label: ultimo.tipo_movimiento };

        // Estadísticas
        const stats = { Ingreso: 0, Entrega: 0, 'Devolución': 0, Traslado: 0 };
        movimientos.forEach(m => { if (stats[m.tipo_movimiento] !== undefined) stats[m.tipo_movimiento]++; });

        let html = `
            <!-- TARJETA RESUMEN DEL ACTIVO -->
            <div style="
                background: white;
                border-radius: 16px;
                padding: 28px 32px;
                margin-bottom: 24px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                border-top: 5px solid ${cfgUltimo.color};
            ">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:16px;">
                    <div>
                        <p style="color:#718096; font-size:0.8rem; text-transform:uppercase; letter-spacing:1px; margin:0 0 4px;">Activo Identificado</p>
                        <h3 style="margin:0 0 6px; color:#1a202c; font-size:1.4rem; font-weight:700;">
                            ${movimientos[0].descripcion}
                        </h3>
                        <div style="display:flex; gap:12px; flex-wrap:wrap;">
                            <span style="background:#edf2f7; color:#4a5568; padding:4px 12px; border-radius:20px; font-size:0.85rem;">
                                🔖 Serie: <strong>${serie}</strong>
                            </span>
                            <span style="background:#edf2f7; color:#4a5568; padding:4px 12px; border-radius:20px; font-size:0.85rem;">
                                📂 ${movimientos[0].categoria}
                            </span>
                        </div>
                    </div>
                    <div style="text-align:center;">
                        <p style="color:#718096; font-size:0.75rem; text-transform:uppercase; margin:0 0 6px;">Estado Actual</p>
                        <span style="
                            background: ${cfgUltimo.color};
                            color: white;
                            padding: 10px 20px;
                            border-radius: 30px;
                            font-weight: 700;
                            font-size: 1rem;
                            display:inline-block;
                        ">${cfgUltimo.icono} ${ultimo.tipo_movimiento}</span>
                        ${ultimo.nombre_colaborador ? `
                        <p style="color:#718096; font-size:0.8rem; margin:8px 0 0;">
                            En poder de: <strong>${ultimo.nombre_colaborador}</strong>
                        </p>` : ''}
                    </div>
                </div>

                <!-- ESTADÍSTICAS -->
                <div style="
                    display:grid; grid-template-columns: repeat(4, 1fr);
                    gap:12px; margin-top:24px; padding-top:20px;
                    border-top: 1px solid #e2e8f0;
                ">
                    ${[
                        { key:'Ingreso',    icono:'📥', color:'#38a169', label:'Ingresos' },
                        { key:'Entrega',    icono:'📤', color:'#3182ce', label:'Entregas' },
                        { key:'Devolución', icono:'↩️', color:'#e53e3e', label:'Devoluciones' },
                        { key:'Traslado',   icono:'🔄', color:'#d69e2e', label:'Traslados' },
                    ].map(s => `
                        <div style="text-align:center; padding:12px; background:#f7fafc; border-radius:10px;">
                            <div style="font-size:1.5rem;">${s.icono}</div>
                            <div style="font-size:1.6rem; font-weight:700; color:${s.color};">${stats[s.key]}</div>
                            <div style="font-size:0.75rem; color:#718096; text-transform:uppercase;">${s.label}</div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- LÍNEA DE TIEMPO -->
            <div style="background:white; border-radius:16px; padding:28px 32px; box-shadow:0 4px 20px rgba(0,0,0,0.08);">
                <h5 style="color:#2d3748; font-weight:700; margin:0 0 24px; font-size:1.1rem;">
                    📋 Historial Completo de Custodia
                </h5>
                <div style="position:relative;">
                    <!-- Línea vertical -->
                    <div style="
                        position:absolute; left:27px; top:0; bottom:0;
                        width:3px; background: linear-gradient(to bottom, #e2e8f0, #e2e8f0);
                        border-radius:3px;
                    "></div>
        `;

        movimientos.forEach((m, i) => {
            const cfg = config[m.tipo_movimiento] || { color:'#718096', bg:'#f7fafc', border:'#e2e8f0', icono:'❓', label: m.tipo_movimiento };
            const fecha = new Date(m.fecha_movimiento);
            const fechaFormato = fecha.toLocaleDateString('es-CL', { day:'2-digit', month:'long', year:'numeric' });
            const horaFormato = fecha.toLocaleTimeString('es-CL', { hour:'2-digit', minute:'2-digit' });
            const esUltimo = i === movimientos.length - 1;

            html += `
                <div style="
                    display:flex; align-items:flex-start; gap:20px;
                    margin-bottom: ${esUltimo ? '0' : '24px'};
                    position:relative;
                ">
                    <!-- Círculo indicador -->
                    <div style="
                        width:56px; height:56px; min-width:56px;
                        border-radius:50%;
                        background: ${cfg.bg};
                        border: 3px solid ${cfg.color};
                        display:flex; align-items:center; justify-content:center;
                        font-size:1.4rem;
                        position:relative; z-index:1;
                        box-shadow: 0 0 0 4px white;
                        ${esUltimo ? `box-shadow: 0 0 0 4px white, 0 0 0 7px ${cfg.color}33;` : ''}
                    ">${cfg.icono}</div>

                    <!-- Contenido de la tarjeta -->
                    <div style="
                        flex:1;
                        background: ${cfg.bg};
                        border: 1px solid ${cfg.border};
                        border-left: 4px solid ${cfg.color};
                        border-radius: 12px;
                        padding: 16px 20px;
                        ${esUltimo ? `box-shadow: 0 4px 12px ${cfg.color}22;` : ''}
                    ">
                        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:8px;">
                            <span style="
                                background:${cfg.color};
                                color:white;
                                padding:3px 12px;
                                border-radius:20px;
                                font-size:0.78rem;
                                font-weight:700;
                                letter-spacing:0.5px;
                                text-transform:uppercase;
                            ">${cfg.label}</span>
                            <span style="color:#718096; font-size:0.82rem;">
                                📅 ${fechaFormato} &nbsp;🕐 ${horaFormato}
                            </span>
                        </div>

                        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:8px; margin-top:8px;">
                            ${m.ubicacion ? `
                            <div style="display:flex; align-items:center; gap:6px;">
                                <span style="color:#718096; font-size:0.85rem;">📍</span>
                                <span style="color:#4a5568; font-size:0.9rem;"><strong>Ubicación:</strong> ${m.ubicacion}</span>
                            </div>` : ''}
                            ${m.nombre_colaborador ? `
                            <div style="display:flex; align-items:center; gap:6px;">
                                <span style="color:#718096; font-size:0.85rem;">👤</span>
                                <div>
                                    <span style="color:#4a5568; font-size:0.9rem;"><strong>${m.nombre_colaborador}</strong></span><br>
                                    <span style="color:#718096; font-size:0.78rem;">${m.rut_colaborador} · ${m.cargo || ''}</span>
                                </div>
                            </div>` : ''}
                            ${m.observacion ? `
                            <div style="display:flex; align-items:flex-start; gap:6px; grid-column: 1/-1;">
                                <span style="color:#718096; font-size:0.85rem;">💬</span>
                                <span style="color:#718096; font-size:0.85rem; font-style:italic;">${m.observacion}</span>
                            </div>` : ''}
                        </div>
                    </div>
                </div>
            `;
        });

        html += `</div></div>`;
        contenedor.innerHTML = html;

    } catch (error) {
        contenedor.innerHTML = `
            <div style="background:#fff5f5; border-left:5px solid #e53e3e; border-radius:12px; padding:24px;">
                <strong style="color:#c53030;">❌ Error al buscar</strong>
                <p style="color:#742a2a; margin:4px 0 0;">${error.message}</p>
            </div>`;
    }
}

// ==========================================
// 1. GUARDAR COLABORADOR  
// ==========================================

async function guardarColaborador() {
    const datos = {
        rut: document.getElementById('rut').value,
        nombre1: document.getElementById('nombre1').value,
        nombre2: document.getElementById('nombre2').value,
        apellido1: document.getElementById('apellido1').value,
        apellido2: document.getElementById('apellido2').value,
        cargo: document.getElementById('cargo').value,
        sector: document.getElementById('sector').value,
        telefono1: document.getElementById('telefono1').value,
        telefono2: document.getElementById('telefono2').value,
        mail: document.getElementById('mail').value
    };

    try {
        const respuesta = await fetch('/api/colaboradores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        const resultado = await respuesta.json();

        if (respuesta.ok) {
            alert("✅ Colaborador registrado correctamente");
            bootstrap.Modal.getInstance(document.getElementById('modalColaborador')).hide();
            document.getElementById('formColaborador').reset();
        } else {
            alert("❌ Error: " + resultado.error);
        }
    } catch (error) {
        console.error("Error al guardar:", error);
        alert("Error de conexión con el servidor");
    }
}


// =================================================================================================
// 2. BUSCADOR DE PRODUCTOS (MODAL INGRESO) id="modalIngreso ; id="modalEntrega"  id="modalProducto"
// =================================================================================================
const inputIngreso = document.getElementById('buscar-producto');
const listaIngreso = document.getElementById('sugerencias');

// CORRECCIÓN EN SECCIÓN 2: BUSCADOR DE PRODUCTOS (MODAL INGRESO)
if (inputIngreso && listaIngreso) {
    inputIngreso.addEventListener('input', async (e) => {
        const texto = e.target.value;
        if (texto.length < 2) { listaIngreso.style.display = 'none'; return; }
        try {
            const res = await fetch(`/api/productos/buscar?q=${texto}`);
            const productos = await res.json();
            listaIngreso.innerHTML = '';
            if (productos.length > 0) {
                listaIngreso.style.display = 'block';
                productos.forEach(p => {
                    const item = document.createElement('a');
                    item.className = 'list-group-item list-group-item-action';
                    item.innerHTML = `<strong>ID: ${p.id_articulo}</strong> - ${p.descripcion}`;
                    
                    // CAMBIO AQUÍ: Llamamos a seleccionarProducto en lugar de hacer la lógica aquí
                    item.onclick = () => seleccionarProducto(p); 
                    
                    listaIngreso.appendChild(item);
                });
            }
        } catch (f) { console.error("Error buscador ingreso:", f); }
    });
}



// ==========================================
// 3. BUSCADOR DE PRODUCTOS (MODAL ENTREGA)
// ==========================================
const inputEntregaProd = document.getElementById('buscar-producto-ent');
const listaEntregaProd = document.getElementById('sugerencias-ent');
/*
if (inputEntregaProd && listaEntregaProd) {
    inputEntregaProd.addEventListener('input', async (e) => {
        const texto = e.target.value;
        if (texto.length < 2) { listaEntregaProd.style.display = 'none'; return; }
        try {
            const res = await fetch(`/api/productos/buscar?q=${texto}`);
            const productos = await res.json();
            listaEntregaProd.innerHTML = '';
            if (productos.length > 0) {
                listaEntregaProd.style.display = 'block';
                productos.forEach(p => {
                    const item = document.createElement('a');
                    item.className = 'list-group-item list-group-item-action';
                    item.innerHTML = `<span>${p.descripcion}</span> <span class="badge bg-info">Stock: ${p.stock}</span>`;
                 item.onclick = () => {
    document.getElementById('id-articulo-ent').value = p.id_articulo;
    document.getElementById('display-id-ent').value = p.id_articulo;
    document.getElementById('cat-ent').value = p.categoria;
    inputEntregaProd.value = p.descripcion;
    document.getElementById('cant-ent').max = p.stock;
    listaEntregaProd.style.display = 'none';

    // Serie para Seguridad/Tablet
    const panelSerieEnt = document.getElementById('panel-serie-entrega');
    if (p.categoria === 'Seguridad' || p.categoria === 'Tablet') {
        fetch(`/api/productos/${p.id_articulo}/detalle`)
            .then(r => r.json())
            .then(detalle => {
                document.getElementById('serie-readonly-entrega').value = detalle.num_serie || 'Sin serie';
                panelSerieEnt.classList.remove('d-none');
                document.getElementById('cant-ent').value = 1;
                document.getElementById('cant-ent').readOnly = true;
            });
    } else {
        panelSerieEnt.classList.add('d-none');
        document.getElementById('cant-ent').readOnly = false;
    }
};
                    listaEntregaProd.appendChild(item);
                });
            }
        } catch (f) { console.error("Error buscador entrega prod:", f); }
    });
}*/
if (inputEntregaProd && listaEntregaProd) {
    inputEntregaProd.addEventListener('input', async (e) => {
        const texto = e.target.value;
        if (texto.length < 2) { listaEntregaProd.style.display = 'none'; return; }
        try {
            const res = await fetch(`/api/productos/buscar?q=${texto}`);
            const productos = await res.json();
            listaEntregaProd.innerHTML = '';
            if (productos.length > 0) {
                listaEntregaProd.style.display = 'block';
                productos.forEach(p => {
                    const item = document.createElement('a');
                    item.className = 'list-group-item list-group-item-action';
                    item.innerHTML = `<strong>${p.id_articulo}</strong> - ${p.descripcion} <span class="badge bg-info">Stock: ${p.stock}</span>`;
                    item.onclick = async () => {
                        document.getElementById('id-articulo-ent').value = p.id_articulo;
                        document.getElementById('display-id-ent').value = p.id_articulo;
                        document.getElementById('cat-ent').value = p.categoria;
                        inputEntregaProd.value = p.descripcion;
                        document.getElementById('cant-ent').max = p.stock;
                        listaEntregaProd.style.display = 'none';

                        // ── AUTO-DETECCIÓN DE BODEGA ORIGEN ──
                        const textoDisplay  = document.getElementById('bodega-origen-texto');
                        const displayDiv    = document.getElementById('bodega-origen-display');
                        const stockInfo     = document.getElementById('stock-bodega-info');
                        const stockValor    = document.getElementById('stock-bodega-valor');
                        const inputBodega   = document.getElementById('bodega-origen');

                        textoDisplay.textContent = 'Detectando bodega...';
                        displayDiv.style.borderColor = '#6c757d';

                        try {
                            const resUbic = await fetch(`/api/productos/${p.id_articulo}/ubicacion-actual`);
                            const ubicData = await resUbic.json();

                            if (ubicData.ubicacion) {
                                inputBodega.value = ubicData.ubicacion;
                                textoDisplay.textContent = ubicData.ubicacion;
                                textoDisplay.style.color = '#0d6efd';
                                textoDisplay.style.fontStyle = 'normal';
                                displayDiv.style.borderColor = '#0d6efd';
                                displayDiv.style.background = '#e8f4fd';
                                // Mostrar stock disponible en esa bodega
                                if (ubicData.stock_en_bodega !== undefined) {
                                    stockValor.textContent = ubicData.stock_en_bodega;
                                    stockValor.className = ubicData.stock_en_bodega > 0 ? 'text-success' : 'text-danger';
                                    stockInfo.classList.remove('d-none');
                                }
                            } else {
                                inputBodega.value = '';
                                textoDisplay.textContent = '⚠️ Sin movimientos previos';
                                textoDisplay.style.color = '#dc3545';
                                textoDisplay.style.fontStyle = 'italic';
                                displayDiv.style.borderColor = '#dc3545';
                                displayDiv.style.background = '#fff5f5';
                                stockInfo.classList.add('d-none');
                            }
                        } catch (e) {
                            textoDisplay.textContent = 'Error al detectar bodega';
                            textoDisplay.style.color = '#dc3545';
                        }

                        // Mostrar panel serie si aplica
                        const panelSerie = document.getElementById('panel-serie-entrega');
                        const resultadoSerie = document.getElementById('resultado-serie');
                        const btnConfirmar = document.getElementById('btn-confirmar-entrega');

                        if (p.categoria === 'Seguridad' || p.categoria === 'Tablet') {
                            panelSerie.classList.remove('d-none');
                            document.getElementById('serie-verificar').value = '';
                            resultadoSerie.classList.add('d-none');
                            resultadoSerie.innerHTML = '';
                            // Bloquear confirmar hasta verificar serie
                            btnConfirmar.disabled = true;
                            document.getElementById('cant-ent').value = 1;
                            document.getElementById('cant-ent').readOnly = true;
                        } else {
                            panelSerie.classList.add('d-none');
                            btnConfirmar.disabled = false;
                            document.getElementById('cant-ent').readOnly = false;
                        }
                    };
                    listaEntregaProd.appendChild(item);
                });
            }
        } catch (f) { console.error("Error buscador entrega prod:", f); }
    });
}


// ==========================================
// 4. BUSCADOR DE COLABORADORES (MODAL ENTREGA) ONCLICK
// ==========================================
const inputColab = document.getElementById('rut-colaborador');
const listaColab = document.getElementById('sugerencias-colab');

if (inputColab && listaColab) {
    inputColab.addEventListener('input', async (e) => {
        const filtro = e.target.value;
        // Ocultar nombre confirmado al escribir de nuevo
        document.getElementById('nombre-colaborador-confirmado').classList.add('d-none');
        if (filtro.length < 2) { listaColab.style.display = 'none'; return; }
        try {
            const res = await fetch(`/api/colaboradores/buscar?q=${filtro}`);
            const datos = await res.json();
            listaColab.innerHTML = '';
            if (datos.length > 0) {
                listaColab.style.display = 'block';
                datos.forEach(c => {
                    const item = document.createElement('a');
                    item.className = 'list-group-item list-group-item-action';
                    item.innerHTML = `<strong>${c.rut}</strong> — ${c.nombre1} ${c.apellido1} <small class="text-muted">${c.cargo || ''}</small>`;
                    item.onclick = () => {
                        inputColab.value = c.rut;
                        listaColab.style.display = 'none';
                        // Mostrar nombre confirmado
                        document.getElementById('texto-nombre-colab').textContent = 
                            `${c.nombre1} ${c.nombre2 || ''} ${c.apellido1} ${c.apellido2 || ''}`.trim();
                        document.getElementById('nombre-colaborador-confirmado').classList.remove('d-none');
                        // Mostrar sector si existe
                        const badgeSector = document.getElementById('badge-sector-colab');
                        if (c.sector) {
                            document.getElementById('texto-sector-colab').textContent = c.sector;
                            badgeSector.style.display = 'inline-flex';
                        } else {
                            badgeSector.style.display = 'none';
                        }
                    };
                    listaColab.appendChild(item);
                });
            }
        } catch (f) { console.error("Error buscador colab:", f); }
    });
}



// ==========================================
// 5. REGISTRO FINAL DE ENTREGA
// ==========================================
async function confirmarEntrega() {
    const categoria = document.getElementById('cat-ent').value;
    const idArticulo = document.getElementById('id-articulo-ent').value;
    const bodegaOrigen = document.getElementById('bodega-origen').value;

    if (!bodegaOrigen) {
        alert("⚠️ No se pudo detectar la bodega de origen. Asegúrese de haber ingresado previamente el producto.");
        return;
    }

    const datos = {
        id_articulo: idArticulo,
        rut_colaborador: document.getElementById('rut-colaborador').value,
        cantidad: document.getElementById('cant-ent').value,
        ubicacion: bodegaOrigen,
        id_usuario: 1,
        serie: null,
        modelo: null
    };

    if (!datos.id_articulo || !datos.rut_colaborador || !datos.cantidad) {
        alert("⚠️ Faltan datos obligatorios"); return;
    }

    // Si es Seguridad/Tablet → traer serie y modelo desde detalle
    if (categoria === 'Seguridad' || categoria === 'Tablet') {
        const serieVerificada = document.getElementById('serie-verificar')?.value.trim();
        if (!serieVerificada) {
            alert("⚠️ Debe verificar el N° de Serie antes de confirmar."); return;
        }
        try {
            const resDetalle = await fetch(`/api/productos/${idArticulo}/detalle`);
            const detalle = await resDetalle.json();
            datos.serie = detalle.num_serie || null;
            datos.modelo = detalle.modelo || null;
        } catch (e) {
            alert("❌ Error al obtener detalle del producto."); return;
        }
    }

    try {
        const res = await fetch('/api/movimientos/entrega', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        if (res.ok) {
            alert("✅ Entrega registrada exitosamente");
            location.reload();
        } else {
            const err = await res.json();
            alert("❌ Error: " + err.error);
        }
    } catch (e) { console.error("Error confirmando entrega:", e); }
}

// Cerrar listas al hacer clic fuera
// Reemplaza el bloque de "Cerrar listas al hacer clic fuera" por este:
document.addEventListener('click', (e) => {
    // Si el clic NO es en el buscador de ingreso ni en su lista, ocultarla
    if (!document.getElementById('buscar-producto').contains(e.target)) {
        document.getElementById('sugerencias').style.display = 'none';
    }
    
    // Si el clic NO es en el buscador de entrega ni en su lista, ocultarla
    const inputEnt = document.getElementById('buscar-producto-ent');
    const listaEnt = document.getElementById('sugerencias-ent');
    if (inputEnt && !inputEnt.contains(e.target)) {
        listaEnt.style.display = 'none';
    }

    // Si el clic NO es en el buscador de colaborador ni en su lista, ocultarla
    const inputCol = document.getElementById('rut-colaborador');
    const listaCol = document.getElementById('sugerencias-colab');
    if (inputCol && !inputCol.contains(e.target)) {
        listaCol.style.display = 'none';
    }

const inputColDev = document.getElementById('rut-colab-dev');
const listaColDev = document.getElementById('sugerencias-colab-dev');
if (inputColDev && !inputColDev.contains(e.target)) listaColDev.style.display = 'none';

const inputPDev = document.getElementById('buscar-prod-dev');
const listaPDev = document.getElementById('sugerencias-prod-dev');
if (inputPDev && !inputPDev.contains(e.target)) listaPDev.style.display = 'none';

}, true);

// =================================================================================================
// 6. REGISTRO DE NUEVO INGRESO (PRODUCTOS) NO TOCAR AL MOMENTO FUNCIONANDO, TOCAR SOLO PARA MEJORAS
// =================================================================================================
async function confirmarIngreso() {
    const categoria = document.getElementById('categoria-detectada').value;
    const idArticulo = document.getElementById('id_articulo').value;

    const datos = {
        id_articulo: idArticulo,
        cantidad: document.getElementById('cantidad').value,
        ubicacion: document.getElementById('ubicacion').value,
        id_usuario: 1,
        modelo: null,
        serie: null,
        aerolinea: null,
        tipo_documento: null
    };

    if (categoria === 'Tablet') {
        datos.modelo = document.getElementById('modelo-tablet')?.value || null;
        datos.serie = document.getElementById('serie-tablet')?.value || null;
    } else if (categoria === 'Seguridad') {
        datos.modelo = document.getElementById('modelo-seguridad')?.value || null;
        datos.serie = document.getElementById('serie-seguridad')?.value || null;
    } else if (categoria === 'Formulario') {
        datos.aerolinea = document.getElementById('aerolinea')?.value || null;
    }

    if (!datos.id_articulo || !datos.cantidad || !datos.ubicacion) {
        alert("⚠️ Por favor, complete todos los campos del ingreso.");
        return;
    }

    // VALIDACIÓN DE SERIE para Seguridad/Tablet
    if (categoria === 'Seguridad' || categoria === 'Tablet') {
        if (!datos.serie) {
            alert("⚠️ Debe ingresar el N° de Serie.");
            return;
        }
        try {
            const resDetalle = await fetch(`/api/productos/${idArticulo}/detalle`);
            const detalle = await resDetalle.json();

            if (!detalle.num_serie || 
                detalle.num_serie.trim().toLowerCase() !== datos.serie.trim().toLowerCase()) {
                alert(`❌ Serie incorrecta.\nLa serie "${datos.serie}" no corresponde a este producto en bodega.\nVerifique el número de serie del ítem físico.`);
                return; // ← NO guarda si la serie no coincide
            }
        } catch (e) {
            alert("❌ Error al verificar la serie. Intente nuevamente.");
            return;
        }
    }

    try {
        const res = await fetch('/api/movimientos/ingreso', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        if (res.ok) {
            alert("✅ Ingreso registrado correctamente.");
            location.reload();
        } else {
            const errorData = await res.json();
            alert("❌ Error al registrar: " + (errorData.error || "Error desconocido"));
        }
    } catch (error) {
        console.error("Error en la petición de ingreso:", error);
        alert("Hubo un problema de conexión con el servidor.");
    }
}


function seleccionarProducto(producto) {
    document.getElementById('buscar-producto').value = producto.descripcion;
    document.getElementById('id_articulo').value = producto.id_articulo;
    document.getElementById('display-id').value = producto.id_articulo;
    document.getElementById('categoria-detectada').value = producto.categoria;
    actualizarPanelDinamico(producto.categoria);
    //mostrarCamposPorCategoria(producto.categoria);
    document.getElementById('sugerencias').style.display = 'none';

    const campoCantidad = document.getElementById('cantidad');

    if (producto.categoria === 'Seguridad' || producto.categoria === 'Tablet') {
        fetch(`/api/productos/${producto.id_articulo}/detalle`)
            .then(r => r.json())
            .then(detalle => {
                // Auto-llenar modelo (readonly) según categoría
                const campoModelo = producto.categoria === 'Tablet'
                    ? document.getElementById('modelo-tablet')
                    : document.getElementById('modelo-seguridad');
                if (campoModelo && detalle.modelo) {
                    campoModelo.value = detalle.modelo;
                }
                // Bloquear cantidad en 1
                campoCantidad.value = 1;
                campoCantidad.readOnly = true;
                campoCantidad.classList.add('bg-light');
            });
    } else {
        campoCantidad.readOnly = false;
        campoCantidad.classList.remove('bg-light');
    }
}


function mostrarCamposPorCategoria(categoria) {
    const panel = document.getElementById('panel-dinamico');
    panel.innerHTML = ''; // Limpiar previo
    panel.classList.remove('d-none');

    if (categoria === 'Formulario') {
        panel.innerHTML = `
            <label class="form-label fw-bold">Aerolínea</label>
            <select id="aerolinea" class="form-select">
                <option value="LATAM">LATAM</option>
                <option value="SKY">SKY</option>
                <option value="Otro">Otro</option>
            </select>`;
    } else if (categoria === 'Tablet') {
        panel.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <label class="form-label fw-bold">Modelo</label>
                    <input type="text" id="modelo-tablet" class="form-control" placeholder="Ej: Active 3">
                </div>
                <div class="col-md-6">
                    <label class="form-label fw-bold">N° Serie</label>
                    <input type="text" id="serie-tablet" class="form-control" placeholder="Ingrese S/N">
                </div>
            </div>`;
    } else if (categoria === 'Seguridad') {
        panel.innerHTML = `
            <label class="form-label fw-bold">N° Serie / Identificador</label>
            <input type="text" id="serie-seguridad" class="form-control" placeholder="Tipee el número de serie...">`;
    } else {
        panel.classList.add('d-none'); // Ocultar si no aplica
    }
}


function actualizarPanelDinamico(categoria) {
    const panel = document.getElementById('panel-dinamico');
    if (!panel) return; // Seguridad por si no existe el ID

    panel.innerHTML = ''; // Limpiamos previo
    panel.classList.add('d-none'); // Ocultamos por defecto

    if (!categoria) return;

    let contenido = '';

    if (categoria === 'Formulario') {
        contenido = `
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
            </div>`;
    } 
else if (categoria === 'Seguridad') {
    contenido = `
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
        </div>`;
} 
else if (categoria === 'Tablet') {
    contenido = `
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
        </div>`;
}

    if (contenido !== '') {
        panel.innerHTML = contenido;
        panel.classList.remove('d-none'); // Hacemos visible el panel
    }
}

// ==========================================
// VERIFICACIÓN DE SERIE (SEGURIDAD/TABLET)
// ==========================================
async function verificarSerie() {
    const idArticulo = document.getElementById('id-articulo-ent').value;
    const serieIngresada = document.getElementById('serie-verificar').value.trim();
    const resultado = document.getElementById('resultado-serie');
    const btnConfirmar = document.getElementById('btn-confirmar-entrega');

    if (!serieIngresada) {
        resultado.innerHTML = `<div class="alert alert-warning">⚠️ Ingrese un número de serie.</div>`;
        resultado.classList.remove('d-none');
        return;
    }

    try {
        const res = await fetch(`/api/productos/${idArticulo}/detalle`);
        const detalle = await res.json();

        if (detalle.num_serie && detalle.num_serie.trim().toLowerCase() === serieIngresada.toLowerCase()) {
            resultado.innerHTML = `
                <div class="alert alert-success">
                    ✅ <strong>Serie verificada correctamente</strong><br>
                    Producto: ${detalle.descripcion}<br>
                    Modelo: ${detalle.modelo || 'N/A'} — Serie: <strong>${detalle.num_serie}</strong>
                </div>`;
            btnConfirmar.disabled = false; // Habilitar botón
        } else {
            resultado.innerHTML = `
                <div class="alert alert-danger">
                    ❌ <strong>Serie no coincide</strong><br>
                    El número <strong>${serieIngresada}</strong> no corresponde a este producto en bodega.
                </div>`;
            btnConfirmar.disabled = true;
        }
        resultado.classList.remove('d-none');
    } catch (error) {
        resultado.innerHTML = `<div class="alert alert-danger">❌ Error al verificar: ${error.message}</div>`;
        resultado.classList.remove('d-none');
    }
}

// ==========================================
// DEVOLUCIÓN - BUSCADOR COLABORADOR
// ==========================================
const inputColabDev = document.getElementById('rut-colab-dev');
const listaColabDev = document.getElementById('sugerencias-colab-dev');

if (inputColabDev && listaColabDev) {
    inputColabDev.addEventListener('input', async (e) => {
        const filtro = e.target.value;
        document.getElementById('nombre-colab-dev-confirmado').classList.add('d-none');
        if (filtro.length < 2) { listaColabDev.style.display = 'none'; return; }
        try {
            const res = await fetch(`/api/colaboradores/buscar?q=${filtro}`);
            const datos = await res.json();
            listaColabDev.innerHTML = '';
            if (datos.length > 0) {
                listaColabDev.style.display = 'block';
                datos.forEach(c => {
                    const item = document.createElement('a');
                    item.className = 'list-group-item list-group-item-action';
                    item.innerHTML = `<strong>${c.rut}</strong> — ${c.nombre1} ${c.apellido1} <small class="text-muted">${c.cargo || ''}</small>`;
                    item.onclick = () => {
                        inputColabDev.value = c.rut;
                        listaColabDev.style.display = 'none';
                        document.getElementById('texto-nombre-colab-dev').textContent =
                            `${c.nombre1} ${c.nombre2 || ''} ${c.apellido1} ${c.apellido2 || ''}`.trim();
                        document.getElementById('nombre-colab-dev-confirmado').classList.remove('d-none');
                    };
                    listaColabDev.appendChild(item);
                });
            }
        } catch (f) { console.error("Error buscador colab dev:", f); }
    });
}

// ==========================================
// DEVOLUCIÓN - BUSCADOR PRODUCTO
// ==========================================
const inputProdDev = document.getElementById('buscar-prod-dev');
const listaProdDev = document.getElementById('sugerencias-prod-dev');

if (inputProdDev && listaProdDev) {
    inputProdDev.addEventListener('input', async (e) => {
        const texto = e.target.value;
        if (texto.length < 2) { listaProdDev.style.display = 'none'; return; }
        try {
            const res = await fetch(`/api/productos/buscar?q=${texto}`);
            const productos = await res.json();
            listaProdDev.innerHTML = '';
            if (productos.length > 0) {
                listaProdDev.style.display = 'block';
                productos.forEach(p => {
                    const item = document.createElement('a');
                    item.className = 'list-group-item list-group-item-action';
                    item.innerHTML = `<strong>${p.id_articulo}</strong> - ${p.descripcion} <span class="badge bg-secondary">${p.categoria}</span>`;
                    item.onclick = () => {
                        document.getElementById('id-articulo-dev').value = p.id_articulo;
                        document.getElementById('display-id-dev').value = p.id_articulo;
                        document.getElementById('cat-dev').value = p.categoria;
                        inputProdDev.value = p.descripcion;
                        listaProdDev.style.display = 'none';

                        const panelSerie = document.getElementById('panel-serie-dev');
                        const btnConfirmar = document.getElementById('btn-confirmar-dev');
                        const resultadoSerie = document.getElementById('resultado-serie-dev');

                        if (p.categoria === 'Seguridad' || p.categoria === 'Tablet') {
                            panelSerie.classList.remove('d-none');
                            document.getElementById('serie-dev').value = '';
                            resultadoSerie.classList.add('d-none');
                            btnConfirmar.disabled = true;
                        } else {
                            panelSerie.classList.add('d-none');
                            btnConfirmar.disabled = false;
                        }
                    };
                    listaProdDev.appendChild(item);
                });
            }
        } catch (f) { console.error("Error buscador prod dev:", f); }
    });
}

// ==========================================
// DEVOLUCIÓN - VERIFICAR SERIE
// ==========================================
async function verificarSerieDevolucion() {
    const idArticulo = document.getElementById('id-articulo-dev').value;
    const serieIngresada = document.getElementById('serie-dev').value.trim();
    const resultado = document.getElementById('resultado-serie-dev');
    const btnConfirmar = document.getElementById('btn-confirmar-dev');

    if (!serieIngresada) {
        resultado.innerHTML = `<div class="alert alert-warning">⚠️ Ingrese un número de serie.</div>`;
        resultado.classList.remove('d-none');
        return;
    }

    try {
        const res = await fetch(`/api/productos/${idArticulo}/detalle`);
        const detalle = await res.json();

        if (detalle.num_serie && detalle.num_serie.trim().toLowerCase() === serieIngresada.toLowerCase()) {
            resultado.innerHTML = `
                <div class="alert alert-success">
                    ✅ <strong>Serie verificada</strong><br>
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
    } catch (error) {
        resultado.innerHTML = `<div class="alert alert-danger">❌ Error al verificar: ${error.message}</div>`;
        resultado.classList.remove('d-none');
    }
}

// ==========================================
// DEVOLUCIÓN - CONFIRMAR
// ==========================================
async function confirmarDevolucion() {
    const categoria = document.getElementById('cat-dev').value;
    const datos = {
        id_articulo: document.getElementById('id-articulo-dev').value,
        rut_colaborador: document.getElementById('rut-colab-dev').value,
        ubicacion: document.getElementById('bodega-dev').value,
        observacion: document.getElementById('observacion-dev').value,
        serie: (categoria === 'Seguridad' || categoria === 'Tablet')
            ? document.getElementById('serie-dev').value.trim()
            : null
    };

    if (!datos.id_articulo || !datos.rut_colaborador) {
        alert("⚠️ Complete colaborador y producto."); return;
    }

    try {
        const res = await fetch('/api/movimientos/devolucion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        if (res.ok) {
            alert("✅ Devolución registrada exitosamente");
            location.reload();
        } else {
            const err = await res.json();
            alert("❌ Error: " + err.error);
        }
    } catch (e) { console.error("Error confirmando devolución:", e); }
}


// ==========================================
// RESET MODAL ENTREGA AL CERRAR
// ==========================================
document.getElementById('modalEntrega')?.addEventListener('hidden.bs.modal', () => {
    // Reset bodega display
    const textoDisplay = document.getElementById('bodega-origen-texto');
    const displayDiv   = document.getElementById('bodega-origen-display');
    const stockInfo    = document.getElementById('stock-bodega-info');
    if (textoDisplay) {
        textoDisplay.textContent  = 'Seleccione un producto...';
        textoDisplay.style.color  = '#6c757d';
        textoDisplay.style.fontStyle = 'italic';
    }
    if (displayDiv) {
        displayDiv.style.borderColor = '#6c757d';
        displayDiv.style.background  = '#f8f9fa';
    }
    if (stockInfo) stockInfo.classList.add('d-none');
    document.getElementById('bodega-origen').value = '';
    // Reset sector badge
    const badgeSector = document.getElementById('badge-sector-colab');
    if (badgeSector) badgeSector.style.display = 'none';
    document.getElementById('nombre-colaborador-confirmado')?.classList.add('d-none');
    document.getElementById('panel-serie-entrega')?.classList.add('d-none');
    document.getElementById('btn-confirmar-entrega').disabled = false;
});

// ==========================================
// CUSTODIO POR RUT
let rutCustodioSeleccionado = null;

document.getElementById('rut-custodia')?.addEventListener('input', async function () {
    const q = this.value.trim();
    const lista = document.getElementById('sugerencias-colab-custodia');
    if (q.length < 2) { lista.style.display = 'none'; return; }

    const res = await fetch(`/api/colaboradores/buscar?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    lista.innerHTML = '';
    if (!data.length) { lista.style.display = 'none'; return; }

    data.forEach(c => {
        const li = document.createElement('li');
        li.className = 'list-group-item list-group-item-action';
        li.textContent = `${c.rut} — ${c.nombre1} ${c.apellido1}`;
        li.onclick = () => seleccionarCustodio(c);
        lista.appendChild(li);
    });
    lista.style.display = 'block';
});

function seleccionarCustodio(c) {
    rutCustodioSeleccionado = c.rut;
    document.getElementById('rut-custodia').value = `${c.rut} — ${c.nombre1} ${c.apellido1}`;
    document.getElementById('sugerencias-colab-custodia').style.display = 'none';
    document.getElementById('custodio-nombre').textContent = `${c.nombre1} ${c.apellido1} · ${c.cargo}`;
    document.getElementById('custodio-rut-badge').textContent = c.rut;
    document.getElementById('custodio-confirmado').classList.remove('d-none');
    cargarCustodia(c.rut);
}

async function cargarCustodia(rut) {
    const container = document.getElementById('tabla-custodia-container');
    const sinRes = document.getElementById('custodia-sin-resultados');
    const tbody = document.getElementById('tbody-custodia');

    container.classList.add('d-none');
    sinRes.classList.add('d-none');
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Cargando...</td></tr>';
    container.classList.remove('d-none');

    const res = await fetch(`/api/movimientos/custodia/${encodeURIComponent(rut)}`);
    const data = await res.json();

    if (!data.length) {
        container.classList.add('d-none');
        sinRes.classList.remove('d-none');
        return;
    }

    document.getElementById('badge-total-custodia').textContent = `${data.length} activo(s)`;
    tbody.innerHTML = data.map(item => {
        const diasClass = item.dias_en_custodia > 30 ? 'text-danger fw-bold' : item.dias_en_custodia > 7 ? 'text-warning' : '';
        return `<tr>
            <td>${item.descripcion}</td>
            <td><span class="badge bg-secondary">${item.categoria}</span></td>
            <td>${item.serie ? `<code>${item.serie}</code>` : '—'}${item.modelo ? ` <small class="text-muted">${item.modelo}</small>` : ''}</td>
            <td>${new Date(item.fecha_movimiento).toLocaleDateString('es-CL')}</td>
            <td class="${diasClass}">${item.dias_en_custodia} días</td>
        </tr>`;
    }).join('');
}

// Limpiar modal al cerrar
document.getElementById('modalCustodia')?.addEventListener('hidden.bs.modal', () => {
    document.getElementById('rut-custodia').value = '';
    document.getElementById('sugerencias-colab-custodia').style.display = 'none';
    document.getElementById('custodio-confirmado').classList.add('d-none');
    document.getElementById('tabla-custodia-container').classList.add('d-none');
    document.getElementById('custodia-sin-resultados').classList.add('d-none');
    rutCustodioSeleccionado = null;
});

// ==========================================
// TRAZABILIDAD DE ACTIVO
// ==========================================
async function buscarTrazabilidad() {
    const serie = document.getElementById('serie-trazabilidad').value.trim();
    const resultado = document.getElementById('resultado-trazabilidad');

    if (!serie) {
        resultado.innerHTML = `<div class="alert alert-warning">⚠️ Ingrese un número de serie.</div>`;
        return;
    }

    resultado.innerHTML = `<div class="text-center text-muted">Buscando historial...</div>`;

    try {
        const res = await fetch(`/api/movimientos/trazabilidad/${encodeURIComponent(serie)}`);
        const movimientos = await res.json();

        if (movimientos.length === 0) {
            resultado.innerHTML = `<div class="alert alert-warning">No se encontraron movimientos para la serie <strong>${serie}</strong>.</div>`;
            return;
        }

        const iconos = {
            'Ingreso':    { icon: '📥', color: 'success' },
            'Entrega':    { icon: '📤', color: 'primary' },
            'Devolución': { icon: '↩️', color: 'danger'  },
            'Traslado':   { icon: '🔄', color: 'warning' }
        };

        const ultimo = movimientos[movimientos.length - 1];
        const estadoActual = iconos[ultimo.tipo_movimiento] || { icon: '❓', color: 'secondary' };

        let html = `
            <div class="card mb-3">
                <div class="card-header bg-dark text-white">
                    <strong>${movimientos[0].descripcion}</strong> — Serie: <code>${serie}</code>
                    <span class="badge bg-${estadoActual.color} float-end fs-6">
                        ${estadoActual.icon} Estado actual: ${ultimo.tipo_movimiento}
                    </span>
                </div>
                <div class="card-body p-2">
                    <div class="timeline">`;

        movimientos.forEach((m, i) => {
            const cfg = iconos[m.tipo_movimiento] || { icon: '❓', color: 'secondary' };
            const fecha = new Date(m.fecha_movimiento).toLocaleString('es-CL');
            const colaborador = m.nombre_colaborador
                ? `<br><small class="text-muted">👤 ${m.nombre_colaborador} (${m.rut_colaborador}) — ${m.cargo || ''}</small>`
                : '';
            const observacion = m.observacion
                ? `<br><small class="text-muted fst-italic">💬 ${m.observacion}</small>`
                : '';

            html += `
                <div class="d-flex align-items-start mb-3">
                    <div class="me-3 text-center" style="min-width:40px">
                        <span class="badge bg-${cfg.color} rounded-circle p-2">${cfg.icon}</span>
                        ${i < movimientos.length - 1 ? '<div style="width:2px;height:30px;background:#dee2e6;margin:4px auto"></div>' : ''}
                    </div>
                    <div class="flex-grow-1 border rounded p-2 bg-light">
                        <span class="badge bg-${cfg.color}">${m.tipo_movimiento}</span>
                        <span class="ms-2 text-muted small">📅 ${fecha}</span>
                        <br><small>📍 ${m.ubicacion || 'Sin ubicación'}</small>
                        ${colaborador}
                        ${observacion}
                    </div>
                </div>`;
        });

        html += `</div></div></div>`;
        resultado.innerHTML = html;

    } catch (error) {
        resultado.innerHTML = `<div class="alert alert-danger">❌ Error al buscar: ${error.message}</div>`;
    }
}