const ColaboradorRepository = require('../database/ColaboradorRepository');
const RegistrarColaborador = require('../../core/use-cases/RegistrarColaborador');

class ColaboradorController {
    constructor() {
        this.repository = new ColaboradorRepository();
        this.useCase = new RegistrarColaborador(this.repository);
    }

    async crear(req, res) {
        try {
            const resultado = await this.useCase.ejecutar(req.body);
            res.status(201).json(resultado);
        } catch (error) {
            // Manejo de errores profesionales (ej: RUT duplicado)
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = new ColaboradorController();