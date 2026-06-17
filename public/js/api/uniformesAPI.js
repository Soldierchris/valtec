// public/js/api/uniformesAPI.js
// Patrón idéntico a movimientos.api.js, colaboradores.api.js, etc.
// http.js exporta fetchJSON — no un objeto {get, post}

import { fetchJSON } from './http.js';

const BASE = '/api/uniformes-pendientes';

export const uniformesAPI = {
    listar:    ()     => fetchJSON(BASE),
    crear:     (data) => fetchJSON(BASE, 'POST', data),
    notificar: (id)   => fetchJSON(`${BASE}/${id}/notificar`, 'POST'),
    cerrar:    (id)   => fetchJSON(`${BASE}/${id}/cerrar`,    'POST'),
};