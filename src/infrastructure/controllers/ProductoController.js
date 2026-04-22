const ProductoRepository = require('../database/ProductoRepository');
const RegistrarProducto = require('../../core/use-cases/RegistrarProducto');

class ProductoController {
    constructor() {
        this.repository = new ProductoRepository();
        this.useCase = new RegistrarProducto(this.repository);
    }

    // AÑADE ESTO:
    async buscar(req, res) {
        try {
            const { q } = req.query;
            const productos = await this.repository.buscarPorNombre(q);
            res.json(productos);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async crear(req, res) {
        try {
            const resultado = await this.useCase.ejecutar(req.body);
            res.status(201).json(resultado);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
module.exports = new ProductoController();