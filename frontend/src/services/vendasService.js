import api from './api';

const vendasService = {
  buscar(termo)   { return api.get(`/vendas/busca?q=${encodeURIComponent(termo)}`); },
  listar()       { return api.get('/vendas'); },
  buscarPorId(id) { return api.get(`/vendas/${id}`); },
  criar(data)    { return api.post('/vendas', data); },
  atualizar(id, data) { return api.put(`/vendas/${id}`, data); },
  excluir(id)    { return api.delete(`/vendas/${id}`); }
};

export default vendasService;
