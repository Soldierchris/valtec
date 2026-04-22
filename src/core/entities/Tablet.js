// src/core/entities/Tablet.js

class Tablet {
    constructor({ 
        id_articulo, 
        num_serie, 
        modelo, 
        descripcion, 
        estado = 'Disponible',
        ubicacion_actual = 'Bodega Seguridad', // Esto vendrá del JOIN en el Repo
        poseedor_actual = null 
    }) {
        this.id_articulo = id_articulo; // PK de tabla producto
        this.num_serie = num_serie;     // De tabla detalle_serializado
        this.modelo = modelo;           // De tabla detalle_serializado
        this.descripcion = descripcion; // De tabla producto
        this.estado = estado;           // De la tabla movimiento
        this.ubicacion_actual = ubicacion_actual;
        this.poseedor_actual = poseedor_actual;
    }

    // Lógica de negocio pura
    esUrgenteRevision() {
        return this.estado === 'En Reparación';
    }
}

module.exports = Tablet;