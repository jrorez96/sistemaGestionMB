import { useEffect, useState } from 'react';
import api from '../../services/api';
import SearchBar from '../../components/SearchBar';
import Pagination from '../../components/Pagination';

const vacio = { nombre: '', fecha: '', monto: '', porcentajeIva: 13, montoPagado: 0 };
const LIMITE = 10;
const hoy = () => new Date().toISOString().substring(0, 10);

export default function RegistroFacturas() {
  const [facturas, setFacturas] = useState([]);
  const [form, setForm] = useState(vacio);
  const [editandoId, setEditandoId] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalMontoGeneral, setTotalMontoGeneral] = useState(0);

  // Panel de abono
  const [facturaAbono, setFacturaAbono] = useState(null);
  const [montoAbono, setMontoAbono] = useState('');
  const [fechaAbono, setFechaAbono] = useState(hoy());

  // Panel de historial
  const [historialFacturaId, setHistorialFacturaId] = useState(null);
  const [historial, setHistorial] = useState([]);

  const cargar = async (buscar = busqueda, paginaSolicitada = pagina) => {
    const res = await api.get('/facturas', {
      params: { buscar, pagina: paginaSolicitada, limite: LIMITE },
    });
    setFacturas(res.data.datos);
    setTotalPaginas(res.data.totalPaginas);
    setTotalMontoGeneral(res.data.totalMontoGeneral);
  };

  useEffect(() => { cargar(busqueda, pagina); }, [pagina]);

  const buscarDesdeCero = (texto) => {
    setBusqueda(texto);
    setPagina(1);
    cargar(texto, 1);
  };

  const montoIvaCalculado = (Number(form.monto || 0) * Number(form.porcentajeIva || 0)) / 100;
  const saldoIvaCalculado = montoIvaCalculado - Number(form.montoPagado || 0);

  const guardar = async (e) => {
    e.preventDefault();
    if (editandoId) {
      await api.put(`/facturas/${editandoId}`, {
        nombre: form.nombre,
        fecha: form.fecha,
        monto: Number(form.monto),
        porcentajeIva: Number(form.porcentajeIva),
      });
    } else {
      await api.post('/facturas', {
        nombre: form.nombre,
        fecha: form.fecha,
        monto: Number(form.monto),
        porcentajeIva: Number(form.porcentajeIva),
        montoPagado: Number(form.montoPagado || 0),
      });
    }
    setForm(vacio);
    setEditandoId(null);
    cargar();
  };

  const editar = (factura) => {
    setForm({
      nombre: factura.Nombre || '',
      fecha: factura.Fecha?.substring(0, 10),
      monto: factura.Monto,
      porcentajeIva: factura.PorcentajeIva,
      montoPagado: factura.MontoPagado,
    });
    setEditandoId(factura.FacturaId);
  };

  const eliminar = async (factura) => {
    if (!confirm('¿Eliminar esta factura?')) return;
    await api.delete(`/facturas/${factura.FacturaId}`);
    cargar();
  };

  const abrirPanelAbono = (factura) => {
    setFacturaAbono(factura);
    setMontoAbono('');
    setFechaAbono(hoy());
  };

  const confirmarAbono = async () => {
    if (!montoAbono || Number(montoAbono) <= 0) return alert('Ingresa un monto válido');
    try {
      await api.put(`/facturas/${facturaAbono.FacturaId}/abono`, {
        monto: Number(montoAbono),
        fechaAbono,
      });
      setFacturaAbono(null);
      cargar();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al registrar el abono');
    }
  };

  const verHistorial = async (factura) => {
    const res = await api.get(`/facturas/${factura.FacturaId}/abonos`);
    setHistorial(res.data);
    setHistorialFacturaId(factura.FacturaId);
  };

  return (
    <div>
      <h2>Registro de Facturas</h2>
      <form className="form-panel" onSubmit={guardar}>
        <label>Nombre</label>
        <input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />

        <label>Fecha</label>
        <input type="date" required value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} />

        <label>Monto</label>
        <input type="number" step="0.01" required value={form.monto} onChange={(e) => setForm({ ...form, monto: e.target.value })} />

        <label>% IVA</label>
        <input type="number" step="0.01" required value={form.porcentajeIva} onChange={(e) => setForm({ ...form, porcentajeIva: e.target.value })} />

        {!editandoId && (
          <>
            <label>Pago parcial del IVA (opcional)</label>
            <input type="number" step="0.01" value={form.montoPagado} onChange={(e) => setForm({ ...form, montoPagado: e.target.value })} />
          </>
        )}

        <div style={{ background: '#e2e8f0', padding: 10, borderRadius: 6, marginBottom: 10 }}>
          <p><strong>Monto del IVA: ₡{montoIvaCalculado.toFixed(2)}</strong></p>
          {!editandoId && <p>Saldo pendiente del IVA: ₡{saldoIvaCalculado.toFixed(2)}</p>}
        </div>

        <button className="btn-primario" type="submit">{editandoId ? 'Actualizar' : 'Agregar'} Factura</button>
        {editandoId && <button type="button" onClick={() => { setForm(vacio); setEditandoId(null); }}>Cancelar</button>}
      </form>

      <SearchBar onBuscar={buscarDesdeCero} placeholder="Buscar por nombre o estado..." />

      <table className="crud-table">
        <thead>
          <tr>
            <th>Nombre</th><th>Fecha</th><th>Monto</th><th>% IVA</th><th>Monto IVA</th>
            <th>Pagado (IVA)</th><th>Saldo (IVA)</th><th>Estado</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {facturas.map((f) => (
            <tr key={f.FacturaId}>
              <td>{f.Nombre}</td>
              <td>{f.Fecha?.substring(0, 10)}</td>
              <td>₡{f.Monto}</td>
              <td>{f.PorcentajeIva}%</td>
              <td>₡{f.MontoIva}</td>
              <td>₡{f.MontoPagado}</td>
              <td>₡{f.SaldoPendiente}</td>
              <td>{f.Estado}</td>
              <td>
                <button className="btn-editar" onClick={() => editar(f)}>Editar</button>
                {f.Estado === 'Pendiente' && (
                  <button className="btn-editar" onClick={() => abrirPanelAbono(f)}>Abonar</button>
                )}
                <button className="btn-editar" onClick={() => verHistorial(f)}>Historial</button>
                <button className="btn-eliminar" onClick={() => eliminar(f)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={2} style={{ fontWeight: 'bold' }}>Total general</td>
            <td style={{ fontWeight: 'bold' }}>₡{totalMontoGeneral}</td>
            <td colSpan={6}></td>
          </tr>
        </tfoot>
      </table>

      <Pagination pagina={pagina} totalPaginas={totalPaginas} onCambiar={setPagina} />

      {/* Panel de abono */}
      {facturaAbono && (
        <div className="form-panel" style={{ marginTop: 15 }}>
          <h3>Registrar abono — {facturaAbono.Nombre}</h3>
          <p>Saldo pendiente del IVA: ₡{facturaAbono.SaldoPendiente}</p>
          <label>Monto del abono</label>
          <input type="number" step="0.01" value={montoAbono} onChange={(e) => setMontoAbono(e.target.value)} />
          <label>Fecha del abono</label>
          <input type="date" value={fechaAbono} onChange={(e) => setFechaAbono(e.target.value)} />
          <button className="btn-primario" onClick={confirmarAbono}>Confirmar Abono</button>
          <button type="button" onClick={() => setFacturaAbono(null)}>Cancelar</button>
        </div>
      )}

      {/* Panel de historial de abonos */}
      {historialFacturaId && (
        <div className="form-panel" style={{ marginTop: 15 }}>
          <h3>Historial de abonos</h3>
          {historial.length === 0 ? (
            <p>Aún no hay abonos registrados para esta factura.</p>
          ) : (
            <table className="crud-table">
              <thead><tr><th>Fecha</th><th>Monto</th></tr></thead>
              <tbody>
                {historial.map((a) => (
                  <tr key={a.AbonoId}>
                    <td>{a.FechaAbono?.substring(0, 10)}</td>
                    <td>₡{a.Monto}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <button type="button" onClick={() => setHistorialFacturaId(null)}>Cerrar</button>
        </div>
      )}
    </div>
  );
}