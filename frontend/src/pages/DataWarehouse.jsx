import { useEffect, useState } from 'react';
import Loading from '../components/Loading';
import StatsCard from '../components/StatsCard';
import dashboardService from '../services/dashboardService';
import { useToast } from '../contexts/ToastContext';

function formatDate(value) {
  if (!value) return 'Sem carga';
  return new Date(value.replace(' ', 'T')).toLocaleString('pt-BR');
}

function TableBadge({ label, value, tone = 'primary' }) {
  return (
    <div className="d-flex justify-content-between align-items-center border rounded-2 px-3 py-2 bg-white">
      <span className="fw-semibold small">
        <i className={`bi bi-table me-2 text-${tone}`}></i>
        {label}
      </span>
      <span className={`badge bg-${tone} bg-opacity-10 text-${tone}`}>{value}</span>
    </div>
  );
}

export default function DataWarehouse() {
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { addToast } = useToast();

  async function loadMetadata() {
    try {
      const res = await dashboardService.getDataWarehouse();
      setMetadata(res.data);
    } catch (_) {
      addToast('Erro ao carregar Data Warehouse', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function refreshWarehouse() {
    setRefreshing(true);
    try {
      const res = await dashboardService.refreshDataWarehouse();
      setMetadata(res.data.metadata);
      addToast('Carga ETL executada com sucesso', 'success');
    } catch (_) {
      addToast('Erro ao atualizar Data Warehouse', 'error');
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadMetadata();
  }, []);

  if (loading) return <Loading message="Carregando Data Warehouse..." />;

  const tabelas = metadata?.tabelas || {};
  const ultimaCarga = metadata?.ultima_carga;

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div>
          <h3 className="fw-bold mb-1">Data Warehouse</h3>
          <p className="text-muted mb-0 small">
            <i className="bi bi-diagram-3 me-1"></i>
            Modelo estrela para análises históricas de vendas
          </p>
        </div>
        <button className="btn btn-primary" onClick={refreshWarehouse} disabled={refreshing}>
          <i className={`bi ${refreshing ? 'bi-arrow-repeat' : 'bi-database-check'} me-1`}></i>
          {refreshing ? 'Atualizando...' : 'Executar ETL'}
        </button>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <StatsCard
            title="Fato Vendas"
            value={tabelas.fato_vendas || 0}
            icon="bi-receipt-cutoff"
            color="success"
            subtitle="Grão: uma linha por venda"
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatsCard
            title="Dimensões"
            value="5"
            icon="bi-boxes"
            color="primary"
            subtitle={`${ultimaCarga?.total_dimensoes || 0} registros dimensionais`}
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatsCard
            title="Última Carga"
            value={ultimaCarga ? `#${ultimaCarga.id}` : '—'}
            icon="bi-clock-history"
            color="warning"
            subtitle={formatDate(ultimaCarga?.executado_em)}
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatsCard
            title="Status ETL"
            value={ultimaCarga?.status || '—'}
            icon="bi-check2-circle"
            color="info"
            subtitle="Extração, transformação e carga"
          />
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom py-3">
              <h5 className="fw-bold mb-0">
                <i className="bi bi-stars me-2 text-primary"></i>
                Modelo Estrela
              </h5>
            </div>
            <div className="card-body">
              <div className="dw-star-grid">
                <div className="dw-dim dim-top">dw_dim_tempo</div>
                <div className="dw-dim dim-left">dw_dim_cliente</div>
                <div className="dw-fact">
                  <i className="bi bi-database-fill fs-2 text-success d-block mb-2"></i>
                  <strong>dw_fato_vendas</strong>
                  <small>valor_total · quantidade · forma_pagamento</small>
                </div>
                <div className="dw-dim dim-right">dw_dim_veiculo</div>
                <div className="dw-dim dim-bottom-left">dw_dim_vendedor</div>
                <div className="dw-dim dim-bottom-right">dw_dim_concessionaria</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom py-3">
              <h5 className="fw-bold mb-0">
                <i className="bi bi-list-check me-2 text-success"></i>
                Tabelas Carregadas
              </h5>
            </div>
            <div className="card-body d-grid gap-2">
              <TableBadge label="dw_dim_tempo" value={tabelas.dim_tempo || 0} tone="primary" />
              <TableBadge label="dw_dim_cliente" value={tabelas.dim_cliente || 0} tone="info" />
              <TableBadge label="dw_dim_veiculo" value={tabelas.dim_veiculo || 0} tone="danger" />
              <TableBadge label="dw_dim_vendedor" value={tabelas.dim_vendedor || 0} tone="warning" />
              <TableBadge label="dw_dim_concessionaria" value={tabelas.dim_concessionaria || 0} tone="secondary" />
              <TableBadge label="dw_fato_vendas" value={tabelas.fato_vendas || 0} tone="success" />
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-bottom py-3">
          <h5 className="fw-bold mb-0">
            <i className="bi bi-arrow-left-right me-2 text-primary"></i>
            Fluxo ETL
          </h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="dw-step">
                <span className="dw-step-number">1</span>
                <h6>Extração</h6>
                <p>Os dados saem das tabelas operacionais de clientes, veículos, vendedores, concessionárias e vendas.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="dw-step">
                <span className="dw-step-number">2</span>
                <h6>Transformação</h6>
                <p>Datas, categorias e entidades de negócio são padronizadas em dimensões para consulta histórica.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="dw-step">
                <span className="dw-step-number">3</span>
                <h6>Carga</h6>
                <p>A tabela fato recebe as métricas de venda e passa a alimentar dashboard e relatórios analíticos.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
