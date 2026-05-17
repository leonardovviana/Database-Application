import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MainLayout from '../layouts/MainLayout';
import PublicLayout from '../layouts/PublicLayout';
import ClientLayout from '../layouts/ClientLayout';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Veiculos from '../pages/Veiculos';
import Clientes from '../pages/Clientes';
import Vendas from '../pages/Vendas';
import Concessionarias from '../pages/Concessionarias';
import Vendedores from '../pages/Vendedores';
import Reports from '../pages/Reports';
import DataWarehouse from '../pages/DataWarehouse';
import Home from '../pages/Home';
import ClienteCadastro from '../pages/ClienteCadastro';
import ClienteDashboard from '../pages/ClienteDashboard';
import ClientePerfil from '../pages/ClientePerfil';
import ClienteFavoritos from '../pages/ClienteFavoritos';
import Loading from '../components/Loading';

function PrivateRoute({ children, cargos }) {
  const { usuario, loading } = useAuth();
  if (loading) return <Loading message="Verificando sessão..." />;
  if (!usuario) return <Navigate to="/login" replace />;
  if (cargos && !cargos.includes(usuario.cargo)) {
    if (usuario.cargo === 'cliente') return <Navigate to="/cliente/dashboard" replace />;
    return <Navigate to="/admin" replace />;
  }
  return children;
}

export default function AppRoutes() {
  const { usuario, loading } = useAuth();

  if (loading) {
    return <Loading message="Carregando..." />;
  }

  const isLoggedIn = !!usuario;
  const isCliente = isLoggedIn && usuario.cargo === 'cliente';
  const isAdmin = isLoggedIn && ['admin', 'gerente'].includes(usuario.cargo);

  return (
    <Routes>
      {/* Login - redireciona conforme cargo se já logado */}
      <Route
        path="/login"
        element={
          isLoggedIn ? (
            isCliente ? <Navigate to="/cliente/dashboard" replace /> : <Navigate to="/admin" replace />
          ) : (
            <Login />
          )
        }
      />
      <Route
        path="/cadastro"
        element={
          isLoggedIn ? (
            isCliente ? <Navigate to="/cliente/dashboard" replace /> : <Navigate to="/admin" replace />
          ) : (
            <ClienteCadastro />
          )
        }
      />

      {/* Área do Cliente */}
      <Route path="/cliente/dashboard" element={<PrivateRoute cargos={['cliente']}><ClientLayout><ClienteDashboard /></ClientLayout></PrivateRoute>} />
      <Route path="/cliente/perfil" element={<PrivateRoute cargos={['cliente']}><ClientLayout><ClientePerfil /></ClientLayout></PrivateRoute>} />
      <Route path="/cliente/favoritos" element={<PrivateRoute cargos={['cliente']}><ClientLayout><ClienteFavoritos /></ClientLayout></PrivateRoute>} />

      {/* Área Administrativa */}
      <Route path="/admin" element={<PrivateRoute cargos={['admin', 'gerente']}><MainLayout><Dashboard /></MainLayout></PrivateRoute>} />
      <Route path="/admin/veiculos" element={<PrivateRoute cargos={['admin', 'gerente']}><MainLayout><Veiculos /></MainLayout></PrivateRoute>} />
      <Route path="/admin/clientes" element={<PrivateRoute cargos={['admin', 'gerente']}><MainLayout><Clientes /></MainLayout></PrivateRoute>} />
      <Route path="/admin/vendas" element={<PrivateRoute cargos={['admin', 'gerente']}><MainLayout><Vendas /></MainLayout></PrivateRoute>} />
      <Route path="/admin/concessionarias" element={<PrivateRoute cargos={['admin', 'gerente']}><MainLayout><Concessionarias /></MainLayout></PrivateRoute>} />
      <Route path="/admin/vendedores" element={<PrivateRoute cargos={['admin', 'gerente']}><MainLayout><Vendedores /></MainLayout></PrivateRoute>} />
      <Route path="/admin/relatorios" element={<PrivateRoute cargos={['admin', 'gerente']}><MainLayout><Reports /></MainLayout></PrivateRoute>} />
      <Route path="/admin/data-warehouse" element={<PrivateRoute cargos={['admin', 'gerente']}><MainLayout><DataWarehouse /></MainLayout></PrivateRoute>} />

      {/* Página Inicial Pública */}
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
