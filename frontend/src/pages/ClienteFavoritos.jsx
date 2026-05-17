import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import clienteDashboardService from '../services/clienteDashboardService';

export default function ClienteFavoritos() {
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removendo, setRemovendo] = useState(null);

  useEffect(() => {
    loadFavoritos();
  }, []);

  function loadFavoritos() {
    setLoading(true);
    clienteDashboardService.getFavoritos()
      .then(res => setFavoritos(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  async function handleRemover(veiculo_id) {
    setRemovendo(veiculo_id);
    try {
      await clienteDashboardService.removeFavorito(veiculo_id);
      setFavoritos(prev => prev.filter(f => f.veiculo_id !== veiculo_id));
    } catch {
      alert('Erro ao remover favorito');
    } finally {
      setRemovendo(null);
    }
  }

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
          <p className="text-muted">Carregando favoritos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cliente-favoritos">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h2 className="mb-0"><i className="bi bi-heart me-2"></i>Meus Favoritos</h2>
        <span className="badge bg-primary fs-6">{favoritos.length} veículo(s)</span>
      </div>

      {favoritos.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-heartbreak"></i>
          <h4>Nenhum favorito ainda</h4>
          <p>Explore nossos veículos e adicione seus favoritos.</p>
          <Link to="/" className="btn btn-primary">
            <i className="bi bi-search me-2"></i>Ver Veículos
          </Link>
        </div>
      ) : (
        <div className="row g-3">
          {favoritos.map(fav => (
            <div key={fav.id} className="col-lg-4 col-md-6">
              <div className="favorito-card">
                <div className="favorito-card-image">
                  <i className="bi bi-car-front-fill"></i>
                  <span className="favorito-card-categoria">{fav.categoria}</span>
                </div>
                <div className="favorito-card-body">
                  <h5 className="favorito-card-title">{fav.marca} {fav.modelo}</h5>
                  <div className="favorito-card-info">
                    <span><i className="bi bi-calendar me-1"></i>{fav.ano}</span>
                    <span><i className="bi bi-box me-1"></i>Estoque: {fav.estoque}</span>
                  </div>
                  <div className="favorito-card-preco">
                    {formatPreco(fav.preco)}
                  </div>
                  <button
                    className="btn btn-outline-danger w-100"
                    onClick={() => handleRemover(fav.veiculo_id)}
                    disabled={removendo === fav.veiculo_id}
                  >
                    {removendo === fav.veiculo_id ? (
                      <><span className="spinner-border spinner-border-sm me-2"></span>Removendo...</>
                    ) : (
                      <><i className="bi bi-heartbreak me-2"></i>Remover dos Favoritos</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
