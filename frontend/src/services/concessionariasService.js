import api from './api';

const concessionariasService = {
  listar()       { return api.get('/concessionarias'); },
  buscar(term)   { return api.get(`/concessionarias/busca?q=${encodeURIComponent(term)}`); },
  buscarPorId(id) { return api.get(`/concessionarias/${id}`); },
  criar(data)    { return api.post('/concessionarias', data); },
  atualizar(id, data) { return api.put(`/concessionarias/${id}`, data); },
  excluir(id)    { return api.delete(`/concessionarias/${id}`); }
};

export default concessionariasService;
