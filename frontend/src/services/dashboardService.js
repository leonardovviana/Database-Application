import api from './api';

const dashboardService = {
  getStats() {
    return api.get('/dashboard');
  },

  getVendasMensais(params = {}) {
    return api.get('/dashboard/vendas-mensais', { params });
  },

  getVendasPorConcessionaria() {
    return api.get('/dashboard/vendas-concessionaria');
  },

  getFaturamentoPorCategoria() {
    return api.get('/dashboard/faturamento-categoria');
  },

  getRankingVendedores() {
    return api.get('/dashboard/ranking-vendedores');
  }
};

export default dashboardService;
