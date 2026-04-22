class ListarTablets {
    constructor(tabletRepository) {
        this.tabletRepository = tabletRepository;
    }
    async ejecutar() {
        return await this.tabletRepository.obtenerTodas();
    }
}
module.exports = ListarTablets;