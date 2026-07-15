import { NavLink } from 'react-router-dom';
import mbLogo from '../assets/mb-llantas-logo.png';
import transportesLogo from '../assets/bolanos-alfaro-logo.jpeg';
import './Sidebar.css';

const modulos = [
  { nombre: 'MB Llantas', ruta: '/mb-llantas', logo: mbLogo },
  { nombre: 'Transportes Bolaños Alfaro', ruta: '/transportes', logo: transportesLogo },
  { nombre: 'Facturas', ruta: '/facturas', logo: null },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">Sistema Gestión</h2>
      <nav>
        {modulos.map((m) => (
          <NavLink
            key={m.ruta}
            to={m.ruta}
            className={({ isActive }) => 'sidebar-btn' + (isActive ? ' activo' : '')}
          >
            {m.logo ? (
              <img src={m.logo} alt={m.nombre} className="sidebar-logo" />
            ) : (
              <span>{m.nombre}</span>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}