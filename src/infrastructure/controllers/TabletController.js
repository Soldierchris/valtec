const TabletRepository = require('../database/TabletRepository');
const ListarTablets = require('../../core/use-cases/ListarTablets');

class TabletController {
    constructor() {
        this.repository = new TabletRepository();
        this.useCase = new ListarTablets(this.repository);
    }
    async listar(req, res) {
        try {
            const tablets = await this.useCase.ejecutar();
            res.json(tablets);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
module.exports = new TabletController();