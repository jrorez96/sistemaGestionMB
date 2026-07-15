import { useState } from 'react';
import api from '../../services/api';

export default function ReporteFacturas() {
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [reporte, setReporte] = useState(null);

  const buscar = async () => {
    if (!desde || !hasta) return alert('Selecciona el rango de fechas');
    const res = await api.get(`/reportes/facturas?desde=${desde}&hasta=${hasta}`);
    setReporte(res.data);
  };

  return (
    <div>
      <h2>Reporte de Facturas</h2>
      <div className="form-panel">
        <label>Desde</label>
        <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
        <label>Hasta</label>
        <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
        <button className="btn-primario" onClick={buscar}>Generar Reporte</button>
      </div>

      {reporte && (
        <>
          <div className="form-panel">Total Facturado: <strong>₡{reporte.totalFacturado}</strong></div>
          <table className="crud-table">
            <thead><tr><th>Fecha</th><th>Monto</th><th>% IVA</th><th>Total</th></tr></thead>
            <tbody>
              {reporte.facturas.map((f) => (
                <tr key={f.FacturaId}>
                  <td>{f.Fecha?.substring(0, 10)}</td>
                  <td>₡{f.Monto}</td>
                  <td>{f.PorcentajeIva}%</td>
                  <td>₡{f.Total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}