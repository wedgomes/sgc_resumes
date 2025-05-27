// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'; // Para tema global e baseline CSS

// Componentes de página e layout
import MainLayout from './components/MainLayout';
import ResumeList from './components/ResumeList';
import ResumeForm from './components/ResumeForm';
import './App.css'; // Seu CSS global, se houver

// Importação de Ícones para a navegação (do @mui/icons-material)
import ListAltIcon from '@mui/icons-material/ListAlt';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
// Importe outros ícones que desejar

// --- ETAPA 2: DEFINIÇÕES DIRETAMENTE NO APP.JS ---

// 1. Itens de Navegação Principal (para o AppProvider do Toolpad)
const mainNavigation = [
  {
    segment: '/', // Corresponde ao 'path' da rota no React Router
    title: 'Listar Currículos',
    icon: <ListAltIcon />,
  },
  {
    segment: '/add', // Corresponde ao 'path' da rota no React Router
    title: 'Adicionar Currículo',
    icon: <AddCircleOutlineIcon />,
  },
  // Adicione mais links aqui se necessário (ex: /configuracoes)
  // Lembre-se de criar a <Route> correspondente abaixo
];

// 2. Definição do Tema MUI (Material-UI)
const appTheme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Cor primária (azul MUI padrão)
    },
    secondary: {
      main: '#dc004e', // Cor secundária
    },
    // Você pode adicionar mais customizações de paleta aqui (background, text, etc.)
  },
  typography: {
    // Customizações de tipografia aqui
  },
  // Configurações do exemplo do Toolpad (ajuste se necessário)
  cssVariables: {
    colorSchemeSelector: 'data-toolpad-color-scheme',
  },
  colorSchemes: { light: true, dark: true },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600, // O padrão do MUI para md é 900. Este é do exemplo do Toolpad.
      lg: 1200,
      xl: 1536,
    },
  },
  // Você pode adicionar components overrides aqui para estilizar componentes MUI globalmente
});

// Componente Wrapper para ResumeForm (para lidar com navegação pós-submit/cancel)
// Este pode ficar aqui ou ser movido para seu próprio arquivo se preferir.
const ResumeFormWrapper = ({ mode }) => {
  const navigate = useNavigate();

  const handleFormSubmitOrCancel = () => {
    navigate('/'); // Navega de volta para a lista de currículos
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
    <ThemeProvider theme={appTheme}> {/* Aplica o tema MUI globalmente */}
      <CssBaseline /> {/* Normaliza estilos CSS e aplica cor de fundo do tema */}
      <Router> {/* BrowserRouter envolve toda a aplicação para habilitar rotas */}
        <MainLayout navigationItems={mainNavigation} theme={appTheme}> {/* Passa a navegação e o tema para o MainLayout */}
          {/* As rotas definem qual componente de página é renderizado dentro do MainLayout */}
          <Routes>
            <Route path="/" element={<ResumeList />} />
            <Route path="/add" element={<ResumeFormWrapper mode="add" />} />
            <Route path="/edit/:resumeId" element={<ResumeFormWrapper mode="edit" />} />
            {/* Exemplo de rota "Não Encontrado" (opcional) */}
            {/* <Route path="*" element={
              <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <h2>Página Não Encontrada (404)</h2>
                <p>O caminho que você tentou acessar não existe.</p>
              </div>
            } /> */}
          </Routes>
        </MainLayout>
      </Router>
    </ThemeProvider>
  );
}

export default App;