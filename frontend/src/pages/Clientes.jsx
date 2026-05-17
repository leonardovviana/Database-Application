import { useState, useEffect, useCallback, useRef } from 'react';
import clientesService from '../services/clientesService';
import { useToast } from '../contexts/ToastContext';
import Loading from '../components/Loading';
import FormModal from '../components/FormModal';

const emptyForm = { nome: '', cpf: '', telefone: '', email: '', cidade: '' };

function formatCPF(v) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function formatTel(v) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { addToast } = useToast();
  const searchRef = useRef(null);

  const load = useCallback((term = '') => {
    setLoading(true);
    const promise = term.trim()
      ? clientesService.buscar(term)
      : clientesService.listar();
    promise
      .then(res => setClientes(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => load(), [load]);

  useEffect(() => {
    const timer = setTimeout(() => load(search), 300);
    return () => clearTimeout(timer);
  }, [search, load]);

  useEffect(() => {
    if (modalOpen && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  }, [modalOpen]);

  function openCreate() {
    setEditId(null);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  }

  function openEdit(c) {
    setEditId(c.id);
    setForm({
      nome: c.nome, cpf: c.cpf || '', telefone: c.telefone || '',
      email: c.email || '', cidade: c.cidade || ''
    });
    setError('');
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const payload = { ...form };
    if (!payload.nome.trim()) { setError('Nome é obrigatório'); return; }
    payload.cpf = payload.cpf.replace(/\D/g, '');
    payload.telefone = payload.telefone.replace(/\D/g, '');
    try {
      if (editId) {
        await clientesService.atualizar(editId, payload);
      } else {
        await clientesService.criar(payload);
      }
      setModalOpen(false);
      addToast(editId ? 'Cliente atualizado com sucesso!' : 'Cliente cadastrado com sucesso!');
      load(search);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar');
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await clientesService.excluir(deleteTarget.id);
      setDeleteTarget(null);
      addToast('Cliente removido com sucesso!');
      load(search);
    } catch (err) {
      addToast(err.response?.data?.error || 'Erro ao remover cliente', 'error');
    }
  }

  if (loading && clientes.length === 0) return <Loading message="Carregando clientes..." />;

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <h3 className="fw-bold mb-0">Clientes</h3>
        <button className="btn btn-primary" onClick={openCreate}>
          <i className="bi bi-plus-lg me-1"></i> Novo Cliente
        </button>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-2 align-items-end">
            <div className="col-md-6">
              <label className="form-label small text-muted fw-semibold">
                <i className="bi bi-search me-1"></i>Buscar
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Nome, CPF, email, cidade ou telefone..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <div className="small text-muted mt-2 mt-md-0">
                <i className="bi bi-people me-1"></i>
                {clientes.length} cliente{clientes.length !== 1 ? 's' : ''}
              </div>
            </div>
            <div className="col-md-3 d-flex gap-1">
              {search && (
                <button className="btn btn-outline-secondary w-100" onClick={() => setSearch('')}>
                  <i className="bi bi-x-lg me-1"></i>Limpar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '50px' }}>#</th>
                  <th>Nome</th>
                  <th style={{ width: '150px' }}>CPF</th>
                  <th style={{ width: '140px' }}>Telefone</th>
                  <th>Email</th>
                  <th style={{ width: '130px' }}>Cidade</th>
                  <th style={{ width: '100px' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map(c => (
                  <tr key={c.id}>
                    <td className="text-muted">{c.id}</td>
                    <td className="fw-medium">{c.nome}</td>
                    <td>{c.cpf || <span className="text-muted">--</span>}</td>
                    <td>{c.telefone || <span className="text-muted">--</span>}</td>
                    <td>{c.email || <span className="text-muted">--</span>}</td>
                    <td>{c.cidade || <span className="text-muted">--</span>}</td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button className="btn btn-outline-primary" onClick={() => openEdit(c)} title="Editar">
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button className="btn btn-outline-danger" onClick={() => setDeleteTarget(c)} title="Remover">
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {clientes.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <i className="bi bi-people text-muted fs-1 d-block mb-2"></i>
                      <p className="text-muted mb-0">
                        {search
                          ? 'Nenhum cliente encontrado para esta busca.'
                          : 'Nenhum cliente cadastrado.'}
                      </p>
                      {!search && (
                        <button className="btn btn-primary btn-sm mt-2" onClick={openCreate}>
                          <i className="bi bi-plus-lg me-1"></i> Cadastrar Primeiro Cliente
                        </button>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <FormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        title={editId ? 'Editar Cliente' : 'Novo Cliente'}
        error={error}
      >
        <div className="mb-3">
          <label className="form-label fw-medium">Nome <span className="text-danger">*</span></label>
          <input
            ref={searchRef}
            className="form-control form-control-lg"
            value={form.nome}
            onChange={e => setForm({ ...form, nome: e.target.value })}
            placeholder="Nome completo"
          />
        </div>
        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label className="form-label fw-medium">CPF</label>
            <input
              className="form-control form-control-lg"
              value={form.cpf}
              onChange={e => setForm({ ...form, cpf: formatCPF(e.target.value) })}
              maxLength={14}
              placeholder="000.000.000-00"
            />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-medium">Telefone</label>
            <input
              className="form-control form-control-lg"
              value={form.telefone}
              onChange={e => setForm({ ...form, telefone: formatTel(e.target.value) })}
              maxLength={15}
              placeholder="(11) 99999-0000"
            />
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label fw-medium">Email</label>
          <input
            type="email"
            className="form-control form-control-lg"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            placeholder="cliente@email.com"
          />
        </div>
        <div className="mb-2">
          <label className="form-label fw-medium">Cidade</label>
          <input
            className="form-control form-control-lg"
            value={form.cidade}
            onChange={e => setForm({ ...form, cidade: e.target.value })}
            placeholder="São Paulo"
          />
        </div>
      </FormModal>

      <div className={`modal fade ${deleteTarget ? 'show d-block' : ''}`} tabIndex="-1" style={deleteTarget ? { backgroundColor: 'rgba(0,0,0,0.5)' } : {}}>
        {deleteTarget && (
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content border-0 shadow">
              <div className="modal-body text-center py-4">
                <div className="text-danger mb-3">
                  <i className="bi bi-exclamation-triangle-fill fs-1"></i>
                </div>
                <h5 className="fw-bold mb-1">Confirmar Exclusão</h5>
                <p className="text-muted mb-0">
                  Remover cliente <strong>{deleteTarget.nome}</strong>?
                </p>
                <p className="text-danger small mb-3">Esta ação não pode ser desfeita.</p>
                <div className="d-flex gap-2 justify-content-center">
                  <button className="btn btn-secondary px-4" onClick={() => setDeleteTarget(null)}>Cancelar</button>
                  <button className="btn btn-danger px-4" onClick={confirmDelete}>
                    <i className="bi bi-trash me-1"></i> Excluir
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
