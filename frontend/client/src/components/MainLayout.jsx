// src/components/MainLayout.jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container } from '@mui/material';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';

const MainLayout = ({ children, navigationItems, theme }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const toolpadRouter = React.useMemo(() => ({
    pathname: location.pathname,
    navigate: (path) => {
      console.log(`--- MainLayout/toolpadRouter: Tentando navegar para o path (segmento): '${path}' ---`);
      navigate(path);
    },
  }), [location.pathname, navigate]);

  // ADICIONE ESTE LOG:
  console.log("--- MainLayout: Prop 'navigationItems' recebida:", JSON.stringify(navigationItems, null, 2));

  return (
    <AppProvider
      navigation={navigationItems} // Verifique se esta prop está correta
      router={toolpadRouter}
      theme={theme}
    >
      <DashboardLayout title="Sistema de Gestão de Currículos"> {/* Adicionando o título aqui */}
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          {children}
        </Container>
      </DashboardLayout>
    </AppProvider>
  );
};

export default MainLayout;