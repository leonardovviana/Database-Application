import { useState, useEffect, useCallback, useRef } from 'react';
import concessionariasService from '../services/concessionariasService';
import { useToast } from '../contexts/ToastContext';
import Loading from '../components/Loading';
import FormModal from '../components/FormModal';

const emptyForm = { nome: '', cidade: '', estado: '', gerente: '', telefone: '' };
const formatTel = v => v.replace(/\D/g, '').replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');

export default function Concessionarias() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { addToast } = useToast();
  const nomeRef = useRef(null);

  const load = useCallback((term = '') => {
    setLoading(true);
    const promise = term.trim()
      ? concessionariasService.buscar(term)
      : concessionariasService.listar();
    promise
      .then(res => setItems(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const timer = setTimeout(() => load(search), 300);
    return () => clearTimeout(timer);
  }, [search, load]);

  useEffect(() => {
    if (modalOpen && nomeRef.current) {
      setTimeout(() => nomeRef.current?.focus(), 100);
    }
  }, [modalOpen]);

  function openCreate() {
    setEditId(null);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  }

  function openEdit(item) {
    setEditId(item.id);
    setForm({ nome: item.nome, cidade: item.cidade, estado: item.estado, gerente: item.gerente || '', telefone: item.telefone || '' });
    setError('');
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const payload = { ...form };
    if (!payload.nome.trim()) { setError('Nome é obrigatório'); return; }
    if (!payload.cidade.trim()) { setError('Cidade é obrigatória'); return; }
    if (!payload.estado.trim()) { setError('Estado é obrigatório'); return; }
    if (payload.telefone) payload.telefone = payload.telefone.replace(/\D/g, '');
    try {
      if (editId) {
        await concessionariasService.atualizar(editId, payload);
      } else {
        await concessionariasService.criar(payload);
      }
      setModalOpen(false);
      addToast(editId ? 'Concessionária atualizada com sucesso!' : 'Concessionária cadastrada com sucesso!');
      load(search);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar');
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await concessionariasService.excluir(deleteTarget.id);
      setDeleteTarget(null);
      addToast('Concessionária removida com sucesso!');
      load(search);
    } catch (err) {
      addToast(err.response?.data?.error || 'Erro ao remover concessionária', 'error');
    }
  }

  if (loading && items.length === 0) return <Loading message="Carregando concessionárias..." />;

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <h3 className="fw-bold mb-0">Concessionárias</h3>
        <button className="btn btn-primary" onClick={openCreate}>
          <i className="bi bi-plus-lg me-1"></i> Nova Concessionária
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
                placeholder="Nome, cidade, estado ou gerente..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <div className="small text-muted mt-2 mt-md-0">
                <i className="bi bi-building me-1"></i>
                {items.length} concessionária{items.length !== 1 ? 's' : ''}
              </div>
            </div>
            <div className="col-md-2 d-flex gap-1">
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
                  <th>Cidade</th>
                  <th style={{ width: '80px' }}>Estado</th>
                  <th>Gerente</th>
                  <th style={{ width: '140px' }}>Telefone</th>
                  <th style={{ width: '100px' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td className="text-muted">{item.id}</td>
                    <td className="fw-medium">{item.nome}</td>
                    <td>{item.cidade}</td>
                    <td>{item.estado}</td>
                    <td>{item.gerente || '-'}</td>
                    <td>{item.telefone || '-'}</td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button className="btn btn-outline-primary" onClick={() => openEdit(item)} title="Editar">
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button className="btn btn-outline-danger" onClick={() => setDeleteTarget(item)} title="Remover">
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <i className="bi bi-building text-muted fs-1 d-block mb-2"></i>
                      <p className="text-muted mb-0">
                        {search
                          ? 'Nenhuma concessionária encontrada para esta busca.'
                          : 'Nenhuma concessionária cadastrada.'}
                      </p>
                      {!search && (
                        <button className="btn btn-primary btn-sm mt-2" onClick={openCreate}>
                          <i className="bi bi-plus-lg me-1"></i> Cadastrar Primeira Concessionária
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
        title={editId ? 'Editar Concessionária' : 'Nova Concessionária'}
        error={error}
      >
        <div className="mb-3">
          <label className="form-label fw-medium">Nome <span className="text-danger">*</span></label>
          <input ref={nomeRef} className="form-control form-control-lg" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} />
        </div>
        <div className="row g-3 mb-3">
          <div className="col">
            <label className="form-label fw-medium">Cidade <span className="text-danger">*</span></label>
            <input className="form-control form-control-lg" value={form.cidade} onChange={e => setForm({ ...form, cidade: e.target.value })} />
          </div>
          <div className="col">
            <label className="form-label fw-medium">Estado <span className="text-danger">*</span></label>
            <input className="form-control form-control-lg" value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })} maxLength={2} placeholder="SP" />
          </div>
        </div>
        <div className="row g-3 mb-2">
          <div className="col">
            <label className="form-label fw-medium">Gerente</label>
            <input className="form-control form-control-lg" value={form.gerente} onChange={e => setForm({ ...form, gerente: e.target.value })} />
          </div>
          <div className="col">
            <label className="form-label fw-medium">Telefone</label>
            <input className="form-control form-control-lg" value={form.telefone} onChange={e => setForm({ ...form, telefone: formatTel(e.target.value) })} maxLength={15} placeholder="(11) 3000-0000" />
          </div>
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
                  Remover <strong>{deleteTarget.nome}</strong>?
                </p>
                <p className="text-danger small mb-3">
                  <i className="bi bi-exclamation-circle me-1"></i>
                  Esta ação não pode ser desfeita.
                </p>
                <div className="d-flex gap-2 justify-content-center">
                  <button className="btn btn-secondary px-4" onClick={() => setDeleteTarget(null)}>
                    Cancelar
                  </button>
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
