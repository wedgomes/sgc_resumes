import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container } from '@mui/material'; // Usaremos Container para o conteúdo da página
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';

// Este componente agora recebe 'navigationItems' e 'theme' como props
const MainLayout = ({ children, navigationItems, theme }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Adaptador de roteador para o AppProvider do Toolpad
  const toolpadRouter = React.useMemo(() => ({
    pathname: location.pathname,
    navigate: (path) => navigate(path), // O navigate do React Router lida com os caminhos
  }), [location.pathname, navigate]);

  return (
    // O ThemeProvider e CssBaseline agora estão no App.js
    <AppProvider
      title="Sistema de Gestão de Currículos"
      navigation={navigationItems} // Usa a prop para os itens de navegação
      router={toolpadRouter}
      theme={theme} // Usa a prop para o tema
    >
      <DashboardLayout
        title="Sistema de Gestão de Currículos"
      >
        {/* Container do MUI para o conteúdo principal da página com espaçamento */}
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          {children} {/* Aqui é onde as <Routes> serão renderizadas */}
        </Container>
      </DashboardLayout>
    </AppProvider>
  );
};

export default MainLayout;