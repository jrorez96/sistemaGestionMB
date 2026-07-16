import { useEffect, useState } from 'react';
import api from '../../services/api';
import SearchBar from '../../components/SearchBar';
import Pagination from '../../components/Pagination';

const vacio = { fecha: '', destino: '', precio: '', montoPagado: 0 };
const LIMITE = 10;
const hoy = () => new Date().toISOString().substring(0, 10);

export default function RegistrarViaje() {
  const [viajes, setViajes] = useState([]);
  const [form, setForm] = useState(vacio);
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  const [viajeAbono, setViajeAbono] = useState(null);
  const [montoAbono, setMontoAbono] = useState('');
  const [fechaAbono, setFechaAbono] = useState(hoy());

  const [historialViajeId, setHistorialViajeId] = useState(null);
  const [historial, setHistorial] = useState([]);

  const cargar = async (buscar = busqueda, paginaSolicitada = pagina) => {
    const res = await api.get('/viajes', {
      params: { buscar, pagina: paginaSolicitada, limite: LIMITE },
    });
    setViajes(res.data.datos);
    setTotalPaginas(res.data.totalPaginas);
  };

  useEffect(() => { cargar(busqueda, pagina); }, [pagina]);

  const buscarDesdeCero = (texto) => {
    setBusqueda(texto);
    setPagina(1);
    cargar(texto, 1);
  };

  const ivaCalculado = Number(form.precio || 0) * 0.13;
  const totalInterno = Number(form.precio || 0) + ivaCalculado;
  const saldoCalculado = totalInterno - Number(form.montoPagado || 0);

  const guardar = async (e) => {
    e.preventDefault();
    await api.post('/viajes', {
      fecha: form.fecha,
      destino: form.destino,
      precio: Number(form.precio),
      montoPagado: Number(form.montoPagado || 0),
    });
    setForm(vacio);
    cargar();
  };

  const eliminar = async (viaje) => {
    if (!confirm(`¿Eliminar viaje a ${viaje.Destino}?`)) return;
    await api.delete(`/viajes/${viaje.ViajeId}`);
    cargar();
  };

  const abrirPanelAbono = (viaje) => {
    setViajeAbono(viaje);
    setMontoAbono('');
    setFechaAbono(hoy());
  };

  const confirmarAbono = async () => {
    if (!montoAbono || Number(montoAbono) <= 0) return alert('Ingresa un monto válido');
    try {
      await api.put(`/viajes/${viajeAbono.ViajeId}/abono`, {
        monto: Number(montoAbono),
        fechaAbono,
      });
      setViajeAbono(null);
      cargar();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al registrar el abono');
    }
  };

  const verHistorial = async (viaje) => {
    const res = await api.get(`/viajes/${viaje.ViajeId}/abonos`);
    setHistorial(res.data);
    setHistorialViajeId(viaje.ViajeId);
  };

  return (
    <div>
      <h2>Registrar Viaje</h2>
      <form className="form-panel" onSubmit={guardar}>
        <label>Fecha</label>
        <input type="date" required value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} />
        <label>Destino</label>
        <input required value={form.destino} onChange={(e) => setForm({ ...form, destino: e.target.value })} />
        <label>Monto</label>
        <input type="number" step="0.01" required value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} />
        <label>Pago parcial (opcional)</label>
        <input type="number" step="0.01" value={form.montoPagado} onChange={(e) => setForm({ ...form, montoPagado: e.target.value })} />

        <div style={{ background: '#e2e8f0', padding: 10, borderRadius: 6, marginBottom: 10 }}>
          <p>Monto: ₡{Number(form.precio || 0).toFixed(2)}</p>
          <p>IVA (13%): ₡{ivaCalculado.toFixed(2)}</p>
          <p>Saldo pendiente: ₡{saldoCalculado.toFixed(2)}</p>
        </div>

        <button className="btn-primario" type="submit">Agregar Viaje</button>
      </form>

      <SearchBar onBuscar={buscarDesdeCero} placeholder="Buscar por destino o estado..." />

      <table className="crud-table">
        <thead>
          <tr>
            <th>Fecha</th><th>Destino</th><th>Monto</th><th>IVA</th>
            <th>Pagado</th><th>Saldo</th><th>Estado</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {viajes.map((v) => (
            <tr key={v.ViajeId}>
              <td>{v.Fecha?.substring(0, 10)}</td>
              <td>{v.Destino}</td>
              <td>₡{v.Precio}</td>
              <td>₡{v.Iva}</td>
              <td>₡{v.MontoPagado}</td>
              <td>₡{v.SaldoPendiente}</td>
              <td>{v.Estado}</td>
              <td>
                {v.Estado === 'Pendiente' && (
                  <button className="btn-editar" onClick={() => abrirPanelAbono(v)}>Abonar</button>
                )}
                <button className="btn-editar" onClick={() => verHistorial(v)}>Historial</button>
                <button className="btn-eliminar" onClick={() => eliminar(v)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Pagination pagina={pagina} totalPaginas={totalPaginas} onCambiar={setPagina} />

      {viajeAbono && (
        <div className="form-panel" style={{ marginTop: 15 }}>
          <h3>Registrar abono — {viajeAbono.Destino}</h3>
          <p>Saldo pendiente actual: ₡{viajeAbono.SaldoPendiente}</p>
          <label>Monto del abono</label>
          <input type="number" step="0.01" value={montoAbono} onChange={(e) => setMontoAbono(e.target.value)} />
          <label>Fecha del abono</label>
          <input type="date" value={fechaAbono} onChange={(e) => setFechaAbono(e.target.value)} />
          <button className="btn-primario" onClick={confirmarAbono}>Confirmar Abono</button>
          <button type="button" onClick={() => setViajeAbono(null)}>Cancelar</button>
        </div>
      )}

      {historialViajeId && (
        <div className="form-panel" style={{ marginTop: 15 }}>
          <h3>Historial de abonos</h3>
          {historial.length === 0 ? (
            <p>Aún no hay abonos registrados para este viaje.</p>
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
          <button type="button" onClick={() => setHistorialViajeId(null)}>Cerrar</button>
        </div>
      )}
    </div>
  );
}