import { useState, useEffect, useCallback, useRef } from 'react';
import veiculosService from '../services/veiculosService';
import { useToast } from '../contexts/ToastContext';
import Loading from '../components/Loading';
import FormModal from '../components/FormModal';

const emptyForm = { marca: '', modelo: '', ano: '', categoria: '', preco: '', estoque: 1 };

const categorias = ['Sedã', 'SUV', 'Hatch', 'Picape', 'Esportivo', 'Utilitário', 'Coupé', 'Conversível'];

function formatPreco(valor) {
  if (!valor) return '';
  const num = typeof valor === 'string' ? parseFloat(valor.replace(/\D/g, '')) / 100 : valor;
  return num.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}

export default function Veiculos() {
  const [veiculos, setVeiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
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
      ? veiculosService.buscar(term)
      : veiculosService.listar();
    promise
      .then(res => setVeiculos(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const timer = setTimeout(() => { load(search); }, 300);
    return () => clearTimeout(timer);
  }, [search, load]);

  useEffect(() => {
    if (modalOpen && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  }, [modalOpen]);

  const filtrados = categoriaFiltro
    ? veiculos.filter(v => v.categoria === categoriaFiltro)
    : veiculos;

  function openCreate() {
    setEditId(null);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  }

  function openEdit(v) {
    setEditId(v.id);
    setForm({
      marca: v.marca,
      modelo: v.modelo,
      ano: v.ano,
      categoria: v.categoria || '',
      preco: v.preco,
      estoque: v.estoque
    });
    setError('');
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const payload = { ...form };
    if (!payload.marca.trim()) { setError('Marca é obrigatória'); return; }
    if (!payload.modelo.trim()) { setError('Modelo é obrigatório'); return; }
    if (!payload.ano) { setError('Ano é obrigatório'); return; }
    if (!payload.preco && payload.preco !== 0) { setError('Preço é obrigatório'); return; }
    payload.ano = Number(payload.ano);
    payload.preco = Number(String(payload.preco).replace(/\D/g, '')) / 100 || Number(payload.preco);
    payload.estoque = Number(payload.estoque) || 0;
    try {
      if (editId) {
        await veiculosService.atualizar(editId, payload);
      } else {
        await veiculosService.criar(payload);
      }
      setModalOpen(false);
      addToast(editId ? 'Veículo atualizado com sucesso!' : 'Veículo cadastrado com sucesso!');
      load(search);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar');
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await veiculosService.excluir(deleteTarget.id);
      setDeleteTarget(null);
      addToast('Veículo removido com sucesso!');
      load(search);
    } catch (err) {
      addToast(err.response?.data?.error || 'Erro ao remover veículo', 'error');
    }
  }

  if (loading && veiculos.length === 0) return <Loading message="Carregando veículos..." />;

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <h3 className="fw-bold mb-0">Veículos</h3>
        <button className="btn btn-primary" onClick={openCreate}>
          <i className="bi bi-plus-lg me-1"></i> Novo Veículo
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
                placeholder="Marca, modelo, categoria ou ano..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label small text-muted fw-semibold">
                <i className="bi bi-funnel me-1"></i>Categoria
              </label>
              <select
                className="form-select"
                value={categoriaFiltro}
                onChange={e => setCategoriaFiltro(e.target.value)}
              >
                <option value="">Todas as categorias</option>
                {categorias.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <div className="small text-muted mt-2 mt-md-0">
                <i className="bi bi-car-front me-1"></i>
                {filtrados.length} veículo{filtrados.length !== 1 ? 's' : ''}
              </div>
            </div>
            <div className="col-md-2 d-flex gap-1">
              {(search || categoriaFiltro) && (
                <button
                  className="btn btn-outline-secondary w-100"
                  onClick={() => { setSearch(''); setCategoriaFiltro(''); }}
                >
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
                  <th>Marca</th>
                  <th>Modelo</th>
                  <th style={{ width: '80px' }}>Ano</th>
                  <th style={{ width: '120px' }}>Categoria</th>
                  <th style={{ width: '140px' }}>Preço</th>
                  <th style={{ width: '90px' }}>Estoque</th>
                  <th style={{ width: '100px' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map(v => (
                  <tr key={v.id}>
                    <td className="text-muted">{v.id}</td>
                    <td className="fw-medium">{v.marca}</td>
                    <td>{v.modelo}</td>
                    <td>{v.ano}</td>
                    <td>
                      <span className="badge bg-info bg-opacity-10 text-info rounded-pill px-3 py-1">
                        {v.categoria || '-'}
                      </span>
                    </td>
                    <td className="fw-semibold">
                      R$ {v.preco.toLocaleString('pt-BR')}
                    </td>
                    <td>
                      {v.estoque > 5 ? (
                        <span className="badge bg-success rounded-pill px-3 py-1">
                          <i className="bi bi-check-circle me-1"></i>{v.estoque}
                        </span>
                      ) : v.estoque > 0 ? (
                        <span className="badge bg-warning text-dark rounded-pill px-3 py-1">
                          {v.estoque}
                        </span>
                      ) : (
                        <span className="badge bg-danger rounded-pill px-3 py-1">
                          <i className="bi bi-x-circle me-1"></i>0
                        </span>
                      )}
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
                    <td colSpan="8" className="text-center py-5">
                      <i className="bi bi-car-front text-muted fs-1 d-block mb-2"></i>
                      <p className="text-muted mb-0">
                        {search || categoriaFiltro
                          ? 'Nenhum veículo encontrado para esta busca.'
                          : 'Nenhum veículo cadastrado.'}
                      </p>
                      {!search && !categoriaFiltro && (
                        <button className="btn btn-primary btn-sm mt-2" onClick={openCreate}>
                          <i className="bi bi-plus-lg me-1"></i> Cadastrar Primeiro Veículo
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
        title={editId ? 'Editar Veículo' : 'Novo Veículo'}
        error={error}
      >
        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label className="form-label fw-medium">Marca <span className="text-danger">*</span></label>
            <input
              ref={searchRef}
              className="form-control form-control-lg"
              value={form.marca}
              onChange={e => setForm({ ...form, marca: e.target.value })}
              placeholder="Ex: Toyota"
              list="marcas-suggest"
            />
            <datalist id="marcas-suggest">
              <option value="Toyota" /><option value="Honda" /><option value="Volkswagen" />
              <option value="Chevrolet" /><option value="Fiat" /><option value="Jeep" />
              <option value="Nissan" /><option value="Ford" /><option value="Hyundai" />
              <option value="BMW" /><option value="Mercedes-Benz" /><option value="Audi" />
            </datalist>
          </div>
          <div className="col-md-6">
            <label className="form-label fw-medium">Modelo <span className="text-danger">*</span></label>
            <input
              className="form-control form-control-lg"
              value={form.modelo}
              onChange={e => setForm({ ...form, modelo: e.target.value })}
              placeholder="Ex: Corolla"
            />
          </div>
        </div>

        <div className="row g-3 mb-3">
          <div className="col-md-4">
            <label className="form-label fw-medium">Ano <span className="text-danger">*</span></label>
            <input
              type="number"
              className="form-control form-control-lg"
              value={form.ano}
              onChange={e => setForm({ ...form, ano: e.target.value })}
              placeholder="2024"
              min="1900"
              max="2030"
            />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-medium">Categoria</label>
            <select
              className="form-select form-select-lg"
              value={form.categoria}
              onChange={e => setForm({ ...form, categoria: e.target.value })}
            >
              <option value="">Selecione...</option>
              {categorias.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label fw-medium">Estoque</label>
            <input
              type="number"
              className="form-control form-control-lg"
              value={form.estoque}
              onChange={e => setForm({ ...form, estoque: e.target.value })}
              min="0"
            />
          </div>
        </div>

        <div className="mb-2">
          <label className="form-label fw-medium">Preço <span className="text-danger">*</span></label>
          <div className="input-group input-group-lg">
            <span className="input-group-text fw-bold">R$</span>
            <input
              type="text"
              className="form-control form-control-lg"
              value={form.preco}
              onChange={e => {
                const digits = e.target.value.replace(/\D/g, '');
                if (!digits) { setForm({ ...form, preco: '' }); return; }
                const num = parseInt(digits, 10) / 100;
                setForm({ ...form, preco: num.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) });
              }}
              placeholder="0,00"
            />
          </div>
          <div className="form-text text-muted">
            <i className="bi bi-info-circle me-1"></i>
            Digite o valor em reais. Ex: 125000 → R$ 1.250,00
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
                  Remover <strong>{deleteTarget.marca} {deleteTarget.modelo}</strong> ({deleteTarget.ano})?
                </p>
                <p className="text-danger small mb-3">Esta ação não pode ser desfeita.</p>
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
