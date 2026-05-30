const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ─── Configuración MySQL ───────────────────────────────────────────────────
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'nail_salon',
};

let pool;

async function initDB() {
  // Crear conexión sin base de datos para poder crearla si no existe
  const tempConn = await mysql.createConnection({
    host: DB_CONFIG.host,
    port: DB_CONFIG.port,
    user: DB_CONFIG.user,
    password: DB_CONFIG.password,
  });

  await tempConn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_CONFIG.database}\``);
  await tempConn.end();

  pool = mysql.createPool(DB_CONFIG);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS turnos (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      nombre        VARCHAR(100) NOT NULL,
      telefono      VARCHAR(30)  NOT NULL,
      email         VARCHAR(100),
      servicio      VARCHAR(100) NOT NULL,
      fecha         DATE         NOT NULL,
      hora          TIME         NOT NULL,
      notas         TEXT,
      estado        ENUM('pendiente','confirmado','cancelado') DEFAULT 'pendiente',
      created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ Base de datos lista');
}

// ─── Rutas ──────────────────────────────────────────────────────────────────

// GET /turnos — listar todos (opcionalmente filtrar por fecha)
app.get('/turnos', async (req, res) => {
  try {
    const { fecha } = req.query;
    let query = 'SELECT * FROM turnos WHERE estado != "cancelado" ORDER BY fecha, hora';
    const params = [];
    if (fecha) {
      query = 'SELECT * FROM turnos WHERE fecha = ? AND estado != "cancelado" ORDER BY hora';
      params.push(fecha);
    }
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /turnos — crear turno
app.post('/turnos', async (req, res) => {
  try {
    const { nombre, telefono, email, servicio, fecha, hora, notas } = req.body;

    if (!nombre || !telefono || !servicio || !fecha || !hora) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    // Verificar que no haya otro turno en ese horario
    const [existing] = await pool.query(
      'SELECT id FROM turnos WHERE fecha = ? AND hora = ? AND estado != "cancelado"',
      [fecha, hora]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Ese horario ya está reservado' });
    }

    const [result] = await pool.query(
      'INSERT INTO turnos (nombre, telefono, email, servicio, fecha, hora, notas) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nombre, telefono, email || null, servicio, fecha, hora, notas || null]
    );

    const [newTurno] = await pool.query('SELECT * FROM turnos WHERE id = ?', [result.insertId]);
    res.status(201).json(newTurno[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /turnos/:id — cancelar turno
app.delete('/turnos/:id', async (req, res) => {
  try {
    await pool.query('UPDATE turnos SET estado = "cancelado" WHERE id = ?', [req.params.id]);
    res.json({ message: 'Turno cancelado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /horarios-disponibles — horarios libres para una fecha
app.get('/horarios-disponibles', async (req, res) => {
  try {
    const { fecha } = req.query;
    if (!fecha) return res.status(400).json({ error: 'Falta la fecha' });

    const todosLosHorarios = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
      '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
    ];

    const [ocupados] = await pool.query(
      'SELECT hora FROM turnos WHERE fecha = ? AND estado != "cancelado"',
      [fecha]
    );
    const horasOcupadas = ocupados.map(r => r.hora.substring(0, 5));
    const disponibles = todosLosHorarios.filter(h => !horasOcupadas.includes(h));

    res.json(disponibles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Start ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
initDB()
  .then(() => app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)))
  .catch(err => { console.error('Error iniciando DB:', err); process.exit(1); });
