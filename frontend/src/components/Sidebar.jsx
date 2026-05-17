import { NavLink } from 'react-router-dom';

const menuItems = [
  { path: '/admin',          label: 'Dashboard',        icon: 'bi-speedometer2' },
  { path: '/admin/relatorios', label: 'Relatórios',       icon: 'bi-file-earmark-bar-graph' },
  { path: '/admin/veiculos',   label: 'Veículos',         icon: 'bi-car-front' },
  { path: '/admin/clientes',   label: 'Clientes',         icon: 'bi-people' },
  { path: '/admin/vendedores', label: 'Vendedores',       icon: 'bi-person-badge' },
  { path: '/admin/vendas',     label: 'Vendas',           icon: 'bi-cash-coin' },
  { path: '/admin/concessionarias', label: 'Concessionárias', icon: 'bi-building' },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <i className="bi bi-car-front-fill fs-4 text-primary"></i>
          <h5>MM Motors</h5>
          <button className="sidebar-close-btn ms-auto" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul className="nav flex-column">
            {menuItems.map(item => (
              <li className="nav-item" key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === '/'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `sidebar-link${isActive ? ' active' : ''}`
                  }
                >
                  <i className={`bi ${item.icon}`}></i>
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <small className="text-secondary">MM Motors v1.0.0</small>
        </div>
      </aside>
    </>
  );
}
