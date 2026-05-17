import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { useToast } from '../contexts/ToastContext';
import StatsCard from '../components/StatsCard';
import Loading from '../components/Loading';
import dashboardService from '../services/dashboardService';

const COLORS = ['#0d6efd', '#198754', '#ffc107', '#dc3545', '#0dcaf0', '#6f42c1', '#fd7e14', '#20c997'];
const FORMATTER = new Intl.NumberFormat('pt-BR');

function formatMoney(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border rounded-2 shadow-sm p-3">
        <p className="fw-bold mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="mb-0 small" style={{ color: p.color }}>
            {p.name}: {p.name === 'faturamento' || p.name === 'Receita'
              ? formatMoney(p.value)
              : FORMATTER.format(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [monthlySales, setMonthlySales] = useState([]);
  const [vendasConcessionaria, setVendasConcessionaria] = useState([]);
  const [faturamentoCategoria, setFaturamentoCategoria] = useState([]);
  const [rankingVendedores, setRankingVendedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState('12');
  const { addToast } = useToast();

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      try {
        const [statsRes, salesRes, concRes, catRes, vendRes] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getVendasMensais({ periodo }),
          dashboardService.getVendasPorConcessionaria(),
          dashboardService.getFaturamentoPorCategoria(),
          dashboardService.getRankingVendedores()
        ]);
        setStats(statsRes.data);
        setMonthlySales((salesRes.data || []).reverse());
        setVendasConcessionaria(concRes.data || []);
        setFaturamentoCategoria(catRes.data || []);
        setRankingVendedores(vendRes.data || []);
      } catch (err) {
        addToast('Erro ao carregar dashboard', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [periodo]);

  if (loading) return <Loading message="Carregando dashboard..." />;

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div>
          <h3 className="fw-bold mb-1">Dashboard</h3>
          <p className="text-muted mb-0 small">
            <i className="bi bi-graph-up me-1"></i>
            Painel de Business Intelligence — MM Motors
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-calendar3 text-muted"></i>
          <select className="form-select form-select-sm" style={{ width: 'auto' }} value={periodo} onChange={e => setPeriodo(e.target.value)}>
            <option value="3">Últimos 3 meses</option>
            <option value="6">Últimos 6 meses</option>
            <option value="12">Últimos 12 meses</option>
          </select>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <StatsCard
            title="Faturamento Total"
            value={formatMoney(stats?.faturamento_total || 0)}
            icon="bi-graph-up-arrow"
            color="success"
            subtitle={stats?.total_vendas + ' vendas realizadas'}
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatsCard
            title="Veículos Vendidos"
            value={stats?.total_veiculos_vendidos || 0}
            icon="bi-cart-check"
            color="primary"
            subtitle={stats?.total_veiculos_estoque + ' em estoque'}
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatsCard
            title="Melhor Vendedor"
            value={stats?.melhor_vendedor?.nome || '—'}
            icon="bi-trophy"
            color="warning"
            subtitle={stats?.melhor_vendedor
              ? stats.melhor_vendedor.total_vendas + ' vendas · ' + formatMoney(stats.melhor_vendedor.faturamento)
              : 'Sem vendas'}
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatsCard
            title="Melhor Concessionária"
            value={stats?.melhor_concessionaria?.nome || '—'}
            icon="bi-building"
            color="info"
            subtitle={stats?.melhor_concessionaria
              ? stats.melhor_concessionaria.total_vendas + ' vendas · ' + formatMoney(stats.melhor_concessionaria.faturamento)
              : 'Sem vendas'}
          />
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-2">
          <StatsCard
            title="Clientes"
            value={stats?.total_clientes || 0}
            icon="bi-people"
            color="primary"
          />
        </div>
        <div className="col-sm-6 col-xl-2">
          <StatsCard
            title="Vendedores"
            value={stats?.total_vendedores || 0}
            icon="bi-person-badge"
            color="secondary"
          />
        </div>
        <div className="col-sm-6 col-xl-2">
          <StatsCard
            title="Concessionárias"
            value={stats?.total_concessionarias || 0}
            icon="bi-building"
            color="dark"
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatsCard
            title="Total Vendas"
            value={stats?.total_vendas || 0}
            icon="bi-receipt"
            color="success"
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatsCard
            title="Veículos em Estoque"
            value={stats?.total_veiculos_estoque || 0}
            icon="bi-car-front-fill"
            color="danger"
          />
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center py-3">
              <h5 className="fw-bold mb-0">
                <i className="bi bi-bar-chart-fill me-2 text-primary"></i>
                Receita Mensal
              </h5>
              {monthlySales.length > 0 && (
                <span className="badge bg-primary bg-opacity-10 text-primary">
                  Total: {formatMoney(monthlySales.reduce((a, b) => a + b.faturamento, 0))}
                </span>
              )}
            </div>
            <div className="card-body">
              {monthlySales.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={monthlySales} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={v => 'R$' + FORMATTER.format(v / 1000) + 'k'} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="faturamento" name="Receita" fill="#0d6efd" radius={[6, 6, 0, 0]} maxBarSize={50}>
                      {monthlySales.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-bar-chart fs-1 d-block mb-2"></i>
                  Nenhuma venda registrada.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom py-3">
              <h5 className="fw-bold mb-0">
                <i className="bi bi-pie-chart-fill me-2 text-success"></i>
                Faturamento por Categoria
              </h5>
            </div>
            <div className="card-body d-flex flex-column">
              {faturamentoCategoria.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={faturamentoCategoria}
                        dataKey="faturamento"
                        nameKey="categoria"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                      >
                        {faturamentoCategoria.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={v => formatMoney(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-auto">
                    {faturamentoCategoria.slice(0, 5).map((item, i) => (
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
                  <i className="bi bi-pie-chart fs-1 d-block mb-2"></i>
                  Sem dados.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom py-3">
              <h5 className="fw-bold mb-0">
                <i className="bi bi-building me-2 text-info"></i>
                Vendas por Concessionária
              </h5>
            </div>
            <div className="card-body">
              {vendasConcessionaria.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={vendasConcessionaria} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={v => FORMATTER.format(v)} />
                    <YAxis type="category" dataKey="concessionaria" tick={{ fontSize: 12 }} width={140} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="total_vendas" name="Vendas" fill="#0dcaf0" radius={[0, 6, 6, 0]} maxBarSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-building fs-1 d-block mb-2"></i>
                  Sem dados.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom py-3">
              <h5 className="fw-bold mb-0">
                <i className="bi bi-trophy me-2 text-warning"></i>
                Ranking de Vendedores
              </h5>
            </div>
            <div className="card-body">
              {rankingVendedores.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-borderless mb-0 align-middle">
                    <thead className="table-light small">
                      <tr>
                        <th style={{ width: 30 }}>#</th>
                        <th>Vendedor</th>
                        <th>Concessionária</th>
                        <th className="text-end">Vendas</th>
                        <th className="text-end">Faturamento</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rankingVendedores.map((v, i) => (
                        <tr key={v.nome}>
                          <td className="fw-bold text-muted">{i + 1}</td>
                          <td className="fw-medium">
                            {i === 0 && <i className="bi bi-trophy-fill text-warning me-1"></i>}
                            {v.nome}
                          </td>
                          <td className="text-muted small">{v.concessionaria}</td>
                          <td className="text-end">{v.total_vendas}</td>
                          <td className="text-end fw-semibold">{formatMoney(v.faturamento)}</td>
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
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom py-3">
              <h5 className="fw-bold mb-0">
                <i className="bi bi-box-seam me-2 text-danger"></i>
                Veículos por Categoria
              </h5>
            </div>
            <div className="card-body">
              {stats?.veiculos_por_categoria?.length > 0 ? (
                <div className="row g-3">
                  {stats.veiculos_por_categoria.map((cat, i) => (
                    <div key={cat.categoria} className="col-md-3 col-6">
                      <div className="d-flex align-items-center gap-3 p-3 rounded-3" style={{ backgroundColor: COLORS[i % COLORS.length] + '15' }}>
                        <div className="rounded-circle d-flex align-items-center justify-content-center"
                             style={{ width: 44, height: 44, backgroundColor: COLORS[i % COLORS.length] + '25' }}>
                          <i className="bi bi-car-front text-dark" style={{ color: COLORS[i % COLORS.length] }}></i>
                        </div>
                        <div className="min-width-0">
                          <small className="text-muted d-block text-truncate">{cat.categoria}</small>
                          <h5 className="mb-0 fw-bold">{cat.total_estoque}</h5>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-center mb-0 py-3">Nenhum veículo cadastrado.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
