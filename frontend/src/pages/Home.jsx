import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [destaques, setDestaques] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/veiculos/destaque')
      .then(res => res.json())
      .then(data => setDestaques(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function formatPreco(value) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  return (
    <div className="home-page">
      {/* HERO */}
      <section id="home" className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-bg"></div>
        <div className="container hero-content">
          <div className="hero-badge">
            <i className="bi bi-star-fill me-1"></i>
            Concessionária Premium
          </div>
          <h1 className="hero-title">
            Encontre o Carro<br />
            <span className="text-primary">dos Seus Sonhos</span>
          </h1>
          <p className="hero-subtitle">
            Qualidade, procedência e as melhores condições para você sair dirigindo hoje mesmo.
          </p>
          <div className="hero-actions">
            <a href="#veiculos" className="btn btn-primary btn-lg hero-btn">
              <i className="bi bi-search me-2"></i>
              Ver Veículos
            </a>
            <Link to="/login" className="btn btn-outline-light btn-lg hero-btn">
              <i className="bi bi-box-arrow-in-right me-2"></i>
              Entrar
            </Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-value">500+</span>
              <span className="hero-stat-label">Veículos Vendidos</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value">15+</span>
              <span className="hero-stat-label">Anos de Mercado</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value">98%</span>
              <span className="hero-stat-label">Clientes Satisfeitos</span>
            </div>
          </div>
        </div>
      </section>

      {/* SOBRE */}
      <section id="sobre" className="sobre-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Sobre Nós</span>
            <h2 className="section-title">Sua Melhor Escolha em Veículos</h2>
            <p className="section-desc">
              Há mais de 15 anos transformando o sonho do carro próprio em realidade.
            </p>
          </div>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="sobre-card">
                <div className="sobre-icon">
                  <i className="bi bi-shield-check"></i>
                </div>
                <h4>Procedência Garantida</h4>
                <p>Todos os veículos passam por rigorosa inspeção técnica e documental.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="sobre-card">
                <div className="sobre-icon">
                  <i className="bi bi-people"></i>
                </div>
                <h4>Equipe Especializada</h4>
                <p>Profissionais capacitados para oferecer a melhor experiência de compra.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="sobre-card">
                <div className="sobre-icon">
                  <i className="bi bi-hand-thumbs-up"></i>
                </div>
                <h4>Missão</h4>
                <p>Oferecer veículos de qualidade com transparência, respeito e excelência.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VEÍCULOS EM DESTAQUE */}
      <section id="veiculos" className="veiculos-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Destaques</span>
            <h2 className="section-title">Veículos em Destaque</h2>
            <p className="section-desc">Confira nossa seleção especial de veículos disponíveis.</p>
          </div>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Carregando...</span>
              </div>
            </div>
          ) : (
            <div className="row g-4">
              {destaques.map(v => (
                <div key={v.id} className="col-lg-4 col-md-6">
                  <div className="veiculo-card">
                    <div className="veiculo-card-image">
                      <i className="bi bi-car-front-fill"></i>
                      <span className="veiculo-card-categoria">{v.categoria}</span>
                    </div>
                    <div className="veiculo-card-body">
                      <h5 className="veiculo-card-title">{v.marca} {v.modelo}</h5>
                      <div className="veiculo-card-info">
                        <span><i className="bi bi-calendar me-1"></i>{v.ano}</span>
                        <span><i className="bi bi-speedometer2 me-1"></i>0 km</span>
                      </div>
                      <div className="veiculo-card-preco">
                        {formatPreco(v.preco)}
                      </div>
                      <div className="veiculo-card-actions">
                        <Link to="/cadastro" className="btn btn-primary w-100">
                          <i className="bi bi-whatsapp me-2"></i>
                          Tenho Interesse
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section id="beneficios" className="beneficios-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Benefícios</span>
            <h2 className="section-title">Por que Escolher a MM Motors?</h2>
            <p className="section-desc">Vantagens exclusivas para você.</p>
          </div>
          <div className="row g-4">
            <div className="col-lg-3 col-md-6">
              <div className="beneficio-card">
                <div className="beneficio-icon" style={{ background: 'linear-gradient(135deg, #0d6efd, #0a58ca)' }}>
                  <i className="bi bi-cash-coin"></i>
                </div>
                <h4>Financiamento</h4>
                <p>As melhores taxas do mercado com aprovação rápida.</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="beneficio-card">
                <div className="beneficio-icon" style={{ background: 'linear-gradient(135deg, #198754, #157347)' }}>
                  <i className="bi bi-award"></i>
                </div>
                <h4>Garantia</h4>
                <p>Garantia total de 12 meses em todos os veículos.</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="beneficio-card">
                <div className="beneficio-icon" style={{ background: 'linear-gradient(135deg, #fd7e14, #e36c0a)' }}>
                  <i className="bi bi-headset"></i>
                </div>
                <h4>Suporte</h4>
                <p>Suporte completo pós-venda para sua tranquilidade.</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="beneficio-card">
                <div className="beneficio-icon" style={{ background: 'linear-gradient(135deg, #6f42c1, #5b32a8)' }}>
                  <i className="bi bi-check-circle"></i>
                </div>
                <h4>Qualidade</h4>
                <p>Inspeção rigorosa em 200 itens de cada veículo.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTATO */}
      <section id="contato" className="contato-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Contato</span>
            <h2 className="section-title">Fale Conosco</h2>
            <p className="section-desc">Estamos prontos para atender você.</p>
          </div>
          <div className="row g-4 justify-content-center">
            <div className="col-lg-5">
              <div className="contato-info">
                <div className="contato-item">
                  <i className="bi bi-telephone-fill"></i>
                  <div>
                    <strong>Telefone</strong>
                    <p>(11) 3000-0001</p>
                  </div>
                </div>
                <div className="contato-item">
                  <i className="bi bi-envelope-fill"></i>
                  <div>
                    <strong>Email</strong>
                    <p>contato@mmmotors.com</p>
                  </div>
                </div>
                <div className="contato-item">
                  <i className="bi bi-geo-alt-fill"></i>
                  <div>
                    <strong>Endereço</strong>
                    <p>Av. Paulista, 1000 - São Paulo, SP</p>
                  </div>
                </div>
                <div className="contato-item">
                  <i className="bi bi-clock-fill"></i>
                  <div>
                    <strong>Horário</strong>
                    <p>Seg-Sex: 8h às 19h | Sáb: 8h às 14h</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-5">
              <ContatoForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ContatoForm() {
  const [form, setForm] = useState({ nome: '', email: '', mensagem: '' });
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setEnviando(true);
    try {
      await fetch('/api/contato', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      setSucesso('Mensagem enviada com sucesso!');
      setForm({ nome: '', email: '', mensagem: '' });
    } catch {
      setSucesso('');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="contato-form" onSubmit={handleSubmit}>
      {sucesso && (
        <div className="alert alert-success">{sucesso}</div>
      )}
      <div className="mb-3">
        <input
          type="text"
          className="form-control form-control-lg"
          placeholder="Seu nome"
          value={form.nome}
          onChange={e => setForm({ ...form, nome: e.target.value })}
          required
        />
      </div>
      <div className="mb-3">
        <input
          type="email"
          className="form-control form-control-lg"
          placeholder="Seu email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          required
        />
      </div>
      <div className="mb-3">
        <textarea
          className="form-control form-control-lg"
          rows="4"
          placeholder="Sua mensagem"
          value={form.mensagem}
          onChange={e => setForm({ ...form, mensagem: e.target.value })}
          required
        ></textarea>
      </div>
      <button type="submit" className="btn btn-primary btn-lg w-100" disabled={enviando}>
        {enviando ? (
          <><span className="spinner-border spinner-border-sm me-2"></span>Enviando...</>
        ) : (
          <><i className="bi bi-send me-2"></i>Enviar Mensagem</>
        )}
      </button>
    </form>
  );
}
