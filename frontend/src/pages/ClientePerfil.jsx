import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import clienteDashboardService from '../services/clienteDashboardService';
import api from '../services/api';

export default function ClientePerfil() {
  const { usuario } = useAuth();
  const [perfil, setPerfil] = useState({ nome: '', telefone: '', cidade: '' });
  const [senhaForm, setSenhaForm] = useState({ senha_atual: '', nova_senha: '', confirmar: '' });
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (usuario) {
      api.get('/auth/me').then(res => {
        setPerfil({ nome: res.data.nome || '', telefone: res.data.telefone || '', cidade: res.data.cidade || '' });
      }).catch(() => {});
    }
  }, [usuario]);

  async function handlePerfilSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });
    try {
      await clienteDashboardService.updatePerfil(perfil);
      setMsg({ type: 'success', text: 'Perfil atualizado com sucesso!' });
    } catch (err) {
      setMsg({ type: 'danger', text: err.response?.data?.error || 'Erro ao atualizar' });
    } finally {
      setLoading(false);
    }
  }

  async function handleSenhaSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });

    if (senhaForm.nova_senha.length < 6) {
      setMsg({ type: 'danger', text: 'Nova senha deve ter no mínimo 6 caracteres' });
      setLoading(false);
      return;
    }

    if (senhaForm.nova_senha !== senhaForm.confirmar) {
      setMsg({ type: 'danger', text: 'Senhas não conferem' });
      setLoading(false);
      return;
    }

    try {
      await clienteDashboardService.updateSenha({ senha_atual: senhaForm.senha_atual, nova_senha: senhaForm.nova_senha });
      setMsg({ type: 'success', text: 'Senha alterada com sucesso!' });
      setSenhaForm({ senha_atual: '', nova_senha: '', confirmar: '' });
    } catch (err) {
      setMsg({ type: 'danger', text: err.response?.data?.error || 'Erro ao alterar senha' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="cliente-perfil">
      <h2 className="mb-4"><i className="bi bi-person me-2"></i>Meu Perfil</h2>

      {msg.text && (
        <div className={`alert alert-${msg.type} alert-dismissible fade show`} role="alert">
          <i className={`bi bi-${msg.type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2`}></i>
          {msg.text}
          <button type="button" className="btn-close" onClick={() => setMsg({ type: '', text: '' })}></button>
        </div>
      )}

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="cliente-card">
            <div className="cliente-card-header">
              <h5><i className="bi bi-pencil me-2"></i>Dados Pessoais</h5>
            </div>
            <div className="cliente-card-body">
              <form onSubmit={handlePerfilSubmit}>
                <div className="mb-3">
                  <label className="form-label">Nome</label>
                  <input
                    type="text"
                    className="form-control"
                    value={perfil.nome}
                    onChange={e => setPerfil({ ...perfil, nome: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={usuario?.email || ''}
                    disabled
                  />
                  <small className="text-muted">O email não pode ser alterado.</small>
                </div>
                <div className="mb-3">
                  <label className="form-label">Telefone</label>
                  <input
                    type="text"
                    className="form-control"
                    value={perfil.telefone}
                    onChange={e => setPerfil({ ...perfil, telefone: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Cidade</label>
                  <input
                    type="text"
                    className="form-control"
                    value={perfil.cidade}
                    onChange={e => setPerfil({ ...perfil, cidade: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Salvando...' : <><i className="bi bi-check-lg me-2"></i>Salvar Alterações</>}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="cliente-card">
            <div className="cliente-card-header">
              <h5><i className="bi bi-shield-lock me-2"></i>Alterar Senha</h5>
            </div>
            <div className="cliente-card-body">
              <form onSubmit={handleSenhaSubmit}>
                <div className="mb-3">
                  <label className="form-label">Senha Atual</label>
                  <input
                    type="password"
                    className="form-control"
                    value={senhaForm.senha_atual}
                    onChange={e => setSenhaForm({ ...senhaForm, senha_atual: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Nova Senha</label>
                  <input
                    type="password"
                    className="form-control"
                    value={senhaForm.nova_senha}
                    onChange={e => setSenhaForm({ ...senhaForm, nova_senha: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    className="form-control"
                    value={senhaForm.confirmar}
                    onChange={e => setSenhaForm({ ...senhaForm, confirmar: e.target.value })}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-warning" disabled={loading}>
                  {loading ? 'Alterando...' : <><i className="bi bi-key me-2"></i>Alterar Senha</>}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
