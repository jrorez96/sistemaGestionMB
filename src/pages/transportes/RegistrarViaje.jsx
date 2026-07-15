import { useEffect, useState } from 'react';
import api from '../../services/api';
import CrudTable from '../../components/CrudTable';
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
        <label>Precio</label>
        <input type="number" step="0.01" required value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} />
        <button className="btn-primario" type="submit">{editandoId ? 'Actualizar' : 'Agregar'} Viaje</button>
        {editandoId && <button type="button" onClick={() => { setForm(vacio); setEditandoId(null); }}>Cancelar</button>}
      </form>

      <SearchBar onBuscar={buscarDesdeCero} placeholder="Buscar por destino..." />

      <CrudTable
        columnas={[
          { key: 'Fecha', label: 'Fecha', render: (f) => f.Fecha?.substring(0, 10) },
          { key: 'Destino', label: 'Destino' },
          { key: 'Precio', label: 'Precio' },
        ]}
        datos={viajes}
        onEditar={editar}
        onEliminar={eliminar}
      />

      <Pagination pagina={pagina} totalPaginas={totalPaginas} onCambiar={setPagina} />
    </div>
  );
}