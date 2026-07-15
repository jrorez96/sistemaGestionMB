import { useEffect, useState } from 'react';
import api from '../../services/api';
import SearchBar from '../../components/SearchBar';
import Pagination from '../../components/Pagination';

const LIMITE = 10;

export default function Ventas() {
  const [ventas, setVentas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [llantas, setLlantas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  const [clienteId, setClienteId] = useState('');
  const [llantaId, setLlantaId] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [porcentajeIva, setPorcentajeIva] = useState(13);
  const [montoPagado, setMontoPagado] = useState(0);

  const cargarVentas = async (buscar = busqueda, paginaSolicitada = pagina) => {
    const res = await api.get('/ventas', {
      params: { buscar, pagina: paginaSolicitada, limite: LIMITE },
    });
    setVentas(res.data.datos);
    setTotalPaginas(res.data.totalPaginas);
  };

  const cargarListas = async () => {
    const [c, l] = await Promise.all([api.get('/clientes'), api.get('/llantas')]);
    // Para los selects de cliente/llanta traemos todo (sin paginar) usando un límite alto
    setClientes(c.data.datos ?? c.data);
    setLlantas(l.data.datos ?? l.data);
  };

  useEffect(() => { cargarListas(); }, []);
  useEffect(() => { cargarVentas(busqueda, pagina); }, [pagina]);

  const buscarDesdeCero = (texto) => {
    setBusqueda(texto);
    setPagina(1);
    cargarVentas(texto, 1);
  };

  const llantaSeleccionada = llantas.find((l) => l.LlantaId === Number(llantaId));
  const precioUnitario = llantaSeleccionada?.PrecioVenta || 0;
  const subtotal = cantidad * precioUnitario;
  const total = subtotal + (subtotal * porcentajeIva) / 100;
  const saldoPendiente = total - Number(montoPagado || 0);

  const registrarVenta = async (e) => {
    e.preventDefault();
    try {
      await api.post('/ventas', {
        clienteId: Number(clienteId),
        llantaId: Number(llantaId),
        cantidad: Number(cantidad),
        porcentajeIva: Number(porcentajeIva),
        montoPagado: Number(montoPagado),
      });
      setClienteId(''); setLlantaId(''); setCantidad(1); setPorcentajeIva(13); setMontoPagado(0);
      cargarVentas();
      cargarListas(); // refresca el stock mostrado en el select
    } catch (err) {
      alert(err.response?.data?.error || 'Error al registrar la venta');
    }
  };

  const registrarAbono = async (venta) => {
    const monto = prompt(`Saldo pendiente actual: ${venta.SaldoPendiente}\n¿Cuánto abona?`);
    if (!monto) return;
    try {
      await api.put(`/ventas/${venta.VentaId}/abono`, { monto: Number(monto) });
      cargarVentas();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al registrar el abono');
    }
  };

  return (
    <div>
      <h2>Ventas</h2>
      <form className="form-panel" onSubmit={registrarVenta}>
        <label>Cliente</label>
        <select required value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
          <option value="">-- Seleccione --</option>
          {clientes.map((c) => (
            <option key={c.ClienteId} value={c.ClienteId}>{c.Nombre}</option>
          ))}
        </select>

        <label>Tipo de Llanta</label>
        <select required value={llantaId} onChange={(e) => setLlantaId(e.target.value)}>
          <option value="">-- Seleccione --</option>
          {llantas.map((l) => (
            <option key={l.LlantaId} value={l.LlantaId}>
              {l.Marca} {l.Medida} (Stock: {l.Cantidad}) — ₡{l.PrecioVenta}
            </option>
          ))}
        </select>

        <label>Cantidad</label>
        <input type="number" min="1" value={cantidad} onChange={(e) => setCantidad(e.target.value)} />

        <label>IVA (%)</label>
        <input type="number" step="0.01" value={porcentajeIva} onChange={(e) => setPorcentajeIva(e.target.value)} />

        <label>Pago parcial (opcional)</label>
        <input type="number" step="0.01" value={montoPagado} onChange={(e) => setMontoPagado(e.target.value)} />

        <div style={{ background: '#e2e8f0', padding: 10, borderRadius: 6, marginBottom: 10 }}>
          <p>Subtotal: ₡{subtotal.toFixed(2)}</p>
          <p><strong>Total: ₡{total.toFixed(2)}</strong></p>
          <p>Saldo pendiente: ₡{saldoPendiente.toFixed(2)}</p>
        </div>

        <button className="btn-primario" type="submit">Registrar Venta</button>
      </form>

      <SearchBar onBuscar={buscarDesdeCero} placeholder="Buscar por cliente, marca o estado..." />

      <table className="crud-table">
        <thead>
          <tr>
            <th>Cliente</th><th>Llanta</th><th>Cant.</th><th>Total</th><th>Pagado</th><th>Saldo</th><th>Estado</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ventas.map((v) => (
            <tr key={v.VentaId}>
              <td>{v.ClienteNombre}</td>
              <td>{v.Marca} {v.Medida}</td>
              <td>{v.Cantidad}</td>
              <td>₡{v.Total}</td>
              <td>₡{v.MontoPagado}</td>
              <td>₡{v.SaldoPendiente}</td>
              <td>{v.Estado}</td>
              <td>
                {v.Estado === 'Pendiente' && (
                  <button className="btn-editar" onClick={() => registrarAbono(v)}>Abonar</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Pagination pagina={pagina} totalPaginas={totalPaginas} onCambiar={setPagina} />
    </div>
  );
}