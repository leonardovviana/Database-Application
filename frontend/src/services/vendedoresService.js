import api from './api';

const vendedoresService = {
  buscar(termo)   { return api.get(`/vendedores/busca?q=${encodeURIComponent(termo)}`); },
  listar()       { return api.get('/vendedores'); },
  buscarPorId(id) { return api.get(`/vendedores/${id}`); },
  criar(data)    { return api.post('/vendedores', data); },
  atualizar(id, data) { return api.put(`/vendedores/${id}`, data); },
  excluir(id)    { return api.delete(`/vendedores/${id}`); }
};

export default vendedoresService;
