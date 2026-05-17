import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 50);
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const links = [
    { href: '#home', label: 'Início' },
    { href: '#sobre', label: 'Sobre' },
    { href: '#veiculos', label: 'Veículos' },
    { href: '#beneficios', label: 'Benefícios' },
    { href: '#contato', label: 'Contato' }
  ];

  return (
    <nav className={`public-navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <div className="public-navbar-inner">
          <Link to="/" className="public-navbar-brand">
            <i className="bi bi-car-front-fill"></i>
            <span>MM Motors</span>
          </Link>

          <button
            className={`public-navbar-toggler ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <div className={`public-navbar-collapse ${menuOpen ? 'show' : ''}`}>
            <div className="public-navbar-links">
              {links.map(link => (
                <a key={link.href} href={link.href} className="public-navbar-link">
                  {link.label}
                </a>
              ))}
            </div>
            <div className="public-navbar-actions">
              <Link to="/cadastro" className="btn btn-outline-light btn-sm">
                <i className="bi bi-person-plus me-1"></i>
                Cadastro
              </Link>
              <Link to="/login" className="btn btn-primary btn-sm">
                <i className="bi bi-box-arrow-in-right me-1"></i>
                Entrar
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
