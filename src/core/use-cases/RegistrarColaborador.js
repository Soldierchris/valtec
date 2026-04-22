const Colaborador = require('../entities/Colaborador');

class RegistrarColaborador {
    constructor(colaboradorRepository) {
        this.colaboradorRepository = colaboradorRepository;
    }

    async ejecutar(datosColaborador) {
        // Creamos la entidad para validar datos (rut, nombre1, apellido1)
        const nuevoColaborador = new Colaborador(datosColaborador);
        
        // Si la entidad es válida, procedemos a guardar
        return await this.colaboradorRepository.guardar(nuevoColaborador);
    }
}

module.exports = RegistrarColaborador;