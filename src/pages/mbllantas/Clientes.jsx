import { useEffect, useState } from 'react';
import api from '../../services/api';
import CrudTable from '../../components/CrudTable';
import SearchBar from '../../components/SearchBar';
import Pagination from '../../components/Pagination';

const vacio = { nombre: '', empresa: '', direccion: '', telefono: '' };
const LIMITE = 10;

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState(vacio);
  const [editandoId, setEditandoId] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  const cargar = async (buscar = busqueda, paginaSolicitada = pagina) => {
    const res = await api.get('/clientes', {
      params: { buscar, pagina: paginaSolicitada, limite: LIMITE },
    });
    setClientes(res.data.datos);
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
    if (editandoId) {
      await api.put(`/clientes/${editandoId}`, form);
    } else {
      await api.post('/clientes', form);
    }
    setForm(vacio);
    setEditandoId(null);
    cargar();
  };

  const editar = (cliente) => {
    setForm({
      nombre: cliente.Nombre,
      empresa: cliente.Empresa || '',
      direccion: cliente.Direccion || '',
      telefono: cliente.Telefono || '',
    });
    setEditandoId(cliente.ClienteId);
  };

  const eliminar = async (cliente) => {
    if (!confirm(`¿Eliminar a ${cliente.Nombre}?`)) return;
    try {
      await api.delete(`/clientes/${cliente.ClienteId}`);
      cargar();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar');
    }
  };

  return (
    <div>
      <h2>Clientes</h2>
      <form className="form-panel" onSubmit={guardar}>
        <label>Nombre</label>
        <input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
        <label>Empresa</label>
        <input value={form.empresa} onChange={(e) => setForm({ ...form, empresa: e.target.value })} />
        <label>Dirección</label>
        <input value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
        <label>Teléfono</label>
        <input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
        <button className="btn-primario" type="submit">{editandoId ? 'Actualizar' : 'Agregar'} Cliente</button>
        {editandoId && (
          <button type="button" onClick={() => { setForm(vacio); setEditandoId(null); }}>Cancelar</button>
        )}
      </form>

      <SearchBar onBuscar={buscarDesdeCero} placeholder="Buscar por nombre, empresa o teléfono..." />

      <CrudTable
        columnas={[
          { key: 'Nombre', label: 'Nombre' },
          { key: 'Empresa', label: 'Empresa' },
          { key: 'Direccion', label: 'Dirección' },
          { key: 'Telefono', label: 'Teléfono' },
        ]}
        datos={clientes}
        onEditar={editar}
        onEliminar={eliminar}
      />

      <Pagination pagina={pagina} totalPaginas={totalPaginas} onCambiar={setPagina} />
    </div>
  );
}