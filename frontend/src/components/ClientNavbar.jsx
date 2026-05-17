import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ClientNavbar() {
  const { usuario, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleLogout() {
    logout();
    navigate('/');
  }

  const navLinks = [
    { path: '/cliente/dashboard', label: 'Dashboard', icon: 'bi-speedometer2' },
    { path: '/cliente/favoritos', label: 'Favoritos', icon: 'bi-heart' },
    { path: '/cliente/perfil', label: 'Perfil', icon: 'bi-person' }
  ];

  return (
    <nav className="client-navbar">
      <div className="container">
        <div className="client-navbar-inner">
          <Link to="/cliente/dashboard" className="client-navbar-brand">
            <i className="bi bi-car-front-fill"></i>
            <span>MM Motors</span>
          </Link>

          <button
            className={`client-navbar-toggler ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <div className={`client-navbar-collapse ${menuOpen ? 'show' : ''}`}>
            <div className="client-navbar-links">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`client-nav-link ${location.pathname === link.path ? 'active' : ''}`}
                >
                  <i className={`bi ${link.icon} me-1`}></i>
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="client-navbar-user" ref={dropdownRef}>
              <button
                className="client-user-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <i className="bi bi-person-circle me-2"></i>
                <span className="client-user-name">{usuario?.nome}</span>
                <i className={`bi bi-chevron-${dropdownOpen ? 'up' : 'down'} ms-1`}></i>
              </button>
              {dropdownOpen && (
                <div className="client-dropdown-menu">
                  <Link to="/cliente/perfil" className="dropdown-item">
                    <i className="bi bi-person me-2"></i>Meu Perfil
                  </Link>
                  <Link to="/cliente/favoritos" className="dropdown-item">
                    <i className="bi bi-heart me-2"></i>Favoritos
                  </Link>
                  <div className="dropdown-divider"></div>
                  <Link to="/" className="dropdown-item">
                    <i className="bi bi-house me-2"></i>Site Institucional
                  </Link>
                  <button className="dropdown-item text-danger" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-2"></i>Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
