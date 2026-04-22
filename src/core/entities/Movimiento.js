class Movimiento {
    constructor({ id_movimiento, id_articulo, tipo_movimiento, estado, fecha_movimiento, nombre_ubicacion }) {
        this.id_movimiento = id_movimiento;
        this.id_articulo = id_articulo;
        this.tipo = tipo_movimiento; // Ingreso, Entrega, etc.
        this.estado = estado; // Disponible, En Uso, etc.
        this.fecha = fecha_movimiento;
        this.ubicacion = nombre_ubicacion;
    }
}

module.exports = Movimiento;