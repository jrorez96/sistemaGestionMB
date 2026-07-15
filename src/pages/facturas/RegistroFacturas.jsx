import { useEffect, useState } from 'react';
import api from '../../services/api';
import SearchBar from '../../components/SearchBar';
import Pagination from '../../components/Pagination';

const vacio = { nombre: '', fecha: '', monto: '', porcentajeIva: 13, montoPagado: 0 };
const LIMITE = 10;

export default function RegistroFacturas() {
  const [facturas, setFacturas] = useState([]);
  const [form, setForm] = useState(vacio);
  const [editandoId, setEditandoId] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  const cargar = async (buscar = busqueda, paginaSolicitada = pagina) => {
    const res = await api.get('/facturas', {
      params: { buscar, pagina: paginaSolicitada, limite: LIMITE },
    });
    setFacturas(res.data.datos);
    setTotalPaginas(res.data.totalPaginas);
  };

  useEffect(() => { cargar(busqueda, pagina); }, [pagina]);

  const buscarDesdeCero = (texto) => {
    setBusqueda(texto);
    setPagina(1);
    cargar(texto, 1);
  };

  const totalCalculado =
    Number(form.monto || 0) + (Number(form.monto || 0) * Number(form.porcentajeIva || 0)) / 100;
  const saldoCalculado = totalCalculado - Number(form.montoPagado || 0);

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

  const registrarAbono = async (factura) => {
    const monto = prompt(`Saldo pendiente actual: ₡${factura.SaldoPendiente}\n¿Cuánto abona?`);
    if (!monto) return;
    try {
      await api.put(`/facturas/${factura.FacturaId}/abono`, { monto: Number(monto) });
      cargar();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al registrar el abono');
    }
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
            <label>Pago parcial (opcional)</label>
            <input type="number" step="0.01" value={form.montoPagado} onChange={(e) => setForm({ ...form, montoPagado: e.target.value })} />
          </>
        )}

        <div style={{ background: '#e2e8f0', padding: 10, borderRadius: 6, marginBottom: 10 }}>
          <p><strong>Total: ₡{totalCalculado.toFixed(2)}</strong></p>
          {!editandoId && <p>Saldo pendiente: ₡{saldoCalculado.toFixed(2)}</p>}
        </div>

        <button className="btn-primario" type="submit">{editandoId ? 'Actualizar' : 'Agregar'} Factura</button>
        {editandoId && <button type="button" onClick={() => { setForm(vacio); setEditandoId(null); }}>Cancelar</button>}
      </form>

      <SearchBar onBuscar={buscarDesdeCero} placeholder="Buscar por nombre o estado..." />

      <table className="crud-table">
        <thead>
          <tr>
            <th>Nombre</th><th>Fecha</th><th>Monto</th><th>% IVA</th><th>Total</th><th>Pagado</th><th>Saldo</th><th>Estado</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {facturas.map((f) => (
            <tr key={f.FacturaId}>
              <td>{f.Nombre}</td>
              <td>{f.Fecha?.substring(0, 10)}</td>
              <td>₡{f.Monto}</td>
              <td>{f.PorcentajeIva}%</td>
              <td>₡{f.Total}</td>
              <td>₡{f.MontoPagado}</td>
              <td>₡{f.SaldoPendiente}</td>
              <td>{f.Estado}</td>
              <td>
                <button className="btn-editar" onClick={() => editar(f)}>Editar</button>
                {f.Estado === 'Pendiente' && (
                  <button className="btn-editar" onClick={() => registrarAbono(f)}>Abonar</button>
                )}
                <button className="btn-eliminar" onClick={() => eliminar(f)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Pagination pagina={pagina} totalPaginas={totalPaginas} onCambiar={setPagina} />
    </div>
  );
}