const MovimientoRepository = require('../database/MovimientoRepository');

class MovimientoController {
    constructor() {
        this.repository = new MovimientoRepository();
    }

    async crear(req, res) {
        try {
            const datos = req.body;
            const resultado = await this.repository.registrar(datos);
            res.status(201).json({ message: "Movimiento registrado", id: resultado.insertId });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new MovimientoController();