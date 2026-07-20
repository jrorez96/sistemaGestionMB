import { useEffect, useState } from 'react';
import api from '../../services/api';
import CrudTable from '../../components/CrudTable';
import SearchBar from '../../components/SearchBar';
import Pagination from '../../components/Pagination';

const vacio = {
  marca: '', perfil: '', taco: '', medida: '', cantidad: '',
  precioCompra: '', precioVentaContado: '', precioVentaCredito: '',
};
const LIMITE = 10;

export default function Llantas() {
  const [llantas, setLlantas] = useState([]);
  const [form, setForm] = useState(vacio);
  const [editandoId, setEditandoId] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  const cargar = async (buscar = busqueda, paginaSolicitada = pagina) => {
    const res = await api.get('/llantas', {
      params: { buscar, pagina: paginaSolicitada, limite: LIMITE },
    });
    setLlantas(res.data.datos);
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
    const payload = {
      ...form,
      cantidad: Number(form.cantidad),
      precioCompra: Number(form.precioCompra),
      precioVentaContado: Number(form.precioVentaContado),
      precioVentaCredito: Number(form.precioVentaCredito),
    };
    if (editandoId) {
      await api.put(`/llantas/${editandoId}`, payload);
    } else {
      await api.post('/llantas', payload);
    }
    setForm(vacio);
    setEditandoId(null);
    cargar();
  };

  const editar = (llanta) => {
    setForm({
      marca: llanta.Marca,
      perfil: llanta.Perfil,
      taco: llanta.Taco,
      medida: llanta.Medida,
      cantidad: llanta.Cantidad,
      precioCompra: llanta.PrecioCompra,
      precioVentaContado: llanta.PrecioVentaContado,
      precioVentaCredito: llanta.PrecioVentaCredito,
    });
    setEditandoId(llanta.LlantaId);
  };

  const eliminar = async (llanta) => {
    if (!confirm(`¿Eliminar ${llanta.Marca} ${llanta.Medida}?`)) return;
    try {
      await api.delete(`/llantas/${llanta.LlantaId}`);
      cargar();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar');
    }
  };

  return (
    <div>
      <h2>Llantas</h2>
      <form className="form-panel" onSubmit={guardar}>
        <label>Marca</label>
        <input required value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })} />
        <label>Perfil</label>
        <input required value={form.perfil} onChange={(e) => setForm({ ...form, perfil: e.target.value })} />
        <label>Taco</label>
        <input required value={form.taco} onChange={(e) => setForm({ ...form, taco: e.target.value })} />
        <label>Medida</label>
        <input required value={form.medida} onChange={(e) => setForm({ ...form, medida: e.target.value })} />
        <label>Cantidad en stock</label>
        <input type="number" required value={form.cantidad} onChange={(e) => setForm({ ...form, cantidad: e.target.value })} />
        <label>Precio Compra</label>
        <input type="number" step="0.01" required value={form.precioCompra} onChange={(e) => setForm({ ...form, precioCompra: e.target.value })} />
        <label>Precio Venta de Contado</label>
        <input type="number" step="0.01" required value={form.precioVentaContado} onChange={(e) => setForm({ ...form, precioVentaContado: e.target.value })} />
        <label>Precio Venta a Crédito</label>
        <input type="number" step="0.01" required value={form.precioVentaCredito} onChange={(e) => setForm({ ...form, precioVentaCredito: e.target.value })} />
        <button className="btn-primario" type="submit">{editandoId ? 'Actualizar' : 'Agregar'} Llanta</button>
        {editandoId && (
          <button type="button" onClick={() => { setForm(vacio); setEditandoId(null); }}>Cancelar</button>
        )}
      </form>

      <SearchBar onBuscar={buscarDesdeCero} placeholder="Buscar por marca, medida, perfil o taco..." />

      <CrudTable
        columnas={[
          { key: 'Marca', label: 'Marca' },
          { key: 'Perfil', label: 'Perfil' },
          { key: 'Taco', label: 'Taco' },
          { key: 'Medida', label: 'Medida' },
          { key: 'Cantidad', label: 'Stock' },
          { key: 'PrecioCompra', label: 'P. Compra' },
          { key: 'PrecioVentaContado', label: 'P. Venta Contado' },
          { key: 'PrecioVentaCredito', label: 'P. Venta Crédito' },
        ]}
        datos={llantas}
        onEditar={editar}
        onEliminar={eliminar}
      />

      <Pagination pagina={pagina} totalPaginas={totalPaginas} onCambiar={setPagina} />
    </div>
  );
}