# 💅 Nail Salon — Sistema de Turnos

Aplicación web para gestionar reservas de un local de uñas. Frontend en **React**, backend en **Node.js/Express** con base de datos **MySQL**.

---

## 📁 Estructura del proyecto

```
nail-salon/
├── backend/
│   ├── server.js          ← API REST Express
│   ├── package.json
│   └── .env.example       ← Configuración de DB (copiar a .env)
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── index.js
    │   └── App.jsx        ← Toda la UI en React
    └── package.json
```

---

## 🚀 Cómo correr el proyecto

### 1. Prerrequisitos

- **Node.js** v18 o superior
- **MySQL** 8.x corriendo localmente
- Un cliente MySQL (Workbench, DBeaver, o la CLI)

---

### 2. Configurar el Backend

```bash
cd backend
cp .env.example .env
```

Editá `.env` con tus datos de MySQL:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=nail_salon
PORT=3001
```

Instalá dependencias y arrancá:

```bash
npm install
npm start
# ó para desarrollo con auto-reload:
npm run dev
```

El servidor arranca en **http://localhost:3001** y crea automáticamente la base de datos y tabla si no existen.

---

### 3. Configurar el Frontend

```bash
cd frontend
npm install
npm start
```

La app abre en **http://localhost:3000**

---

## 🗄️ Base de datos

La tabla `turnos` se crea automáticamente al iniciar el backend:

```sql
CREATE TABLE turnos (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  nombre     VARCHAR(100) NOT NULL,
  telefono   VARCHAR(30)  NOT NULL,
  email      VARCHAR(100),
  servicio   VARCHAR(100) NOT NULL,
  fecha      DATE         NOT NULL,
  hora       TIME         NOT NULL,
  notas      TEXT,
  estado     ENUM('pendiente','confirmado','cancelado') DEFAULT 'pendiente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📡 Endpoints de la API

| Método | Ruta                        | Descripción                        |
|--------|-----------------------------|------------------------------------|
| GET    | `/turnos`                   | Listar todos los turnos activos    |
| GET    | `/turnos?fecha=YYYY-MM-DD`  | Filtrar por fecha                  |
| POST   | `/turnos`                   | Crear nueva reserva                |
| DELETE | `/turnos/:id`               | Cancelar un turno                  |
| GET    | `/horarios-disponibles?fecha=YYYY-MM-DD` | Horarios libres  |

### Ejemplo POST `/turnos`
```json
{
  "nombre": "María García",
  "telefono": "11 1234-5678",
  "email": "maria@mail.com",
  "servicio": "manicura_gel",
  "fecha": "2024-12-20",
  "hora": "10:00",
  "notas": "Prefiero colores suaves"
}
```

---

## ✨ Funcionalidades

- ✅ Reservar turno con datos personales
- ✅ Elegir servicio (con precio y duración)
- ✅ Seleccionar fecha y ver horarios disponibles en tiempo real
- ✅ Validación de horarios duplicados
- ✅ Listar todos los turnos activos
- ✅ Cancelar turnos
- ✅ Pantalla de confirmación exitosa

---

## 🔧 Mejoras posibles

- Autenticación con JWT para el panel de admin
- Envío de emails de confirmación (Nodemailer)
- Recordatorios por WhatsApp (Twilio)
- Panel de administración para confirmar/gestionar turnos
- Soporte multi-empleada
