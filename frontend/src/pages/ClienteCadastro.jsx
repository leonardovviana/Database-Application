import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ClienteCadastro() {
  const [form, setForm] = useState({ nome: '', email: '', senha: '', confirmarSenha: '', telefone: '', cidade: '' });
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');

    if (!form.nome || !form.email || !form.senha) {
      setErro('Nome, email e senha são obrigatórios');
      return;
    }

    if (form.senha.length < 6) {
      setErro('Senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (form.senha !== form.confirmarSenha) {
      setErro('Senhas não conferem');
      return;
    }

    try {
      setLoading(true);
      await register({
        nome: form.nome,
        email: form.email,
        senha: form.senha,
        telefone: form.telefone,
        cidade: form.cidade
      });
      navigate('/cliente/dashboard');
    } catch (err) {
      setErro(err.response?.data?.error || 'Erro ao cadastrar');
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
            <h3>Criar Conta</h3>
            <p>Cadastre-se e tenha acesso a ofertas exclusivas</p>
          </div>

          {erro && (
            <div className="alert alert-danger py-2" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {erro}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Nome completo</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-person"></i></span>
                <input
                  type="text"
                  name="nome"
                  className="form-control"
                  placeholder="Seu nome"
                  value={form.nome}
                  onChange={handleChange}
                  autoFocus
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Email</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="seu@email.com"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label">Telefone</label>
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-telephone"></i></span>
                  <input
                    type="text"
                    name="telefone"
                    className="form-control"
                    placeholder="(11) 99999-0000"
                    value={form.telefone}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label">Cidade</label>
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-geo-alt"></i></span>
                  <input
                    type="text"
                    name="cidade"
                    className="form-control"
                    placeholder="Sua cidade"
                    value={form.cidade}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label">Senha</label>
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-lock"></i></span>
                  <input
                    type="password"
                    name="senha"
                    className="form-control"
                    placeholder="Mínimo 6 caracteres"
                    value={form.senha}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label">Confirmar Senha</label>
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-lock-fill"></i></span>
                  <input
                    type="password"
                    name="confirmarSenha"
                    className="form-control"
                    placeholder="Repita a senha"
                    value={form.confirmarSenha}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-100 py-2 fw-bold" disabled={loading}>
              {loading ? (
                <><span className="spinner-border spinner-border-sm me-2"></span>Cadastrando...</>
              ) : (
                <><i className="bi bi-person-plus me-2"></i>Criar Conta</>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <span>Já tem conta?</span>
            <Link to="/login">Entrar</Link>
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
