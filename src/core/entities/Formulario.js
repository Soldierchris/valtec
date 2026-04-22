class Formulario {
    constructor({ id_articulo, descripcion, aerolinea, tipo_documento, stock_disponible = 0 }) {
        this.id_articulo = id_articulo;
        this.descripcion = descripcion;
        this.aerolinea = aerolinea; // LATAM o SKY
        this.tipo_documento = tipo_documento;
        this.stock_disponible = stock_disponible; // Calculado por los movimientos
    }

    // Lógica: ¿Es un documento crítico de vuelo?
    esManifiesto() {
        return this.tipo_documento === 'Manifiesto de Carga';
    }
}

module.exports = Formulario;