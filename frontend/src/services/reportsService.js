import api from './api';

function buildParams(filters) {
  const params = {};
  if (filters.ano) params.ano = filters.ano;
  if (filters.categoria) params.categoria = filters.categoria;
  if (filters.concessionaria_id) params.concessionaria_id = filters.concessionaria_id;
  if (filters.vendedor_id) params.vendedor_id = filters.vendedor_id;
  if (filters.periodo_inicio) params.periodo_inicio = filters.periodo_inicio;
  if (filters.periodo_fim) params.periodo_fim = filters.periodo_fim;
  return { params };
}

const reportsService = {
  vendasMensais(filters = {}) {
    return api.get('/relatorios/vendas-mensais', buildParams(filters));
  },
  vendasAnuais(filters = {}) {
    return api.get('/relatorios/vendas-anuais', buildParams(filters));
  },
  receitaAnual(filters = {}) {
    return api.get('/relatorios/receita-anual', buildParams(filters));
  },
  melhorVendedor(filters = {}) {
    return api.get('/relatorios/melhor-vendedor', buildParams(filters));
  },
  melhorConcessionaria(filters = {}) {
    return api.get('/relatorios/melhor-concessionaria', buildParams(filters));
  },
  veiculosMaisVendidos(filters = {}) {
    return api.get('/relatorios/veiculos-mais-vendidos', buildParams(filters));
  },
  vendasPorCidade(filters = {}) {
    return api.get('/relatorios/vendas-por-cidade', buildParams(filters));
  },
  vendasPorCategoria(filters = {}) {
    return api.get('/relatorios/vendas-por-categoria', buildParams(filters));
  }
};

export default reportsService;
