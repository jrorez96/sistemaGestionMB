import { useState } from 'react';
import api from '../../services/api';

export default function ReporteViajes() {
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [reporte, setReporte] = useState(null);

  const buscar = async () => {
    if (!desde || !hasta) return alert('Selecciona el rango de fechas');
    const res = await api.get(`/reportes/viajes?desde=${desde}&hasta=${hasta}`);
    setReporte(res.data);
  };

  return (
    <div>
      <h2>Reporte de Viajes</h2>
      <div className="form-panel">
        <label>Desde</label>
        <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
        <label>Hasta</label>
        <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
        <button className="btn-primario" onClick={buscar}>Generar Reporte</button>
      </div>

      {reporte && (
        <>
          <div className="form-panel">Total en viajes (con IVA): <strong>₡{reporte.totalViajes}</strong></div>
          <table className="crud-table">
            <thead><tr><th>Fecha</th><th>Destino</th><th>Precio</th><th>Total</th></tr></thead>
            <tbody>
              {reporte.viajes.map((v) => (
                <tr key={v.ViajeId}>
                  <td>{v.Fecha?.substring(0, 10)}</td>
                  <td>{v.Destino}</td>
                  <td>₡{v.Precio}</td>
                  <td>₡{v.Total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}