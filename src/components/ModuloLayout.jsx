import { NavLink, Outlet } from 'react-router-dom';
import './ModuloLayout.css';

export default function ModuloLayout({ titulo, tabs }) {
  return (
    <div className="modulo-container">
      <div className="topmenu">
        <h3>{titulo}</h3>
        <div className="tabs">
          {tabs.map((tab) => (
            <NavLink
              key={tab.ruta}
              to={tab.ruta}
              className={({ isActive }) => 'tab-btn' + (isActive ? ' activo' : '')}
            >
              {tab.nombre}
            </NavLink>
          ))}
        </div>
      </div>
      <div className="modulo-contenido">
        <Outlet />
      </div>
    </div>
  );
}