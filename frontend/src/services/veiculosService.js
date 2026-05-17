import api from './api';

const veiculosService = {
  buscar(termo) {
    return api.get(`/veiculos/busca?q=${encodeURIComponent(termo)}`);
  },

  listar() {
    return api.get('/veiculos');
  },

  buscarPorId(id) {
    return api.get(`/veiculos/${id}`);
  },

  criar(data) {
    return api.post('/veiculos', data);
  },

  atualizar(id, data) {
    return api.put(`/veiculos/${id}`, data);
  },

  excluir(id) {
    return api.delete(`/veiculos/${id}`);
  }
};

export default veiculosService;
