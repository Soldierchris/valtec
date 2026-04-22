const Producto = require('../entities/Producto');

class RegistrarProducto {
    constructor(productoRepository) {
        this.productoRepository = productoRepository;
    }

    async ejecutar(datos) {
        const nuevoProducto = new Producto(datos);
        console.log("PRODUCTO MAPEADO EN ENTIDAD:", nuevoProducto); // <-- Mira  en la terminal
        return await this.productoRepository.guardar(nuevoProducto);
    }
}

module.exports = RegistrarProducto;