import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar({ onToggleSidebar }) {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <header className="navbar-custom">
      <button className="navbar-toggle-btn" onClick={onToggleSidebar} title="Menu">
        <i className="bi bi-list"></i>
      </button>

      <a className="navbar-brand fw-bold text-light text-decoration-none d-flex align-items-center gap-2" href="/admin">
        <i className="bi bi-car-front-fill text-primary"></i>
        <span className="d-none d-sm-inline">MM Motors</span>
      </a>

      <div className="ms-auto d-flex align-items-center gap-2">
        <span className="text-light d-flex align-items-center gap-1 small">
          <i className="bi bi-person-circle"></i>
          <span className="d-none d-md-inline">{usuario?.nome || 'Usuário'}</span>
          {usuario?.cargo && (
            <span className={`badge ms-1 ${usuario.cargo === 'admin' ? 'bg-warning text-dark' : 'bg-info'}`}>
              {usuario.cargo}
            </span>
          )}
        </span>
        <button className="btn btn-outline-light btn-sm" onClick={handleLogout} title="Sair">
          <i className="bi bi-box-arrow-right"></i>
        </button>
      </div>
    </header>
  );
}
