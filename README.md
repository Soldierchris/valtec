# VALTEC — Sistema de Gestión Logística

> Sistema web en producción para la gestión de inventario, trazabilidad de activos serializados y custodia de equipos en operaciones aeroportuarias y de bodega.

🔗 **Demo en vivo:** [logisticavaltec.cl](https://logisticavaltec.cl/login.html)  
📦 **Estado:** Producción activa con usuarios reales  
🗓️ **Desde:** 2024

---

## ¿Qué hace VALTEC?

VALTEC resuelve un problema real: el control de inventario en operaciones logísticas donde múltiples personas rotan en turnos y la trazabilidad de cada movimiento es crítica.

El sistema permite:

- **Ingreso de productos** al inventario con registro de cantidad y proveedor
- **Entregas y devoluciones** con trazabilidad completa por movimiento
- **Activos serializados** — seguimiento individual por número de serie
- **Custodia de equipos** — asignación de activos a colaboradores con notificación automática por correo
- **Reportes** de stock, movimientos e historial por producto o colaborador
- **Gestión de colaboradores** con datos de contacto y sector

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend | Node.js · Express |
| Base de datos | MariaDB (Aiven cloud) |
| Frontend | JavaScript ES6 · Bootstrap |
| Infraestructura | Docker · Render · GitHub Actions |
| Email | Nodemailer · cPanel SMTP |
| DNS | Cloudflare |

---

## Arquitectura

El backend sigue una arquitectura limpia en capas:

```
routes → controllers → repositories → entities
```

El frontend está organizado en módulos por dominio:

```
public/
└── js/
    ├── http.js           # Capa centralizada de fetch
    ├── ingreso.js
    ├── entrega.js
    ├── devolucion.js
    ├── trazabilidad.js
    └── reportes.js
```

---

## Características técnicas destacadas

- **Stock calculado dinámicamente** desde movimientos — nunca almacenado directamente
- **Keep-alive automático** cada 30 minutos para mantener conexión con Aiven free tier
- **CI/CD** desde rama `main` hacia Render con despliegue automático
- **Entorno de desarrollo reproducible** con Docker Desktop y MariaDB local
- **Notificaciones por correo** al asignar custodia de equipos (Nodemailer)
- **Variables de entorno separadas** para producción y desarrollo con `cross-env`

---

## Modelo de datos principal

```
producto ──┐
           ├── movimiento (Ingreso / Entrega / Devolución / Traslado)
           └── detalle_serializado

colaborador ── custodia de activos serializados
```

---

## Instalación local

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/valtec.git
cd valtec

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.development
# Editar .env.development con tus credenciales locales

# Levantar base de datos local
docker run --name valtec-dev -e MYSQL_ROOT_PASSWORD=root \
  -p 3306:3306 -d mariadb:10.11

# Iniciar en desarrollo
npm run dev
```

---

## Variables de entorno requeridas

```env
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=
EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASS=
```

---

## Autor

**Christian Castro Pazmiño**  
Desarrollador Backend · Analítica de Datos  
[linkedin.com/in/castrodevit](https://linkedin.com/in/castrodevit)

---

> Proyecto desarrollado como solución real para Valtec Chile SpA, con foco en arquitectura limpia, trazabilidad operacional y despliegue en la nube.