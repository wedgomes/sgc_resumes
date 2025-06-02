// src/App.js
import React from 'react';
// Adicione Navigate para o redirecionamento
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

// Componentes de página e layout
import MainLayout from './components/MainLayout';
import ResumeList from './components/ResumeList';
import ResumeForm from './components/ResumeForm';
import './App.css';

// Importação de Ícones
import ListAltIcon from '@mui/icons-material/ListAlt';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

// 1. Itens de Navegação Principal
const mainNavigation = [
  {
    segment: 'list', // Correto, pois a lista está em /list
    title: 'Listar Currículos',
    icon: <ListAltIcon />,
  },
  {
    segment: 'add',
    title: 'Adicionar Currículo',
    icon: <AddCircleOutlineIcon />,
  },
];

// 2. Definição do Tema MUI
const appTheme = createTheme({
  palette: { /* ... suas definições de paleta ... */ 
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
  typography: { /* ... */ },
  cssVariables: { colorSchemeSelector: 'data-toolpad-color-scheme' },
  colorSchemes: { light: true, dark: true },
  breakpoints: { values: { xs: 0, sm: 600, md: 600, lg: 1200, xl: 1536 } },
});

// Componente Wrapper para ResumeForm
const ResumeFormWrapper = ({ mode }) => {
  const navigate = useNavigate();

  const handleFormSubmitOrCancel = () => {
    navigate('/'); // CORRIGIDO: Navega de volta para a lista de currículos em /list
  };

  return (
    <ResumeForm
      mode={mode}
      onFormSubmit={handleFormSubmitOrCancel}
      onCancelEdit={handleFormSubmitOrCancel}
    />
  );
};

// Componente Principal da Aplicação
function App() {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <Router>
        <MainLayout navigationItems={mainNavigation} theme={appTheme}>
          <Routes>
            {/* ADICIONADO: Redireciona da rota raiz "/" para "/list" */}
            <Route path="/" element={<Navigate replace to="/list" />} />

            <Route path="/list" element={<ResumeList />} />
            <Route path="/add" element={<ResumeFormWrapper mode="add" />} />
            <Route path="/edit/:resumeId" element={<ResumeFormWrapper mode="edit" />} />
            
            {/* Exemplo de rota "Não Encontrado" (opcional) */}
            <Route path="*" element={
              <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <h2>Página Não Encontrada (404)</h2>
                <p>O caminho que você tentou acessar não existe.</p>
              </div>
            } />
          </Routes>
        </MainLayout>
      </Router>
    </ThemeProvider>
  );
}

export default App;