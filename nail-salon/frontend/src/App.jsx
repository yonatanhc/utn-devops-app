import { useState, useEffect } from 'react';

const API = '';

const SERVICIOS = [
  { id: 'manicura_clasica', nombre: '💅 Manicura Clásica', duracion: '45 min', precio: '$2.500' },
  { id: 'manicura_gel', nombre: '✨ Manicura en Gel', duracion: '60 min', precio: '$3.800' },
  { id: 'pedicura_clasica', nombre: '🦶 Pedicura Clásica', duracion: '50 min', precio: '$2.800' },
  { id: 'pedicura_spa', nombre: '🛁 Pedicura Spa', duracion: '75 min', precio: '$4.200' },
  { id: 'nail_art', nombre: '🎨 Nail Art', duracion: '90 min', precio: '$5.000' },
  { id: 'semipermanente', nombre: '💎 Semipermanente', duracion: '70 min', precio: '$4.500' },
];

const formatFecha = (dateStr) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun',
    'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${d} ${meses[parseInt(m) - 1]} ${y}`;
};

function App() {
  const [vista, setVista] = useState('inicio'); // inicio | reservar | mis-turnos
  const [form, setForm] = useState({
    nombre: '', telefono: '', email: '',
    servicio: '', fecha: '', hora: '', notas: ''
  });
  const [horariosDisp, setHorariosDisp] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exito, setExito] = useState(null);
  const [error, setError] = useState(null);

  const hoy = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (vista === 'mis-turnos') fetchTurnos();
  }, [vista]);

  useEffect(() => {
    if (form.fecha) fetchHorarios(form.fecha);
  }, [form.fecha]);

  const fetchHorarios = async (fecha) => {
    try {
      const res = await fetch(`${API}/horarios-disponibles?fecha=${fecha}`);
      const data = await res.json();
      setHorariosDisp(data);
      setForm(f => ({ ...f, hora: '' }));
    } catch {
      setHorariosDisp([]);
    }
  };

  const fetchTurnos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/turnos`);
      const data = await res.json();
      setTurnos(data);
    } catch {
      setError('No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    const { nombre, telefono, servicio, fecha, hora } = form;
    if (!nombre || !telefono || !servicio || !fecha || !hora) {
      setError('Por favor completá todos los campos obligatorios');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/turnos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setExito(data);
      setForm({ nombre: '', telefono: '', email: '', servicio: '', fecha: '', hora: '', notas: '' });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelarTurno = async (id) => {
    if (!confirm('¿Querés cancelar este turno?')) return;
    await fetch(`${API}/turnos/${id}`, { method: 'DELETE' });
    fetchTurnos();
  };

  const servicioNombre = (id) => SERVICIOS.find(s => s.id === id)?.nombre || id;

  if (exito) return (
    <div style={s.page}>
      <div style={s.successCard}>
        <div style={s.successIcon}>✓</div>
        <h2 style={s.successTitle}>¡Turno reservado!</h2>
        <p style={s.successSub}>Te esperamos el <strong>{formatFecha(exito.fecha)}</strong> a las <strong>{exito.hora?.substring(0,5)}</strong></p>
        <div style={s.successDetail}>
          <Row label="Nombre" value={exito.nombre} />
          <Row label="Servicio" value={servicioNombre(exito.servicio)} />
          <Row label="Teléfono" value={exito.telefono} />
        </div>
        <button style={s.btnPrimary} onClick={() => setExito(null)}>
          Hacer otra reserva
        </button>
      </div>
    </div>
  );

  return (
    <div style={s.page}>
      {/* Header */}
      <header style={s.header}>
        <div style={s.headerInner}>
          <div style={s.logo}>
            <span style={s.logoIcon}>💅</span>
            <div>
              <div style={s.logoTitle}>Nails & Co.</div>
              <div style={s.logoSub}>Estudio de Uñas</div>
            </div>
          </div>
          <nav style={s.nav}>
            {[
              { id: 'inicio', label: 'Inicio' },
              { id: 'reservar', label: 'Reservar turno' },
              { id: 'mis-turnos', label: 'Ver turnos' },
            ].map(tab => (
              <button
                key={tab.id}
                style={{ ...s.navBtn, ...(vista === tab.id ? s.navBtnActive : {}) }}
                onClick={() => { setVista(tab.id); setError(null); }}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main style={s.main}>

        {/* ── INICIO ── */}
        {vista === 'inicio' && (
          <div>
            <div style={s.hero}>
              <p style={s.heroEyebrow}>Bienvenida</p>
              <h1 style={s.heroTitle}>Tu belleza,<br />nuestra pasión</h1>
              <p style={s.heroSub}>Reservá tu turno en segundos y disfrutá de una experiencia única.</p>
              <button style={s.btnPrimary} onClick={() => setVista('reservar')}>
                Reservar turno →
              </button>
            </div>
            <div style={s.serviciosGrid}>
              {SERVICIOS.map(srv => (
                <div key={srv.id} style={s.servicioCard}
                  onClick={() => { setVista('reservar'); setForm(f => ({ ...f, servicio: srv.id })); }}
                >
                  <div style={s.servicioNombre}>{srv.nombre}</div>
                  <div style={s.servicioInfo}>{srv.duracion}</div>
                  <div style={s.servicioPrecio}>{srv.precio}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── RESERVAR ── */}
        {vista === 'reservar' && (
          <div style={s.formContainer}>
            <h2 style={s.sectionTitle}>Reservar turno</h2>
            <p style={s.sectionSub}>Completá tus datos y elegí el horario que más te convenga.</p>

            {error && <div style={s.errorBox}>{error}</div>}

            <div style={s.formGrid}>
              <Field label="Nombre *" >
                <input style={s.input} placeholder="Tu nombre completo"
                  value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
              </Field>
              <Field label="Teléfono *">
                <input style={s.input} placeholder="Ej: 11 1234-5678"
                  value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} />
              </Field>
              <Field label="Email">
                <input style={s.input} placeholder="Tu email (opcional)"
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </Field>
              <Field label="Servicio *">
                <select style={s.input} value={form.servicio}
                  onChange={e => setForm(f => ({ ...f, servicio: e.target.value }))}>
                  <option value="">Seleccioná un servicio</option>
                  {SERVICIOS.map(s => <option key={s.id} value={s.id}>{s.nombre} — {s.precio}</option>)}
                </select>
              </Field>
              <Field label="Fecha *">
                <input style={s.input} type="date" min={hoy}
                  value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} />
              </Field>
            </div>

            {form.fecha && (
              <div style={{ marginTop: '1.5rem' }}>
                <div style={s.fieldLabel}>Horario disponible *</div>
                {horariosDisp.length === 0
                  ? <p style={{ color: '#e05', fontSize: 14 }}>No hay horarios disponibles para esa fecha.</p>
                  : (
                    <div style={s.horariosGrid}>
                      {horariosDisp.map(h => (
                        <button key={h}
                          style={{ ...s.horarioBtn, ...(form.hora === h ? s.horarioBtnActive : {}) }}
                          onClick={() => setForm(f => ({ ...f, hora: h }))}
                        >{h}</button>
                      ))}
                    </div>
                  )}
              </div>
            )}

            <Field label="Notas adicionales" style={{ marginTop: '1.5rem' }}>
              <textarea style={{ ...s.input, height: 80, resize: 'vertical' }}
                placeholder="Algún detalle especial para tu turno..."
                value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} />
            </Field>

            <button style={{ ...s.btnPrimary, marginTop: '2rem', width: '100%' }}
              onClick={handleSubmit} disabled={loading}>
              {loading ? 'Reservando...' : '✓  Confirmar reserva'}
            </button>
          </div>
        )}

        {/* ── MIS TURNOS ── */}
        {vista === 'mis-turnos' && (
          <div>
            <h2 style={s.sectionTitle}>Turnos reservados</h2>
            <p style={s.sectionSub}>Todos los turnos activos del local.</p>

            {loading && <p style={{ textAlign: 'center', color: '#999' }}>Cargando...</p>}
            {error && <div style={s.errorBox}>{error}</div>}

            {!loading && turnos.length === 0 && (
              <div style={s.emptyState}>
                <div style={{ fontSize: 48 }}>📅</div>
                <p>No hay turnos reservados todavía.</p>
                <button style={s.btnPrimary} onClick={() => setVista('reservar')}>Hacer una reserva</button>
              </div>
            )}

            <div style={s.turnosList}>
              {turnos.map(t => (
                <div key={t.id} style={s.turnoCard}>
                  <div style={s.turnoHeader}>
                    <div>
                      <div style={s.turnoNombre}>{t.nombre}</div>
                      <div style={s.turnoServicio}>{servicioNombre(t.servicio)}</div>
                    </div>
                    <div style={s.turnoFechaHora}>
                      <div style={s.turnoFecha}>{formatFecha(t.fecha?.split('T')[0])}</div>
                      <div style={s.turnoHora}>{t.hora?.substring(0, 5)}</div>
                    </div>
                  </div>
                  <div style={s.turnoFooter}>
                    <span style={s.turnoTel}>📞 {t.telefono}</span>
                    <span style={{ ...s.badge, ...(t.estado === 'confirmado' ? s.badgeGreen : s.badgePink) }}>
                      {t.estado}
                    </span>
                    <button style={s.btnCancel} onClick={() => cancelarTurno(t.id)}>Cancelar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      <footer style={s.footer}>
        <p>© 2024 Nails & Co. · Av. Rivadavia 1234, CABA · 📞 11 5555-9999</p>
      </footer>
    </div>
  );
}

function Field({ label, children, style }) {
  return (
    <div style={{ marginBottom: '1rem', ...style }}>
      <label style={s.fieldLabel}>{label}</label>
      {children}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0',
      borderBottom: '1px solid #f0e8f0' }}>
      <span style={{ color: '#999', fontSize: 14 }}>{label}</span>
      <span style={{ fontWeight: 500, fontSize: 14 }}>{value}</span>
    </div>
  );
}

// ─── Estilos ─────────────────────────────────────────────────────────────────
const s = {
  page: { minHeight: '100vh', background: '#fdf9fb', fontFamily: "'Segoe UI', sans-serif", color: '#2a1a2e' },

  header: { background: '#fff', borderBottom: '1px solid #f0e0f0', position: 'sticky', top: 0, zIndex: 10 },
  headerInner: { maxWidth: 900, margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 },
  logo: { display: 'flex', alignItems: 'center', gap: 10 },
  logoIcon: { fontSize: 28 },
  logoTitle: { fontWeight: 700, fontSize: 18, color: '#8b3a8b', lineHeight: 1.2 },
  logoSub: { fontSize: 11, color: '#b06ab0', letterSpacing: 1 },
  nav: { display: 'flex', gap: 4 },
  navBtn: { background: 'none', border: 'none', padding: '8px 16px', borderRadius: 20, cursor: 'pointer', fontSize: 14, color: '#666', transition: 'all .2s' },
  navBtnActive: { background: '#f5e0f5', color: '#8b3a8b', fontWeight: 600 },

  main: { maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem 4rem' },

  hero: { textAlign: 'center', padding: '3rem 1rem 2rem', background: 'linear-gradient(135deg, #fdf0fd 0%, #fce4f8 100%)', borderRadius: 20, marginBottom: '2.5rem' },
  heroEyebrow: { fontSize: 13, letterSpacing: 3, color: '#c06ab0', textTransform: 'uppercase', marginBottom: 8 },
  heroTitle: { fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 800, color: '#5a1a5a', lineHeight: 1.15, margin: '0 0 16px' },
  heroSub: { color: '#9060a0', fontSize: 16, margin: '0 0 28px' },

  btnPrimary: { background: 'linear-gradient(135deg, #b04ab0 0%, #7b2a9b 100%)', color: '#fff', border: 'none', padding: '14px 32px', borderRadius: 30, fontSize: 15, fontWeight: 600, cursor: 'pointer', letterSpacing: .5 },

  serviciosGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 },
  servicioCard: { background: '#fff', border: '1px solid #f0e0f0', borderRadius: 16, padding: '1.25rem', cursor: 'pointer', transition: 'transform .2s, box-shadow .2s', ':hover': { transform: 'translateY(-2px)' } },
  servicioNombre: { fontWeight: 600, fontSize: 15, marginBottom: 6, color: '#4a0a6a' },
  servicioInfo: { fontSize: 13, color: '#aaa', marginBottom: 4 },
  servicioPrecio: { fontSize: 18, fontWeight: 700, color: '#b04ab0' },

  formContainer: { maxWidth: 640, margin: '0 auto' },
  sectionTitle: { fontSize: 26, fontWeight: 700, color: '#5a1a5a', marginBottom: 6 },
  sectionSub: { color: '#9060a0', marginBottom: '2rem', fontSize: 15 },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1.5rem' },
  fieldLabel: { display: 'block', fontSize: 13, fontWeight: 600, color: '#7a3a7a', marginBottom: 6, letterSpacing: .3 },
  input: { width: '100%', padding: '10px 14px', border: '1.5px solid #e8d0e8', borderRadius: 10, fontSize: 14, outline: 'none', background: '#fff', boxSizing: 'border-box', transition: 'border .2s' },

  horariosGrid: { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  horarioBtn: { padding: '8px 16px', borderRadius: 20, border: '1.5px solid #e0c8e0', background: '#fff', fontSize: 13, cursor: 'pointer', fontWeight: 500, color: '#6a2a6a' },
  horarioBtnActive: { background: '#b04ab0', color: '#fff', borderColor: '#b04ab0' },

  errorBox: { background: '#ffeef0', border: '1px solid #ffb0b8', color: '#c0304a', borderRadius: 10, padding: '12px 16px', marginBottom: '1rem', fontSize: 14 },

  turnosList: { display: 'flex', flexDirection: 'column', gap: 12, marginTop: '1rem' },
  turnoCard: { background: '#fff', border: '1px solid #f0e0f0', borderRadius: 16, padding: '1.25rem' },
  turnoHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: 12 },
  turnoNombre: { fontWeight: 700, fontSize: 16, color: '#4a0a6a' },
  turnoServicio: { fontSize: 13, color: '#b06ab0', marginTop: 2 },
  turnoFechaHora: { textAlign: 'right' },
  turnoFecha: { fontSize: 14, fontWeight: 600, color: '#5a1a5a' },
  turnoHora: { fontSize: 20, fontWeight: 800, color: '#b04ab0' },
  turnoFooter: { display: 'flex', alignItems: 'center', gap: 12, borderTop: '1px solid #f8eef8', paddingTop: 12 },
  turnoTel: { fontSize: 13, color: '#888', flex: 1 },
  badge: { fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5 },
  badgePink: { background: '#fce4f8', color: '#b04ab0' },
  badgeGreen: { background: '#e4f8e8', color: '#2a8b4a' },
  btnCancel: { background: 'none', border: '1px solid #f0a0a0', color: '#c04040', borderRadius: 20, padding: '4px 14px', fontSize: 12, cursor: 'pointer' },

  emptyState: { textAlign: 'center', padding: '4rem 2rem', color: '#aaa' },

  successCard: { maxWidth: 440, margin: '4rem auto', background: '#fff', border: '1px solid #f0e0f0', borderRadius: 24, padding: '2.5rem', textAlign: 'center' },
  successIcon: { width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #b04ab0, #7b2a9b)', color: '#fff', fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' },
  successTitle: { fontSize: 24, fontWeight: 800, color: '#5a1a5a', marginBottom: 8 },
  successSub: { color: '#9060a0', marginBottom: '1.5rem', fontSize: 15 },
  successDetail: { background: '#fdf5fd', borderRadius: 12, padding: '1rem', marginBottom: '1.5rem', textAlign: 'left' },

  footer: { borderTop: '1px solid #f0e0f0', textAlign: 'center', padding: '1.5rem', color: '#bbb', fontSize: 13 },
};

export default App;
