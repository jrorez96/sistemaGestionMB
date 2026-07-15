import { useState } from 'react';
import api from '../../services/api';

export default function ReporteVentas() {
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [reporte, setReporte] = useState(null);

  const buscar = async () => {
    if (!desde || !hasta) return alert('Selecciona el rango de fechas');
    const res = await api.get(`/reportes/ventas?desde=${desde}&hasta=${hasta}`);
    setReporte(res.data);
  };

  return (
    <div>
      <h2>Reporte de Ventas</h2>
      <div className="form-panel">
        <label>Desde</label>
        <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
        <label>Hasta</label>
        <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
        <button className="btn-primario" onClick={buscar}>Generar Reporte</button>
      </div>

      {reporte && (
        <>
          <div style={{ display: 'flex', gap: 20, marginBottom: 15 }}>
            <div className="form-panel">Total Vendido: <strong>₡{reporte.totalVendido}</strong></div>
            <div className="form-panel">Total Pendiente de Cobro: <strong>₡{reporte.totalPendiente}</strong></div>
          </div>
          <table className="crud-table">
            <thead>
              <tr><th>Fecha</th><th>Cliente</th><th>Llanta</th><th>Cant.</th><th>Total</th><th>Saldo</th><th>Estado</th></tr>
            </thead>
            <tbody>
              {reporte.ventas.map((v) => (
                <tr key={v.VentaId}>
                  <td>{v.FechaVenta?.substring(0, 10)}</td>
                  <td>{v.ClienteNombre}</td>
                  <td>{v.Marca} {v.Medida}</td>
                  <td>{v.Cantidad}</td>
                  <td>₡{v.Total}</td>
                  <td>₡{v.SaldoPendiente}</td>
                  <td>{v.Estado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}