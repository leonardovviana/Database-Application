import api from './api';

const clientesService = {
  buscar(termo)   { return api.get(`/clientes/busca?q=${encodeURIComponent(termo)}`); },
  listar()       { return api.get('/clientes'); },
  buscarPorId(id) { return api.get(`/clientes/${id}`); },
  criar(data)    { return api.post('/clientes', data); },
  atualizar(id, data) { return api.put(`/clientes/${id}`, data); },
  excluir(id)    { return api.delete(`/clientes/${id}`); }
};

export default clientesService;
