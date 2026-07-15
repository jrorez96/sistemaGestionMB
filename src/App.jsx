import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ModuloLayout from './components/ModuloLayout';

import Clientes from './pages/mbllantas/Clientes';
import Llantas from './pages/mbllantas/Llantas';
import Ventas from './pages/mbllantas/Ventas';
import ReporteVentas from './pages/mbllantas/ReporteVentas';

import RegistrarViaje from './pages/transportes/RegistrarViaje';
import ReporteViajes from './pages/transportes/ReporteViajes';

import RegistroFacturas from './pages/facturas/RegistroFacturas';
import ReporteFacturas from './pages/facturas/ReporteFacturas';

import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <Routes>
          <Route path="/" element={<Navigate to="/mb-llantas" />} />

          <Route
            path="/mb-llantas"
            element={<ModuloLayout titulo="MB Llantas" tabs={[
              { nombre: 'Clientes', ruta: '/mb-llantas/clientes' },
              { nombre: 'Llantas', ruta: '/mb-llantas/llantas' },
              { nombre: 'Ventas', ruta: '/mb-llantas/ventas' },
              { nombre: 'Reporte', ruta: '/mb-llantas/reporte' },
            ]} />}
          >
            <Route index element={<Navigate to="clientes" />} />
            <Route path="clientes" element={<Clientes />} />
            <Route path="llantas" element={<Llantas />} />
            <Route path="ventas" element={<Ventas />} />
            <Route path="reporte" element={<ReporteVentas />} />
          </Route>

          <Route
            path="/transportes"
            element={<ModuloLayout titulo="Transportes Bolaños Alfaro" tabs={[
              { nombre: 'Registrar Viaje', ruta: '/transportes/registrar' },
              { nombre: 'Reporte de Viajes', ruta: '/transportes/reporte' },
            ]} />}
          >
            <Route index element={<Navigate to="registrar" />} />
            <Route path="registrar" element={<RegistrarViaje />} />
            <Route path="reporte" element={<ReporteViajes />} />
          </Route>

          <Route
            path="/facturas"
            element={<ModuloLayout titulo="Facturas" tabs={[
              { nombre: 'Registro', ruta: '/facturas/registro' },
              { nombre: 'Reporte', ruta: '/facturas/reporte' },
            ]} />}
          >
            <Route index element={<Navigate to="registro" />} />
            <Route path="registro" element={<RegistroFacturas />} />
            <Route path="reporte" element={<ReporteFacturas />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;