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
      // console.log(`--- MainLayout/toolpadRouter: Tentando navegar para o path (segmento): '${path}' ---`);
      navigate(path);
    },
  }), [location.pathname, navigate]);

  // ADICIONE ESTE LOG:
  // console.log("--- MainLayout: Prop 'navigationItems' recebida:", JSON.stringify(navigationItems, null, 2));

  return (
    <AppProvider
      navigation={navigationItems} // Verifique se esta prop está correta
      router={toolpadRouter}
      theme={theme}
      title="Sistema de Gestão de Currículos"
    >
      <DashboardLayout 
        title="Sistema de Gestão de Currículos"
        // contentMaxWidth={false} 
        // fluid={true}
        fullWidthContent={true} 
      > {/* Adicionando o título aqui */}
        <div sx={{ maxWidth: (theme), mt: 4, mb: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>
      </DashboardLayout>
    </AppProvider>
  );
};

export default MainLayout;