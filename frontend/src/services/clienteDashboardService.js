import api from './api';

const clienteDashboardService = {
  getDashboard() {
    return api.get('/cliente/dashboard');
  },
  getHistorico() {
    return api.get('/cliente/historico');
  },
  updatePerfil(data) {
    return api.put('/cliente/perfil', data);
  },
  updateSenha(data) {
    return api.put('/cliente/senha', data);
  },
  getFavoritos() {
    return api.get('/cliente/favoritos');
  },
  addFavorito(veiculo_id) {
    return api.post('/cliente/favoritos', { veiculo_id });
  },
  removeFavorito(veiculo_id) {
    return api.delete(`/cliente/favoritos/${veiculo_id}`);
  }
};

export default clienteDashboardService;
