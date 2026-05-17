import { useState, useEffect, useCallback, useRef } from 'react';
import vendedoresService from '../services/vendedoresService';
import concessionariasService from '../services/concessionariasService';
import { useToast } from '../contexts/ToastContext';
import Loading from '../components/Loading';
import FormModal from '../components/FormModal';

const emptyForm = { nome: '', cpf: '', telefone: '', email: '', concessionaria_id: '' };

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

export default function Vendedores() {
  const [vendedores, setVendedores] = useState([]);
  const [concessionarias, setConcessionarias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [concessFiltro, setConcessFiltro] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { addToast } = useToast();
  const searchRef = useRef(null);

  const load = useCallback((term = '') => {
    setLoading(true);
    Promise.all([
      term.trim() ? vendedoresService.buscar(term) : vendedoresService.listar(),
      concessionariasService.listar()
    ])
      .then(([vRes, cRes]) => {
        setVendedores(vRes.data);
        setConcessionarias(cRes.data);
      })
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

  const filtrados = concessFiltro
    ? vendedores.filter(v => v.concessionaria_id === Number(concessFiltro))
    : vendedores;

  function openCreate() {
    setEditId(null);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  }

  function openEdit(v) {
    setEditId(v.id);
    setForm({
      nome: v.nome, cpf: v.cpf || '', telefone: v.telefone || '',
      email: v.email || '', concessionaria_id: v.concessionaria_id
    });
    setError('');
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const payload = { ...form };
    if (!payload.nome.trim()) { setError('Nome é obrigatório'); return; }
    if (!payload.concessionaria_id) { setError('Concessionária é obrigatória'); return; }
    payload.cpf = payload.cpf.replace(/\D/g, '');
    payload.telefone = payload.telefone.replace(/\D/g, '');
    try {
      if (editId) {
        await vendedoresService.atualizar(editId, payload);
      } else {
        await vendedoresService.criar(payload);
      }
      setModalOpen(false);
      addToast(editId ? 'Vendedor atualizado com sucesso!' : 'Vendedor cadastrado com sucesso!');
      load(search);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar');
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await vendedoresService.excluir(deleteTarget.id);
      setDeleteTarget(null);
      addToast('Vendedor removido com sucesso!');
      load(search);
    } catch (err) {
      addToast(err.response?.data?.error || 'Erro ao remover vendedor', 'error');
    }
  }

  if (loading && vendedores.length === 0) return <Loading message="Carregando vendedores..." />;

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <h3 className="fw-bold mb-0">Vendedores</h3>
        <button className="btn btn-primary" onClick={openCreate}>
          <i className="bi bi-plus-lg me-1"></i> Novo Vendedor
        </button>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-2 align-items-end">
            <div className="col-md-5">
              <label className="form-label small text-muted fw-semibold">
                <i className="bi bi-search me-1"></i>Buscar
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Nome, CPF, email ou concessionária..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label small text-muted fw-semibold">
                <i className="bi bi-funnel me-1"></i>Concessionária
              </label>
              <select
                className="form-select"
                value={concessFiltro}
                onChange={e => setConcessFiltro(e.target.value)}
              >
                <option value="">Todas</option>
                {concessionarias.map(c => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <div className="small text-muted mt-2 mt-md-0">
                <i className="bi bi-person-badge me-1"></i>
                {filtrados.length} vendedor{filtrados.length !== 1 ? 'es' : ''}
              </div>
            </div>
            <div className="col-md-2 d-flex gap-1">
              {(search || concessFiltro) && (
                <button className="btn btn-outline-secondary w-100" onClick={() => { setSearch(''); setConcessFiltro(''); }}>
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
                  <th>Concessionária</th>
                  <th style={{ width: '100px' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map(v => (
                  <tr key={v.id}>
                    <td className="text-muted">{v.id}</td>
                    <td className="fw-medium">{v.nome}</td>
                    <td>{v.cpf || <span className="text-muted">--</span>}</td>
                    <td>{v.telefone || <span className="text-muted">--</span>}</td>
                    <td>{v.email || <span className="text-muted">--</span>}</td>
                    <td>
                      <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-1">
                        {v.concessionaria_nome}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button className="btn btn-outline-primary" onClick={() => openEdit(v)} title="Editar">
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button className="btn btn-outline-danger" onClick={() => setDeleteTarget(v)} title="Remover">
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtrados.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <i className="bi bi-person-badge text-muted fs-1 d-block mb-2"></i>
                      <p className="text-muted mb-0">
                        {search || concessFiltro
                          ? 'Nenhum vendedor encontrado para esta busca.'
                          : 'Nenhum vendedor cadastrado.'}
                      </p>
                      {!search && !concessFiltro && (
                        <button className="btn btn-primary btn-sm mt-2" onClick={openCreate}>
                          <i className="bi bi-plus-lg me-1"></i> Cadastrar Primeiro Vendedor
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
        title={editId ? 'Editar Vendedor' : 'Novo Vendedor'}
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
            placeholder="vendedor@email.com"
          />
        </div>
        <div className="mb-2">
          <label className="form-label fw-medium">Concessionária <span className="text-danger">*</span></label>
          <select
            className="form-select form-select-lg"
            value={form.concessionaria_id}
            onChange={e => setForm({ ...form, concessionaria_id: e.target.value })}
          >
            <option value="">Selecione...</option>
            {concessionarias.map(c => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
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
                  Remover vendedor <strong>{deleteTarget.nome}</strong>?
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
