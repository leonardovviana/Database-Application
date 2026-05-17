import { useState, useEffect, useCallback, useRef } from 'react';
import vendasService from '../services/vendasService';
import clientesService from '../services/clientesService';
import vendedoresService from '../services/vendedoresService';
import veiculosService from '../services/veiculosService';
import concessionariasService from '../services/concessionariasService';
import { useToast } from '../contexts/ToastContext';
import Loading from '../components/Loading';
import FormModal from '../components/FormModal';

const emptyForm = {
  cliente_id: '', vendedor_id: '', veiculo_id: '',
  concessionaria_id: '', valor_total: '', forma_pagamento: 'à vista', data_venda: ''
};

const formasPagamento = ['à vista', 'financiamento', 'consórcio', 'troca'];

function formatPreco(v) {
  const d = v.replace(/\D/g, '');
  if (!d) return '';
  return (parseInt(d, 10) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}

function parsePreco(str) {
  if (!str) return 0;
  const num = Number(str);
  if (!isNaN(num)) return num;
  return Number(str.replace(/\./g, '').replace(',', '.')) || 0;
}

export default function Vendas() {
  const [vendas, setVendas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [concessionarias, setConcessionarias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtroPagamento, setFiltroPagamento] = useState('');
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [veiculoSelecionado, setVeiculoSelecionado] = useState(null);
  const { addToast } = useToast();
  const nomeRef = useRef(null);

  const loadAll = useCallback((term = '') => {
    setLoading(true);
    Promise.all([
      term.trim() ? vendasService.buscar(term) : vendasService.listar(),
      clientesService.listar(),
      vendedoresService.listar(),
      veiculosService.listar(),
      concessionariasService.listar()
    ])
      .then(([vRes, clRes, veRes, vcRes, coRes]) => {
        setVendas(vRes.data);
        setClientes(clRes.data);
        setVendedores(veRes.data);
        setVeiculos(vcRes.data);
        setConcessionarias(coRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => loadAll(), [loadAll]);

  useEffect(() => {
    const timer = setTimeout(() => loadAll(search), 300);
    return () => clearTimeout(timer);
  }, [search, loadAll]);

  useEffect(() => {
    if (modalOpen && nomeRef.current) {
      setTimeout(() => nomeRef.current?.focus(), 100);
    }
  }, [modalOpen]);

  const filtrados = vendas.filter(v => {
    if (filtroPagamento && v.forma_pagamento !== filtroPagamento) return false;
    if (filtroDataInicio && v.data_venda && v.data_venda.slice(0, 10) < filtroDataInicio) return false;
    if (filtroDataFim && v.data_venda && v.data_venda.slice(0, 10) > filtroDataFim) return false;
    return true;
  });

  function openCreate() {
    setEditId(null);
    setForm(emptyForm);
    setVeiculoSelecionado(null);
    setError('');
    setModalOpen(true);
  }

  function openEdit(v) {
    setEditId(v.id);
    setForm({
      cliente_id: v.cliente_id, vendedor_id: v.vendedor_id,
      veiculo_id: v.veiculo_id, concessionaria_id: v.concessionaria_id,
      valor_total: v.valor_total,
      forma_pagamento: v.forma_pagamento,
      data_venda: v.data_venda ? v.data_venda.slice(0, 10) : ''
    });
    const veiculo = veiculos.find(vc => vc.id === v.veiculo_id);
    setVeiculoSelecionado(veiculo);
    setError('');
    setModalOpen(true);
  }

  function onVeiculoChange(veiculoId) {
    setForm(prev => ({ ...prev, veiculo_id: veiculoId }));
    const veiculo = veiculos.find(v => v.id === Number(veiculoId));
    setVeiculoSelecionado(veiculo);
    if (veiculo && !editId) {
      setForm(prev => ({
        ...prev,
        veiculo_id: veiculoId,
        valor_total: veiculo.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
        concessionaria_id: prev.concessionaria_id || ''
      }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const payload = { ...form };
    if (!payload.cliente_id) { setError('Cliente é obrigatório'); return; }
    if (!payload.vendedor_id) { setError('Vendedor é obrigatório'); return; }
    if (!payload.veiculo_id) { setError('Veículo é obrigatório'); return; }
    if (!payload.concessionaria_id) { setError('Concessionária é obrigatória'); return; }
    if (!payload.valor_total) { setError('Valor total é obrigatório'); return; }
    payload.valor_total = parsePreco(payload.valor_total);
    if (payload.valor_total <= 0) { setError('Valor total deve ser maior que zero'); return; }
    if (!payload.data_venda) delete payload.data_venda;
    try {
      if (editId) {
        await vendasService.atualizar(editId, payload);
      } else {
        await vendasService.criar(payload);
      }
      setModalOpen(false);
      addToast(editId ? 'Venda atualizada com sucesso!' : 'Venda registrada com sucesso!');
      loadAll(search);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar');
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await vendasService.excluir(deleteTarget.id);
      setDeleteTarget(null);
      addToast('Venda removida com sucesso! Estoque do veículo restaurado.');
      loadAll(search);
    } catch (err) {
      addToast(err.response?.data?.error || 'Erro ao remover venda', 'error');
    }
  }

  function limparFiltros() {
    setFiltroPagamento('');
    setFiltroDataInicio('');
    setFiltroDataFim('');
  }

  const temFiltros = filtroPagamento || filtroDataInicio || filtroDataFim;

  const faturamentoFiltrado = filtrados.reduce((acc, v) => acc + v.valor_total, 0);

  if (loading && vendas.length === 0) return <Loading message="Carregando vendas..." />;

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <h3 className="fw-bold mb-0">Vendas</h3>
        <button className="btn btn-primary" onClick={openCreate}>
          <i className="bi bi-plus-lg me-1"></i> Nova Venda
        </button>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-2 align-items-end mb-3">
            <div className="col-md-5">
              <label className="form-label small text-muted fw-semibold">
                <i className="bi bi-search me-1"></i>Buscar
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Cliente, vendedor, veículo, concessionária..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label small text-muted fw-semibold">
                <i className="bi bi-funnel me-1"></i>Pagamento
              </label>
              <select className="form-select" value={filtroPagamento} onChange={e => setFiltroPagamento(e.target.value)}>
                <option value="">Todos</option>
                {formasPagamento.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label small text-muted fw-semibold">
                <i className="bi bi-calendar me-1"></i>Data início
              </label>
              <input type="date" className="form-control" value={filtroDataInicio} onChange={e => setFiltroDataInicio(e.target.value)} />
            </div>
            <div className="col-md-2">
              <label className="form-label small text-muted fw-semibold">
                <i className="bi bi-calendar me-1"></i>Data fim
              </label>
              <input type="date" className="form-control" value={filtroDataFim} onChange={e => setFiltroDataFim(e.target.value)} />
            </div>
            <div className="col-md-1">
              {temFiltros && (
                <button className="btn btn-outline-secondary w-100" onClick={limparFiltros} title="Limpar filtros">
                  <i className="bi bi-x-lg"></i>
                </button>
              )}
            </div>
          </div>

          <div className="row g-2">
            <div className="col-auto">
              <span className="badge bg-info bg-opacity-10 text-info px-3 py-2">
                <i className="bi bi-receipt me-1"></i>
                {filtrados.length} venda{filtrados.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="col-auto">
              <span className="badge bg-success bg-opacity-10 text-success px-3 py-2">
                <i className="bi bi-cash-stack me-1"></i>
                R$ {faturamentoFiltrado.toLocaleString('pt-BR')}
              </span>
            </div>
            {search && (
              <div className="col-auto">
                <span className="badge bg-warning bg-opacity-10 text-warning px-3 py-2">
                  <i className="bi bi-search me-1"></i>
                  Buscando: "{search}"
                </span>
              </div>
            )}
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
                  <th>Veículo</th>
                  <th>Cliente</th>
                  <th>Vendedor</th>
                  <th>Concessionária</th>
                  <th style={{ width: '130px' }}>Valor</th>
                  <th style={{ width: '110px' }}>Pagamento</th>
                  <th style={{ width: '100px' }}>Data</th>
                  <th style={{ width: '100px' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map(v => (
                  <tr key={v.id}>
                    <td className="text-muted">{v.id}</td>
                    <td className="fw-medium">{v.marca} {v.modelo}</td>
                    <td>{v.cliente_nome}</td>
                    <td>{v.vendedor_nome}</td>
                    <td>{v.concessionaria_nome}</td>
                    <td className="fw-semibold">R$ {v.valor_total.toLocaleString('pt-BR')}</td>
                    <td>
                      <span className={`badge rounded-pill px-3 py-1 ${
                        v.forma_pagamento === 'à vista' ? 'bg-success' :
                        v.forma_pagamento === 'financiamento' ? 'bg-primary' :
                        v.forma_pagamento === 'consórcio' ? 'bg-info text-dark' :
                        'bg-secondary'
                      }`}>
                        {v.forma_pagamento}
                      </span>
                    </td>
                    <td className="text-muted">
                      {new Date(v.data_venda).toLocaleDateString('pt-BR')}
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
                    <td colSpan="9" className="text-center py-5">
                      <i className="bi bi-cash-stack text-muted fs-1 d-block mb-2"></i>
                      <p className="text-muted mb-0">
                        {search || temFiltros
                          ? 'Nenhuma venda encontrada para esta busca.'
                          : 'Nenhuma venda registrada.'}
                      </p>
                      {!search && !temFiltros && (
                        <button className="btn btn-primary btn-sm mt-2" onClick={openCreate}>
                          <i className="bi bi-plus-lg me-1"></i> Registrar Primeira Venda
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
        title={editId ? 'Editar Venda' : 'Nova Venda'}
        error={error}
      >
        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label className="form-label fw-medium">Cliente <span className="text-danger">*</span></label>
            <select ref={nomeRef} className="form-select form-select-lg" value={form.cliente_id} onChange={e => setForm({ ...form, cliente_id: e.target.value })}>
              <option value="">Selecione...</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label fw-medium">Vendedor <span className="text-danger">*</span></label>
            <select className="form-select form-select-lg" value={form.vendedor_id} onChange={e => setForm({ ...form, vendedor_id: e.target.value })}>
              <option value="">Selecione...</option>
              {vendedores.map(v => <option key={v.id} value={v.id}>{v.nome}</option>)}
            </select>
          </div>
        </div>

        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label className="form-label fw-medium">Veículo <span className="text-danger">*</span></label>
            <select className="form-select form-select-lg" value={form.veiculo_id} onChange={e => onVeiculoChange(e.target.value)}>
              <option value="">Selecione...</option>
              {veiculos.filter(v => v.estoque > 0 || editId).map(v => (
                <option key={v.id} value={v.id}>
                  {v.marca} {v.modelo} ({v.ano}) — R$ {v.preco.toLocaleString('pt-BR')} [Est: {v.estoque}]
                </option>
              ))}
            </select>
            {veiculoSelecionado && (
              <div className="mt-2">
                <div className="d-flex gap-2">
                  <span className="badge bg-info text-dark">
                    <i className="bi bi-currency-dollar me-1"></i>
                    Preço: R$ {veiculoSelecionado.preco.toLocaleString('pt-BR')}
                  </span>
                  <span className={`badge ${veiculoSelecionado.estoque > 0 ? 'bg-success' : 'bg-danger'}`}>
                    <i className="bi bi-box me-1"></i>
                    Estoque: {veiculoSelecionado.estoque}
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="col-md-6">
            <label className="form-label fw-medium">Concessionária <span className="text-danger">*</span></label>
            <select className="form-select form-select-lg" value={form.concessionaria_id} onChange={e => setForm({ ...form, concessionaria_id: e.target.value })}>
              <option value="">Selecione...</option>
              {concessionarias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
        </div>

        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label className="form-label fw-medium">Valor Total <span className="text-danger">*</span></label>
            <div className="input-group input-group-lg">
              <span className="input-group-text fw-bold">R$</span>
              <input
                type="text"
                className="form-control form-control-lg"
                value={form.valor_total}
                onChange={e => setForm({ ...form, valor_total: formatPreco(e.target.value) })}
                placeholder="0,00"
              />
            </div>
          </div>
          <div className="col-md-6">
            <label className="form-label fw-medium">Forma de Pagamento</label>
            <select className="form-select form-select-lg" value={form.forma_pagamento} onChange={e => setForm({ ...form, forma_pagamento: e.target.value })}>
              {formasPagamento.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        </div>

        <div className="mb-2">
          <label className="form-label fw-medium">Data da Venda</label>
          <input
            type="date"
            className="form-control form-control-lg"
            value={form.data_venda}
            onChange={e => setForm({ ...form, data_venda: e.target.value })}
          />
          <div className="form-text text-muted">
            <i className="bi bi-info-circle me-1"></i>
            Se não informada, será usada a data atual.
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
                  Remover venda de <strong>{deleteTarget.marca} {deleteTarget.modelo}</strong>?
                </p>
                <p className="text-muted small mb-1">
                  Cliente: {deleteTarget.cliente_nome}
                </p>
                <p className="text-danger small mb-3">
                  <i className="bi bi-arrow-return me-1"></i>
                  O estoque do veículo será restaurado.
                </p>
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
