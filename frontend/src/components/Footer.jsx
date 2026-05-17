import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="public-footer">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4">
            <div className="footer-brand">
              <i className="bi bi-car-front-fill"></i>
              <span>MM Motors</span>
            </div>
            <p className="footer-desc">
              Sua concessionária de confiança. Qualidade e excelência em veículos novos e seminovos.
            </p>
            <div className="footer-social">
              <a href="#" className="social-link"><i className="bi bi-instagram"></i></a>
              <a href="#" className="social-link"><i className="bi bi-facebook"></i></a>
              <a href="#" className="social-link"><i className="bi bi-whatsapp"></i></a>
              <a href="#" className="social-link"><i className="bi bi-youtube"></i></a>
            </div>
          </div>

          <div className="col-lg-2 col-md-4">
            <h6 className="footer-title">Links Rápidos</h6>
            <ul className="footer-links">
              <li><a href="#home">Início</a></li>
              <li><a href="#veiculos">Veículos</a></li>
              <li><a href="#sobre">Sobre</a></li>
              <li><a href="#contato">Contato</a></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-4">
            <h6 className="footer-title">Para Clientes</h6>
            <ul className="footer-links">
              <li><Link to="/login">Minha Conta</Link></li>
              <li><Link to="/cadastro">Cadastre-se</Link></li>
              <li><a href="#veiculos">Ver Veículos</a></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-4">
            <h6 className="footer-title">Contato</h6>
            <ul className="footer-links">
              <li><i className="bi bi-telephone me-2"></i>(11) 3000-0001</li>
              <li><i className="bi bi-envelope me-2"></i>contato@mmmotors.com</li>
              <li><i className="bi bi-geo-alt me-2"></i>Av. Paulista, 1000 - São Paulo, SP</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} MM Motors. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
