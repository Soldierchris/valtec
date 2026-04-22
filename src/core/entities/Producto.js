// src/core/entities/Producto.js
class Producto {
    constructor({ 
        descripcion, 
        categoria, 
        modelo, 
        num_serie, 
        aerolinea, 
        tipo_documento, 
        marca, 
        medida 
    }) {
        this.descripcion = descripcion;
        this.categoria = categoria;
        
        // Campos adicionales (Tabltes)
        this.modelo = modelo || null;
        this.num_serie = num_serie || null;
        
        // Campos adicionales (Formularios)
        this.aerolinea = aerolinea || null;
        this.tipo_documento = tipo_documento || null;
        
        // Campos adicionales (Suministros)
        this.marca = marca || null;
        this.medida = medida || null;
    }
}

module.exports = Producto;