import { useEffect, useState } from 'react';
import api from '../../services/api';
import SearchBar from '../../components/SearchBar';
import Pagination from '../../components/Pagination';

const vacio = { fecha: '', destino: '', precio: '' };
const LIMITE = 10;

export default function RegistrarViaje() {
  const [viajes, setViajes] = useState([]);
  const [form, setForm] = useState(vacio);
  const [editandoId, setEditandoId] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

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

  // Vista previa del total con IVA (13% fijo) mientras se digita
  const totalConIva = Number(form.precio || 0) * 1.13;

  const guardar = async (e) => {
    e.preventDefault();
    const payload = { ...form, precio: Number(form.precio) };
    if (editandoId) {
      await api.put(`/viajes/${editandoId}`, payload);
    } else {
      await api.post('/viajes', payload);
    }
    setForm(vacio);
    setEditandoId(null);
    cargar();
  };

  const editar = (viaje) => {
    setForm({ fecha: viaje.Fecha?.substring(0, 10), destino: viaje.Destino, precio: viaje.Precio });
    setEditandoId(viaje.ViajeId);
  };

  const eliminar = async (viaje) => {
    if (!confirm(`¿Eliminar viaje a ${viaje.Destino}?`)) return;
    await api.delete(`/viajes/${viaje.ViajeId}`);
    cargar();
  };

  return (
    <div>
      <h2>Registrar Viaje</h2>
      <form className="form-panel" onSubmit={guardar}>
        <label>Fecha</label>
        <input type="date" required value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} />
        <label>Destino</label>
        <input required value={form.destino} onChange={(e) => setForm({ ...form, destino: e.target.value })} />
        <label>Precio (sin IVA)</label>
        <input type="number" step="0.01" required value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} />

        <div style={{ background: '#e2e8f0', padding: 10, borderRadius: 6, marginBottom: 10 }}>
          <p><strong>Total con IVA (13%): ₡{totalConIva.toFixed(2)}</strong></p>
        </div>

        <button className="btn-primario" type="submit">{editandoId ? 'Actualizar' : 'Agregar'} Viaje</button>
        {editandoId && <button type="button" onClick={() => { setForm(vacio); setEditandoId(null); }}>Cancelar</button>}
      </form>

      <SearchBar onBuscar={buscarDesdeCero} placeholder="Buscar por destino..." />

      <table className="crud-table">
        <thead>
          <tr><th>Fecha</th><th>Destino</th><th>Precio</th><th>Total (con IVA)</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {viajes.map((v) => (
            <tr key={v.ViajeId}>
              <td>{v.Fecha?.substring(0, 10)}</td>
              <td>{v.Destino}</td>
              <td>₡{v.Precio}</td>
              <td>₡{v.Total}</td>
              <td>
                <button className="btn-editar" onClick={() => editar(v)}>Editar</button>
                <button className="btn-eliminar" onClick={() => eliminar(v)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Pagination pagina={pagina} totalPaginas={totalPaginas} onCambiar={setPagina} />
    </div>
  );
}