class ObtenerInventarioFormularios {
    constructor(formularioRepository) {
        this.formularioRepository = formularioRepository;
    }

    async ejecutar(aerolinea) {
        // Aquí podrías agregar lógica extra, como validar que la aerolínea sea válida
        const validas = ['LATAM', 'SKY', 'OTRO'];
        if (!validas.includes(aerolinea)) {
            throw new Error(`Aerolínea ${aerolinea} no es válida.`);
        }

        return await this.formularioRepository.obtenerPorAerolinea(aerolinea);
    }
}

module.exports = ObtenerInventarioFormularios;