// src/core/entities/Colaborador.js

class Colaborador {
    constructor({ 
        rut, 
        nombre1, 
        nombre2 = null, 
        apellido1, 
        apellido2 = null, 
        cargo, 
        telefono1 = null, 
        telefono2 = null, 
        mail = null, 
        sector 
    }) {
        // Validaciones básicas de negocio
        if (!rut || !nombre1 || !apellido1) {
            throw new Error("RUT, primer nombre y primer apellido son obligatorios.");
        }

        this.rut = rut;
        this.nombre1 = nombre1;
        this.nombre2 = nombre2;
        this.apellido1 = apellido1;
        this.apellido2 = apellido2;
        this.cargo = cargo;
        this.telefono1 = telefono1;
        this.telefono2 = telefono2;
        this.mail = mail;
        this.sector = sector;
        // No incluimos fecharegistro porque MariaDB se encarga de ella
    }

    // Un método útil para mostrar el nombre en la interfaz
    // Colocaria el Segundo nombre? 
    get nombreCompleto() {
        return `${this.nombre1} ${this.apellido1} ${this.apellido2 || ''}`.trim();
    }
}

module.exports = Colaborador;