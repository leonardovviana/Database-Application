import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import clienteDashboardService from '../services/clienteDashboardService';
import { useAuth } from '../contexts/AuthContext';

export default function ClienteDashboard() {
  const { usuario } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clienteDashboardService.getDashboard()
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function formatPreco(value) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="text-muted">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cliente-dashboard">
      <div className="cliente-dashboard-header">
        <div>
          <h2>Olá, {usuario?.nome}</h2>
          <p className="text-muted mb-0">Bem-vindo à sua área exclusiva</p>
        </div>
        <Link to="/cliente/perfil" className="btn btn-outline-primary">
          <i className="bi bi-pencil me-2"></i>Editar Perfil
        </Link>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="cliente-stat-card">
            <div className="cliente-stat-icon" style={{ background: 'linear-gradient(135deg, #0d6efd, #0a58ca)' }}>
              <i className="bi bi-heart-fill"></i>
            </div>
            <div className="cliente-stat-info">
              <span className="cliente-stat-value">{data?.total_favoritos || 0}</span>
              <span className="cliente-stat-label">Favoritos</span>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="cliente-stat-card">
            <div className="cliente-stat-icon" style={{ background: 'linear-gradient(135deg, #198754, #157347)' }}>
              <i className="bi bi-cart-check-fill"></i>
            </div>
            <div className="cliente-stat-info">
              <span className="cliente-stat-value">{data?.total_compras || 0}</span>
              <span className="cliente-stat-label">Compras</span>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="cliente-stat-card">
            <div className="cliente-stat-icon" style={{ background: 'linear-gradient(135deg, #fd7e14, #e36c0a)' }}>
              <i className="bi bi-star-fill"></i>
            </div>
            <div className="cliente-stat-info">
              <span className="cliente-stat-value">{data?.recomendados?.length || 0}</span>
              <span className="cliente-stat-label">Recomendados</span>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="cliente-card">
            <div className="cliente-card-header">
              <h5><i className="bi bi-star me-2"></i>Veículos Recomendados</h5>
            </div>
            <div className="cliente-card-body">
              {data?.recomendados?.length > 0 ? (
                <div className="row g-3">
                  {data.recomendados.map(v => (
                    <div key={v.id} className="col-md-6">
                      <div className="veiculo-mini-card">
                        <div className="veiculo-mini-icon">
                          <i className="bi bi-car-front-fill"></i>
                        </div>
                        <div className="veiculo-mini-info">
                          <h6>{v.marca} {v.modelo}</h6>
                          <span>{v.ano} - {formatPreco(v.preco)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted mb-0">Nenhum veículo disponível no momento.</p>
              )}
            </div>
          </div>

          {data?.historico?.length > 0 && (
            <div className="cliente-card mt-4">
              <div className="cliente-card-header">
                <h5><i className="bi bi-clock-history me-2"></i>Últimas Compras</h5>
              </div>
              <div className="cliente-card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead>
                      <tr>
                        <th>Veículo</th>
                        <th>Valor</th>
                        <th>Data</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.historico.map(venda => (
                        <tr key={venda.id}>
                          <td>{venda.marca} {venda.modelo} {venda.ano}</td>
                          <td>{formatPreco(venda.valor_total)}</td>
                          <td>{new Date(venda.data_venda).toLocaleDateString('pt-BR')}</td>
                          <td><span className="badge bg-success">Concluída</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="col-lg-5">
          {data?.favoritos?.length > 0 && (
            <div className="cliente-card">
              <div className="cliente-card-header">
                <h5><i className="bi bi-heart me-2"></i>Meus Favoritos</h5>
                <Link to="/cliente/favoritos" className="btn btn-sm btn-outline-primary">Ver Todos</Link>
              </div>
              <div className="cliente-card-body">
                {data.favoritos.slice(0, 4).map(fav => (
                  <div key={fav.id} className="favorito-item">
                    <div className="favorito-item-icon">
                      <i className="bi bi-car-front"></i>
                    </div>
                    <div className="favorito-item-info">
                      <strong>{fav.marca} {fav.modelo}</strong>
                      <span>{formatPreco(fav.preco)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="cliente-card mt-4">
            <div className="cliente-card-header">
              <h5><i className="bi bi-quick-reference me-2"></i>Ações Rápidas</h5>
            </div>
            <div className="cliente-card-body">
              <div className="d-grid gap-2">
                <Link to="/cliente/favoritos" className="btn btn-outline-primary">
                  <i className="bi bi-heart me-2"></i>Meus Favoritos
                </Link>
                <Link to="/cliente/perfil" className="btn btn-outline-primary">
                  <i className="bi bi-person me-2"></i>Editar Perfil
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
