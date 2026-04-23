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
            <th>Estado</th>
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
                    <td><strong>${tablet.modelo}</strong><br><small class="text-muted">${tablet.num_serie}</small></td>
                    <td>${tablet.descripcion}</td>
                    <td>
                        <span class="badge ${tablet.estado === 'Disponible' ? 'bg-success' : 'bg-primary'}">
                            ${tablet.estado}
                        </span>
                    </td>
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


// ==========================================
// 2. BUSCADOR DE PRODUCTOS (MODAL INGRESO)
// ==========================================
const inputIngreso = document.getElementById('buscar-producto');
const listaIngreso = document.getElementById('sugerencias');

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
                    item.onclick = () => {
                        document.getElementById('id_articulo').value = p.id_articulo;
                        document.getElementById('display-id').value = p.id_articulo;
                        document.getElementById('categoria-detectada').value = p.categoria;
                        inputIngreso.value = p.descripcion;
                        listaIngreso.style.display = 'none';
                    };
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
                    };
                    listaEntregaProd.appendChild(item);
                });
            }
        } catch (f) { console.error("Error buscador entrega prod:", f); }
    });
}

// ==========================================
// 4. BUSCADOR DE COLABORADORES (MODAL ENTREGA)
// ==========================================
const inputColab = document.getElementById('rut-colaborador');
const listaColab = document.getElementById('sugerencias-colab');

if (inputColab && listaColab) {
    inputColab.addEventListener('input', async (e) => {
        const filtro = e.target.value;
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
                    item.innerHTML = `<strong>${c.rut}</strong> - ${c.nombre1} ${c.apellido1}`;
                    item.onclick = () => {
                        inputColab.value = c.rut;
                        listaColab.style.display = 'none';
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
    const datos = {
        id_articulo: document.getElementById('id-articulo-ent').value,
        rut_colaborador: document.getElementById('rut-colaborador').value,
        cantidad: document.getElementById('cant-ent').value,
        ubicacion: document.getElementById('bodega-origen').value,
        id_usuario: 1
    };

    if (!datos.id_articulo || !datos.rut_colaborador || !datos.cantidad) {
        alert("Faltan datos obligatorios"); return;
    }

    try {
        const res = await fetch('/api/movimientos/entrega', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        if (res.ok) {
            alert("✅ Entrega registrada");
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
}, true);

// =================================================================================================
// 6. REGISTRO DE NUEVO INGRESO (PRODUCTOS) NO TOCAR AL MOMENTO FUNCIONANDO, TOCAR SOLO PARA MEJORAS
// =================================================================================================
async function confirmarIngreso() {
    // Recolectamos los datos usando los IDs que tienes en el modal de ingreso
    const datos = {
        id_articulo: document.getElementById('id_articulo').value,
        cantidad: document.getElementById('cantidad').value,
        ubicacion: document.getElementById('ubicacion').value,
        id_usuario: 1 // Usuario por defecto
    };

    // Validación básica
    if (!datos.id_articulo || !datos.cantidad || !datos.ubicacion) {
        alert("⚠️ Por favor, complete todos los campos del ingreso.");
        return;
    }

    try {
        const res = await fetch('/api/movimientos/ingreso', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        if (res.ok) {
            alert("✅ Ingreso registrado correctamente.");
            location.reload(); // Recarga para actualizar las tablas de stock
        } else {
            const errorData = await res.json();
            alert("❌ Error al registrar: " + (errorData.error || "Error desconocido"));
        }
    } catch (error) {
        console.error("Error en la petición de ingreso:", error);
        alert("Hubo un problema de conexión con el servidor.");
    }
}