// ============================================================
// emailService.js
// Servicio centralizado de envío de correos para VALTEC.
// Usa nodemailer con SMTP (Outlook / Office 365).
//
// IMPORTANTE: Este servicio es NO BLOQUEANTE.
// Si el correo falla, el movimiento ya quedó grabado en DB.
// Nunca lanzar excepciones que reviertan transacciones.
// ============================================================

require('dotenv').config();
const nodemailer = require('nodemailer');

// ── CONFIGURACIÓN SMTP ────────────────────────────────────────
// Ajusta host/port según tu proveedor de dominio.
// Para Outlook/Office 365 usa smtp.office365.com:587
// Para Gmail usa smtp.gmail.com:587
// Para otro hosting revisa el panel de tu dominio.
const transporter = nodemailer.createTransport({
    host:   process.env.SMTP_HOST   || 'smtp.office365.com',
    port:   parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // STARTTLS
    auth: {
        user: process.env.SMTP_USER || 'sistema@logisticavaltec.cl',
        pass: process.env.SMTP_PASS || '',
    },
    tls: {
        cipherSuites: 'SSLv3',
        rejectUnauthorized: false,
    },
});

// ── HELPER: FECHA FORMATEADA ──────────────────────────────────
function fechaChilena(date = new Date()) {
    return date.toLocaleString('es-CL', {
        timeZone: 'America/Santiago',
        day:    '2-digit',
        month:  '2-digit',
        year:   'numeric',
        hour:   '2-digit',
        minute: '2-digit',
    });
}

// ── HELPER: HTML BASE DEL CORREO ─────────────────────────────
function htmlBase({ titulo, color, icono, filas, nota }) {
    const filasHtml = filas.map(([label, valor]) => `
        <tr>
            <td style="padding:10px 16px; color:#6b7280; font-size:13px; white-space:nowrap; vertical-align:top;">
                ${label}
            </td>
            <td style="padding:10px 16px; color:#111827; font-size:14px; font-weight:600; word-break:break-word;">
                ${valor || '—'}
            </td>
        </tr>`).join('');

    return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

        <!-- CABECERA -->
        <tr>
          <td style="background:${color};padding:28px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-size:28px;">${icono}</td>
                <td style="padding-left:14px;">
                  <div style="color:#ffffff;font-size:11px;letter-spacing:2px;text-transform:uppercase;opacity:0.8;">VALTEC Logística</div>
                  <div style="color:#ffffff;font-size:19px;font-weight:700;margin-top:4px;">${titulo}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- CUERPO -->
        <tr>
          <td style="padding:28px 32px 8px;">
            <p style="margin:0 0 20px;color:#374151;font-size:14px;line-height:1.6;">
              Se ha registrado el siguiente movimiento en el sistema de control de activos:
            </p>
            <table width="100%" cellpadding="0" cellspacing="0"
                   style="border:1px solid #e5e7eb;border-radius:8px;border-collapse:collapse;">
              ${filasHtml}
            </table>
            ${nota ? `<p style="margin:20px 0 0;color:#6b7280;font-size:13px;background:#f9fafb;border-left:4px solid ${color};padding:10px 14px;border-radius:4px;">${nota}</p>` : ''}
          </td>
        </tr>

        <!-- PIE -->
        <tr>
          <td style="padding:24px 32px 32px;">
            <p style="margin:0;color:#9ca3af;font-size:11px;border-top:1px solid #f3f4f6;padding-top:18px;">
              Este correo es generado automáticamente por el sistema VALTEC Logística.<br>
              <strong>No responda a este mensaje.</strong> — Sistema de Control de Activos
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── ENVIAR CORREO (función interna) ───────────────────────────
async function enviar({ asunto, html, cc = [] }) {
    const from = `"VALTEC Logística" <${process.env.SMTP_USER || 'sistema@logisticavaltec.cl'}>`;
    const to   = process.env.SMTP_USER || 'sistema@logisticavaltec.cl'; // copia en la cuenta origen

    const mailOptions = {
        from,
        to,
        cc: cc.filter(Boolean).join(', ') || undefined,
        subject: asunto,
        html,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`[EMAIL] Enviado OK — MessageId: ${info.messageId}`);
        return { ok: true };
    } catch (err) {
        // Solo loguear — nunca lanzar. El movimiento ya está guardado.
        console.error('[EMAIL] Error al enviar:', err.message);
        return { ok: false, error: err.message };
    }
}

// ── API PÚBLICA ───────────────────────────────────────────────

/**
 * Notificación de ENTREGA a colaborador.
 * @param {Object} datos
 * @param {string} datos.descripcion   - Nombre del implemento
 * @param {string} datos.codigo        - N° de serie o ID artículo
 * @param {string} datos.custodio      - Nombre completo del colaborador
 * @param {string} datos.rut           - RUT del colaborador
 * @param {string} [datos.sector]      - Sector/área del colaborador
 * @param {string} [datos.ubicacion]   - Bodega de origen
 * @param {number} [datos.cantidad]    - Cantidad entregada
 * @param {string[]} [datos.cc]        - Correos en copia
 */
async function notificarEntrega(datos) {
    const fecha = fechaChilena();
    const filas = [
        ['📦 Implemento',  datos.descripcion],
        ['🔖 Código / Serie', datos.codigo || datos.id_articulo],
        ['👤 Custodio',    datos.custodio],
        ['🪪 RUT',         datos.rut],
        ['🏢 Sector',      datos.sector || null],
        ['📍 Bodega Origen', datos.ubicacion || null],
        ['🔢 Cantidad',    datos.cantidad ? String(datos.cantidad) : null],
        ['📅 Fecha',       fecha],
    ].filter(([, v]) => v); // omitir filas vacías

    const html = htmlBase({
        titulo:  'Asignación de Custodia',
        color:   '#2563eb',
        icono:   '📤',
        filas,
        nota: '⚠️ Si existe alguna novedad con esta asignación, por favor infórmenos a la brevedad.',
    });

    return enviar({
        asunto: `[VALTEC] Entrega registrada — ${datos.descripcion}`,
        html,
        cc: datos.cc || [],
    });
}

/**
 * Notificación de DEVOLUCIÓN a bodega.
 */
async function notificarDevolucion(datos) {
    const fecha = fechaChilena();
    const filas = [
        ['📦 Implemento',   datos.descripcion],
        ['🔖 Código / Serie', datos.codigo || datos.id_articulo],
        ['👤 Devuelto por', datos.custodio],
        ['🪪 RUT',          datos.rut],
        ['📍 Bodega Destino', datos.ubicacion || null],
        ['📅 Fecha',        fecha],
        ['💬 Observación',  datos.observacion || null],
    ].filter(([, v]) => v);

    const html = htmlBase({
        titulo: 'Devolución a Bodega',
        color:  '#16a34a',
        icono:  '↩️',
        filas,
        nota: datos.observacion
            ? null
            : '✅ El implemento ha sido devuelto correctamente a bodega.',
    });

    return enviar({
        asunto: `[VALTEC] Devolución registrada — ${datos.descripcion}`,
        html,
        cc: datos.cc || [],
    });
}

module.exports = { notificarEntrega, notificarDevolucion };