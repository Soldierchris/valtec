const FormularioRepository = require('../database/FormularioRepository');
const ObtenerInventarioFormularios = require('../../core/use-cases/ObtenerInventarioFormularios');

class FormularioController {
    constructor() {
        this.repository = new FormularioRepository();
        this.useCase = new ObtenerInventarioFormularios(this.repository);
    }

    async listarPorAerolinea(req, res) {
        try {
            const { aerolinea } = req.params; // Ejemplo: 'LATAM' o 'SKY'
            const formularios = await this.useCase.ejecutar(aerolinea.toUpperCase());
            res.json(formularios);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = new FormularioController();