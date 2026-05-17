import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');

    if (!email || !senha) {
      setErro('Preencha todos os campos');
      return;
    }

    try {
      setLoading(true);
      const user = await login(email, senha);

      if (user.cargo === 'cliente') {
        navigate('/cliente/dashboard');
      } else {
        navigate('/admin');
      }
    } catch (err) {
      setErro(err.response?.data?.error || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <Link to="/" className="auth-logo">
          <i className="bi bi-car-front-fill"></i>
          <span>MM Motors</span>
        </Link>

        <div className="auth-card">
          <div className="auth-header">
            <h3>Entrar</h3>
            <p>Faça login para acessar sua área</p>
          </div>

          {erro && (
            <div className="alert alert-danger py-2" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {erro}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                <input
                  type="email"
                  className="form-control"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label">Senha</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-lock"></i></span>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Sua senha"
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-100 py-2 fw-bold" disabled={loading}>
              {loading ? (
                <><span className="spinner-border spinner-border-sm me-2"></span>Entrando...</>
              ) : (
                <><i className="bi bi-box-arrow-in-right me-2"></i>Entrar</>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <span>Não tem conta?</span>
            <Link to="/cadastro">Cadastre-se</Link>
          </div>
        </div>

        <Link to="/" className="auth-back">
          <i className="bi bi-arrow-left me-2"></i>
          Voltar para o site
        </Link>
      </div>
    </div>
  );
}
