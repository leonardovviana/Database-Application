import api from './api';

const authService = {
  login(email, senha) {
    return api.post('/auth/login', { email, senha });
  },
  register(data) {
    return api.post('/auth/register', data);
  },
  me() {
    return api.get('/auth/me');
  }
};

export default authService;
