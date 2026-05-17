import { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import Loading from '../components/Loading';
import reportsService from '../services/reportsService';
import concessionariasService from '../services/concessionariasService';
import vendedoresService from '../services/vendedoresService';

const COLORS = ['#0d6efd', '#198754', '#ffc107', '#dc3545', '#0dcaf0', '#6f42c1', '#fd7e14', '#20c997'];
const CATEGORIAS = ['Sedã', 'SUV', 'Hatch', 'Picape', 'Esportivo', 'Utilitário', 'Coupé', 'Conversível'];

function formatMoney(value) {
  return (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmt(value) {
  return (value || 0).toLocaleString('pt-BR');
}

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border rounded-2 shadow-sm p-3">
        <p className="fw-bold mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="mb-0 small" style={{ color: p.color }}>
            {p.name}: {p.name === 'faturamento' || p.name === 'Receita' || p.name === 'Faturamento'
              ? formatMoney(p.value) : fmt(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

function ReportCard({ title, icon, color, children, extra }) {
  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center py-3">
        <h5 className="fw-bold mb-0">
          <i className={`bi ${icon} me-2 text-${color}`}></i>
          {title}
        </h5>
        {extra}
      </div>
      <div className="card-body">
        {children}
      </div>
    </div>
  );
}

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [concessionarias, setConcessionarias] = useState([]);
  const [vendedores, setVendedores] = useState([]);

  const [filters, setFilters] = useState({
    ano: '', concessionaria_id: '', vendedor_id: '', categoria: '',
    periodo_inicio: '', periodo_fim: ''
  });

  const [vendasMensais, setVendasMensais] = useState([]);
  const [vendasAnuais, setVendasAnuais] = useState([]);
  const [receitaAnual, setReceitaAnual] = useState([]);
  const [melhorVendedor, setMelhorVendedor] = useState([]);
  const [melhorConcessionaria, setMelhorConcessionaria] = useState([]);
  const [veiculosMaisVendidos, setVeiculosMaisVendidos] = useState([]);
  const [vendasPorCidade, setVendasPorCidade] = useState([]);
  const [vendasPorCategoria, setVendasPorCategoria] = useState([]);

  const anos = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  const loadFilters = useCallback(async () => {
    try {
      const [cc, vv] = await Promise.all([
        concessionariasService.listar(),
        vendedoresService.listar()
      ]);
      setConcessionarias(cc.data);
      setVendedores(vv.data);
    } catch (_) {}
  }, []);

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const f = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''));
      const [
        r1, r2, r3, r4, r5, r6, r7, r8
      ] = await Promise.all([
        reportsService.vendasMensais(f),
        reportsService.vendasAnuais(f),
        reportsService.receitaAnual(f),
        reportsService.melhorVendedor(f),
        reportsService.melhorConcessionaria(f),
        reportsService.veiculosMaisVendidos(f),
        reportsService.vendasPorCidade(f),
        reportsService.vendasPorCategoria(f)
      ]);
      setVendasMensais(r1.data || []);
      setVendasAnuais(r2.data || []);
      setReceitaAnual(r3.data || []);
      setMelhorVendedor(r4.data || []);
      setMelhorConcessionaria(r5.data || []);
      setVeiculosMaisVendidos(r6.data || []);
      setVendasPorCidade(r7.data || []);
      setVendasPorCategoria(r8.data || []);
    } catch (_) {}
    setLoading(false);
  }, [filters]);

  useEffect(() => { loadFilters(); }, [loadFilters]);
  useEffect(() => { loadReports(); }, [loadReports]);

  function limparFiltros() {
    setFilters({ ano: '', concessionaria_id: '', vendedor_id: '', categoria: '', periodo_inicio: '', periodo_fim: '' });
  }

  const temFiltros = Object.values(filters).some(v => v !== '');

  function gerarFiltrosDescricao() {
    const partes = [];
    if (filters.ano) partes.push(`Ano: ${filters.ano}`);
    if (filters.concessionaria_id) {
      const c = concessionarias.find(x => x.id === Number(filters.concessionaria_id));
      if (c) partes.push(`Concessionária: ${c.nome}`);
    }
    if (filters.vendedor_id) {
      const v = vendedores.find(x => x.id === Number(filters.vendedor_id));
      if (v) partes.push(`Vendedor: ${v.nome}`);
    }
    if (filters.categoria) partes.push(`Categoria: ${filters.categoria}`);
    if (filters.periodo_inicio) partes.push(`De: ${filters.periodo_inicio}`);
    if (filters.periodo_fim) partes.push(`Até: ${filters.periodo_fim}`);
    return partes.length ? partes.join(' | ') : 'Sem filtros';
  }

  function exportarExcel() {
    const wb = XLSX.utils.book_new();

    function addSheet(data, columns, name) {
      if (!data || data.length === 0) return;
      const ws = XLSX.utils.json_to_sheet(data.map(row => {
        const obj = {};
        columns.forEach(col => { obj[col.header] = row[col.key]; });
        return obj;
      }));
      XLSX.utils.book_append_sheet(wb, ws, name);
    }

    addSheet(vendasMensais.map(m => ({ ...m, faturamento: Number(m.faturamento) })), [
      { key: 'mes', header: 'Mês' },
      { key: 'total_vendas', header: 'Vendas' },
      { key: 'faturamento', header: 'Faturamento' }
    ], 'Vendas Mensais');

    addSheet(vendasAnuais.map(m => ({ ...m, faturamento: Number(m.faturamento) })), [
      { key: 'ano', header: 'Ano' },
      { key: 'total_vendas', header: 'Vendas' },
      { key: 'faturamento', header: 'Faturamento' }
    ], 'Vendas Anuais');

    addSheet(receitaAnual.map(m => ({ ...m, receita: Number(m.receita), ticket_medio: Number(m.ticket_medio) })), [
      { key: 'ano', header: 'Ano' },
      { key: 'receita', header: 'Receita' },
      { key: 'total_vendas', header: 'Vendas' },
      { key: 'ticket_medio', header: 'Ticket Médio' }
    ], 'Receita Anual');

    addSheet(melhorVendedor, [
      { key: 'nome', header: 'Vendedor' },
      { key: 'concessionaria', header: 'Concessionária' },
      { key: 'total_vendas', header: 'Vendas' },
      { key: 'faturamento', header: 'Faturamento' }
    ], 'Melhores Vendedores');

    addSheet(melhorConcessionaria, [
      { key: 'nome', header: 'Concessionária' },
      { key: 'cidade', header: 'Cidade' },
      { key: 'total_vendas', header: 'Vendas' },
      { key: 'faturamento', header: 'Faturamento' }
    ], 'Melhores Concessionárias');

    addSheet(veiculosMaisVendidos, [
      { key: 'marca', header: 'Marca' },
      { key: 'modelo', header: 'Modelo' },
      { key: 'categoria', header: 'Categoria' },
      { key: 'total_vendido', header: 'Vendidos' },
      { key: 'faturamento_total', header: 'Faturamento' }
    ], 'Veículos Mais Vendidos');

    addSheet(vendasPorCidade, [
      { key: 'cidade', header: 'Cidade' },
      { key: 'total_vendas', header: 'Vendas' },
      { key: 'faturamento', header: 'Faturamento' }
    ], 'Vendas por Cidade');

    addSheet(vendasPorCategoria, [
      { key: 'categoria', header: 'Categoria' },
      { key: 'total_vendas', header: 'Vendas' },
      { key: 'faturamento', header: 'Faturamento' }
    ], 'Vendas por Categoria');

    if (wb.SheetNames.length === 0) {
      alert('Nenhum dado para exportar.');
      return;
    }

    XLSX.writeFile(wb, `relatorios_mm_motors_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  function exportarPDF() {
    const doc = new jsPDF('landscape', 'mm', 'a4');
    const pageW = doc.internal.pageSize.getWidth();
    let y = 20;

    doc.setFontSize(16);
    doc.text('Relatórios MM Motors', pageW / 2, y, { align: 'center' });
    y += 8;
    doc.setFontSize(9);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, pageW / 2, y, { align: 'center' });
    y += 5;
    doc.text(`Filtros: ${gerarFiltrosDescricao()}`, pageW / 2, y, { align: 'center' });
    y += 10;

    function addTable(title, columns, data, startY) {
      if (!data || data.length === 0) return startY;
      if (startY > 250) {
        doc.addPage();
        startY = 20;
      }
      doc.setFontSize(12);
      doc.text(title, 14, startY);
      startY += 6;
      doc.autoTable({
        startY,
        head: [columns.map(c => c.header)],
        body: data.map(row => columns.map(c => {
          const val = row[c.key];
          if (c.fmt === 'money') return formatMoney(val);
          return String(val ?? '');
        })),
        theme: 'grid',
        headStyles: { fillColor: [13, 110, 253], fontSize: 9 },
        bodyStyles: { fontSize: 8 },
        margin: { left: 14, right: 14 }
      });
      return doc.lastAutoTable.finalY + 10;
    }

    const colsText = [
      { key: 'mes', header: 'Mês' },
      { key: 'total_vendas', header: 'Vendas' },
      { key: 'faturamento', header: 'Faturamento', fmt: 'money' }
    ];
    y = addTable('Vendas Mensais', colsText, vendasMensais, y);

    y = addTable('Vendas Anuais', [
      { key: 'ano', header: 'Ano' },
      { key: 'total_vendas', header: 'Vendas' },
      { key: 'faturamento', header: 'Faturamento', fmt: 'money' }
    ], vendasAnuais, y);

    y = addTable('Receita Anual', [
      { key: 'ano', header: 'Ano' },
      { key: 'receita', header: 'Receita', fmt: 'money' },
      { key: 'total_vendas', header: 'Vendas' },
      { key: 'ticket_medio', header: 'Ticket Médio', fmt: 'money' }
    ], receitaAnual, y);

    y = addTable('Melhores Vendedores', [
      { key: 'nome', header: 'Vendedor' },
      { key: 'concessionaria', header: 'Concessionária' },
      { key: 'total_vendas', header: 'Vendas' },
      { key: 'faturamento', header: 'Faturamento', fmt: 'money' }
    ], melhorVendedor, y);

    y = addTable('Melhores Concessionárias', [
      { key: 'nome', header: 'Concessionária' },
      { key: 'cidade', header: 'Cidade' },
      { key: 'total_vendas', header: 'Vendas' },
      { key: 'faturamento', header: 'Faturamento', fmt: 'money' }
    ], melhorConcessionaria, y);

    y = addTable('Veículos Mais Vendidos', [
      { key: 'marca', header: 'Marca' },
      { key: 'modelo', header: 'Modelo' },
      { key: 'categoria', header: 'Categoria' },
      { key: 'total_vendido', header: 'Vendidos' },
      { key: 'faturamento_total', header: 'Faturamento', fmt: 'money' }
    ], veiculosMaisVendidos, y);

    y = addTable('Vendas por Cidade', [
      { key: 'cidade', header: 'Cidade' },
      { key: 'total_vendas', header: 'Vendas' },
      { key: 'faturamento', header: 'Faturamento', fmt: 'money' }
    ], vendasPorCidade, y);

    y = addTable('Vendas por Categoria', [
      { key: 'categoria', header: 'Categoria' },
      { key: 'total_vendas', header: 'Vendas' },
      { key: 'faturamento', header: 'Faturamento', fmt: 'money' }
    ], vendasPorCategoria, y);

    doc.save(`relatorios_mm_motors_${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  if (loading) return <Loading message="Carregando relatórios..." />;

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div>
          <h3 className="fw-bold mb-1">Relatórios e Análises</h3>
          <p className="text-muted mb-0 small">
            <i className="bi bi-file-earmark-bar-graph me-1"></i>
            Visualização detalhada de dados com filtros e exportação
          </p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-success" onClick={exportarExcel} disabled={loading}>
            <i className="bi bi-file-earmark-excel me-1"></i> Excel
          </button>
          <button className="btn btn-danger" onClick={exportarPDF} disabled={loading}>
            <i className="bi bi-file-earmark-pdf me-1"></i> PDF
          </button>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-2 align-items-end">
            <div className="col-md-2">
              <label className="form-label small text-muted fw-semibold">Ano</label>
              <select className="form-select" value={filters.ano} onChange={e => setFilters(f => ({ ...f, ano: e.target.value }))}>
                <option value="">Todos</option>
                {anos.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label small text-muted fw-semibold">Concessionária</label>
              <select className="form-select" value={filters.concessionaria_id} onChange={e => setFilters(f => ({ ...f, concessionaria_id: e.target.value }))}>
                <option value="">Todas</option>
                {concessionarias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label small text-muted fw-semibold">Vendedor</label>
              <select className="form-select" value={filters.vendedor_id} onChange={e => setFilters(f => ({ ...f, vendedor_id: e.target.value }))}>
                <option value="">Todos</option>
                {vendedores.map(v => <option key={v.id} value={v.id}>{v.nome}</option>)}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label small text-muted fw-semibold">Categoria</label>
              <select className="form-select" value={filters.categoria} onChange={e => setFilters(f => ({ ...f, categoria: e.target.value }))}>
                <option value="">Todas</option>
                {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label small text-muted fw-semibold">De</label>
              <input type="date" className="form-control" value={filters.periodo_inicio} onChange={e => setFilters(f => ({ ...f, periodo_inicio: e.target.value }))} />
            </div>
            <div className="col-md-2">
              <label className="form-label small text-muted fw-semibold">Até</label>
              <input type="date" className="form-control" value={filters.periodo_fim} onChange={e => setFilters(f => ({ ...f, periodo_fim: e.target.value }))} />
            </div>
          </div>
          {temFiltros && (
            <div className="mt-2 d-flex gap-2">
              <button className="btn btn-sm btn-outline-secondary" onClick={limparFiltros}>
                <i className="bi bi-x-lg me-1"></i>Limpar Filtros
              </button>
              <small className="text-muted align-self-center">
                <i className="bi bi-funnel me-1"></i>
                {gerarFiltrosDescricao()}
              </small>
            </div>
          )}
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-lg-6">
          <ReportCard title="Vendas Mensais" icon="bi-bar-chart-fill" color="primary"
            extra={vendasMensais.length > 0 && (
              <span className="badge bg-primary bg-opacity-10 text-primary">
                Total: {formatMoney(vendasMensais.reduce((a, b) => a + b.faturamento, 0))}
              </span>
            )}
          >
            {vendasMensais.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[...vendasMensais].reverse()} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => 'R$' + fmt(v / 1000) + 'k'} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="faturamento" name="Faturamento" fill="#0d6efd" radius={[6, 6, 0, 0]} maxBarSize={50}>
                    {vendasMensais.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-5 text-muted">
                <i className="bi bi-bar-chart fs-1 d-block mb-2"></i>
                Nenhum dado para o período.
              </div>
            )}
          </ReportCard>
        </div>

        <div className="col-lg-6">
          <ReportCard title="Vendas Anuais" icon="bi-bar-chart-steps" color="success"
            extra={vendasAnuais.length > 0 && (
              <span className="badge bg-success bg-opacity-10 text-success">
                Total: {formatMoney(vendasAnuais.reduce((a, b) => a + b.faturamento, 0))}
              </span>
            )}
          >
            {vendasAnuais.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[...vendasAnuais].reverse()} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="ano" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => 'R$' + fmt(v / 1000) + 'k'} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="faturamento" name="Faturamento" fill="#198754" radius={[6, 6, 0, 0]} maxBarSize={60}>
                    {vendasAnuais.map((_, i) => (
                      <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-5 text-muted">
                <i className="bi bi-bar-chart-steps fs-1 d-block mb-2"></i>
                Nenhum dado para o período.
              </div>
            )}
          </ReportCard>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-lg-6">
          <ReportCard title="Receita Anual" icon="bi-cash-stack" color="warning">
            {receitaAnual.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-hover mb-0 align-middle">
                  <thead className="table-light small">
                    <tr>
                      <th>Ano</th>
                      <th className="text-end">Receita</th>
                      <th className="text-end">Vendas</th>
                      <th className="text-end">Ticket Médio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receitaAnual.map(r => (
                      <tr key={r.ano}>
                        <td className="fw-bold">{r.ano}</td>
                        <td className="text-end fw-semibold text-success">{formatMoney(r.receita)}</td>
                        <td className="text-end">{r.total_vendas}</td>
                        <td className="text-end">{formatMoney(r.ticket_medio)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4 text-muted">
                <i className="bi bi-cash-stack fs-1 d-block mb-2"></i>
                Nenhum dado disponível.
              </div>
            )}
          </ReportCard>
        </div>

        <div className="col-lg-3">
          <ReportCard title="Melhores Vendedores" icon="bi-trophy" color="warning">
            {melhorVendedor.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-borderless mb-0 align-middle">
                  <thead className="table-light small">
                    <tr>
                      <th style={{ width: 30 }}>#</th>
                      <th>Nome</th>
                      <th className="text-end">Vendas</th>
                      <th className="text-end">Faturamento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {melhorVendedor.map((v, i) => (
                      <tr key={v.nome}>
                        <td className="fw-bold text-muted">{i + 1}</td>
                        <td className="fw-medium">
                          {i === 0 && <i className="bi bi-trophy-fill text-warning me-1"></i>}
                          {v.nome}
                        </td>
                        <td className="text-end">{v.total_vendas}</td>
                        <td className="text-end fw-semibold small">{formatMoney(v.faturamento)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4 text-muted">
                <i className="bi bi-trophy fs-1 d-block mb-2"></i>
                Sem dados.
              </div>
            )}
          </ReportCard>
        </div>

        <div className="col-lg-3">
          <ReportCard title="Melhores Concessionárias" icon="bi-building" color="info">
            {melhorConcessionaria.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-borderless mb-0 align-middle">
                  <thead className="table-light small">
                    <tr>
                      <th>#</th>
                      <th>Concessionária</th>
                      <th className="text-end">Vendas</th>
                      <th className="text-end">Faturamento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {melhorConcessionaria.map((c, i) => (
                      <tr key={c.nome}>
                        <td className="fw-bold text-muted">{i + 1}</td>
                        <td className="fw-medium">{c.nome}</td>
                        <td className="text-end">{c.total_vendas}</td>
                        <td className="text-end fw-semibold small">{formatMoney(c.faturamento)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4 text-muted">
                <i className="bi bi-building fs-1 d-block mb-2"></i>
                Sem dados.
              </div>
            )}
          </ReportCard>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-lg-4">
          <ReportCard title="Veículos Mais Vendidos" icon="bi-car-front" color="danger">
            {veiculosMaisVendidos.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-borderless mb-0 align-middle">
                  <thead className="table-light small">
                    <tr>
                      <th>#</th>
                      <th>Veículo</th>
                      <th className="text-end">Vendidos</th>
                      <th className="text-end">Faturamento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {veiculosMaisVendidos.map((v, i) => (
                      <tr key={`${v.marca}-${v.modelo}`}>
                        <td className="fw-bold text-muted">{i + 1}</td>
                        <td className="fw-medium small">{v.marca} {v.modelo}</td>
                        <td className="text-end">{v.total_vendido}</td>
                        <td className="text-end fw-semibold small">{formatMoney(v.faturamento_total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4 text-muted">
                <i className="bi bi-car-front fs-1 d-block mb-2"></i>
                Sem dados.
              </div>
            )}
          </ReportCard>
        </div>

        <div className="col-lg-4">
          <ReportCard title="Vendas por Cidade" icon="bi-geo-alt" color="secondary">
            {vendasPorCidade.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-borderless mb-0 align-middle">
                  <thead className="table-light small">
                    <tr>
                      <th>#</th>
                      <th>Cidade</th>
                      <th className="text-end">Vendas</th>
                      <th className="text-end">Faturamento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendasPorCidade.map((c, i) => (
                      <tr key={c.cidade}>
                        <td className="fw-bold text-muted">{i + 1}</td>
                        <td className="fw-medium">{c.cidade}</td>
                        <td className="text-end">{c.total_vendas}</td>
                        <td className="text-end fw-semibold small">{formatMoney(c.faturamento)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4 text-muted">
                <i className="bi bi-geo-alt fs-1 d-block mb-2"></i>
                Sem dados.
              </div>
            )}
          </ReportCard>
        </div>

        <div className="col-lg-4">
          <ReportCard title="Vendas por Categoria" icon="bi-tags" color="purple">
            {vendasPorCategoria.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={vendasPorCategoria}
                      dataKey="faturamento"
                      nameKey="categoria"
                      cx="50%" cy="50%"
                      innerRadius={50} outerRadius={80}
                      paddingAngle={3}
                    >
                      {vendasPorCategoria.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={v => formatMoney(v)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2">
                  {vendasPorCategoria.map((item, i) => (
                    <div key={item.categoria} className="d-flex justify-content-between align-items-center small mb-1">
                      <span className="d-flex align-items-center gap-2">
                        <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: COLORS[i % COLORS.length], display: 'inline-block' }}></span>
                        {item.categoria}
                      </span>
                      <span className="fw-semibold">{formatMoney(item.faturamento)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-4 text-muted">
                <i className="bi bi-tags fs-1 d-block mb-2"></i>
                Sem dados.
              </div>
            )}
          </ReportCard>
        </div>
      </div>
    </div>
  );
}
