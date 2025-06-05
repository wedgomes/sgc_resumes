// src/components/ResumeList.jsx
import React, { useState, useEffect, useCallback } from "react"; // Adicionado useCallback
import { fetchResumes, deleteResume } from "../services/api";
import { useNavigate, useLocation, Link } from 'react-router-dom'; // Adicionado useLocation e Link
import {
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Box,
  Divider, // Importar Divider
  Pagination, 
  PaginationItem, // Adicionado Pagination e PaginationItem
  InputAdornment, // Adicionado TextField e InputAdornment
  TextField
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person'; // Ícone para o Avatar
import SearchIcon from '@mui/icons-material/Search'; // Ícone de busca

// --- Mapas e Funções Auxiliares ---
const statusDisplayMap = {
  pending_review: 'Pendente de Revisão',
  under_review: 'Em Revisão',
  shortlisted: 'Pré-selecionado',
  interview_scheduled: 'Entrevista Agendada',
  rejected: 'Rejeitado',
  hired: 'Contratado',
};

const sourceDisplayMap = {
  email: 'E-mail',
  physical: 'Físico (Digitalizado)',
  manual: 'Cadastro Manual',
  other: 'Outro',
};

const formatGenericValue = (value, defaultValue = 'N/A') => {
  if (!value) return defaultValue;
  if (typeof value === 'string') {
    return value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
  return String(value);
};

// Estilos para os dados
const presentDataStyle = { color: 'text.primary' }; // Usar cores do tema
const missingDataStyle = { color: 'text.secondary', fontStyle: 'italic' }; // Usar cores do tema

// --- CONSTANTE PARA ITENS POR PÁGINA ---
// Este valor DEVE corresponder à configuração de page_size no seu backend Django.
const ITEMS_PER_PAGE = 3; // Exemplo, ajuste conforme necessário

// --- Componente Principal ---
const ResumeList = () => {
  const [resumes, setResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const location = useLocation(); // Para ler os parâmetros da URL
  const navigate = useNavigate();

  // Estado para paginação
  const queryParams = new URLSearchParams(location.search);
  const initialPage = parseInt(queryParams.get('page') || '1', 10); // Lê a página da URL ou default para 1
  const initialSearch = queryParams.get('search') || '';

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [activeSearchQuery, setActiveSearchQuery] = useState(initialSearch); // Termo de busca efetivamente usado na API
  const [searchInput, setSearchInput] = useState(initialSearch); // Conteúdo do campo de texto da busca
  const [totalCount, setTotalCount] = useState(0); // Total de currículos

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Função para carregar currículos da API
  const loadResumes = useCallback(async (pageToLoad, currentSearch) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchResumes(pageToLoad, currentSearch); // Passa a página para a API

        // Assumindo que a API paginada retorna um objeto com 'count' e 'results'
      if (response.data && Array.isArray(response.data.results)) {
        setResumes(response.data.results);
        setTotalCount(response.data.count);
      } else if (Array.isArray(response.data)) {
        // Fallback se a API retornar apenas uma lista (sem paginação no backend)
        // Nesse caso, a paginação no frontend seria apenas visual para uma lista completa
        console.warn("API não parece estar paginada, exibindo todos os resultados recebidos.");
        setResumes(response.data);
        setTotalCount(response.data.length); // A contagem total seria o tamanho da lista recebida
      } else {
        console.error("Formato de dados inesperado da API.", response.data);
        setError("Formato de dados inesperado da API.");
        setResumes([]);
        setTotalCount(0);
      }
    } catch (err) {
      console.error("Erro ao buscar currículos: ", err);
      setError("Falha ao carregar currículos.");
      setResumes([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, []); // useCallback para estabilizar a função

  // Efeito para carregar currículos quando a página na URL (currentPage) muda
  useEffect(() => {
    // Atualiza a URL para refletir o estado atual de página e busca
    const params = new URLSearchParams();
    if (currentPage > 1) params.set('page', currentPage.toString());
    if (activeSearchQuery) params.set('search', activeSearchQuery);
    navigate(`/list${params.toString() ? `?${params.toString()}` : ''}`, { replace: true });
    
    loadResumes(currentPage, activeSearchQuery);
  }, [currentPage, activeSearchQuery, loadResumes, navigate]);

  // Efeito para atualizar o estado interno se a URL mudar externamente (ex: botão voltar/avançar do navegador)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pageFromUrl = parseInt(params.get('page') || '1', 10);
    const searchFromUrl = params.get('search') || '';
    
    if (pageFromUrl !== currentPage) {
        setCurrentPage(pageFromUrl);
    }
    if (searchFromUrl !== activeSearchQuery) {
        setActiveSearchQuery(searchFromUrl);
        setSearchInput(searchFromUrl); // Sincroniza o campo de input também
    }
  }, [location.search]); // Removido currentPage e activeSearchQuery das dependências para evitar loop

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este currículo?')) {
      try {
        await deleteResume(id);
        loadResumes(currentPage, activeSearchQuery); // Recarrega a página atual
      } catch (localError) {
        console.error("Erro ao excluir currículo: ", localError);
        alert("Falha ao excluir currículo.");
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/edit/${id}`);
  };

  // Manipulador para submeter a busca
  const handleSearchSubmit = (event) => {
    event.preventDefault(); // Previne recarregamento da página se estiver em um form
    setCurrentPage(1); // Sempre volta para a página 1 ao fazer uma nova busca
    setActiveSearchQuery(searchInput);
  };
  
  // Função para construir links de paginação preservando o filtro de busca
  const buildPageLink = (pageNumber) => {
    const params = new URLSearchParams();
    if (activeSearchQuery) { // Usa activeSearchQuery para os links de paginação
      params.set('search', activeSearchQuery);
    }
    if (pageNumber > 1) {
      params.set('page', pageNumber.toString());
    }
    const queryString = params.toString();
    return `/list${queryString ? `?${queryString}` : ''}`;
  };

  if (isLoading) return <Box display="flex" justifyContent="center" my={4}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>;

  return (
    <Paper elevation={2} sx={{ p: { xs: 1, sm: 2, md: 3 }, mt: 2, width: '100%' }} > {/* Ajuste de padding responsivo */}
      <Typography variant="h4" component="h2" gutterBottom sx={{ textAlign: 'center', mb:3 }}>
        Lista de Currículos
      </Typography>

      {/* Formulário de Busca */}
      <Box component="form" onSubmit={handleSearchSubmit} sx={{ display: 'flex', gap: 1, mb: 3, alignItems: 'center' }}>
        <TextField
          // label="Pesquisar Currículos"
          variant="outlined"
          fullWidth
          size="small"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          // sx={{ padding: "0px", border: "none", marginBottom: "0px"}}
           InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Button type="submit" variant="contained" color="primary" size="small" sx={{py: '15px'}}>
          Buscar
        </Button>
        {activeSearchQuery && (
            <Button variant="outlined" size="small" onClick={() => { setSearchInput(''); setActiveSearchQuery(''); setCurrentPage(1);}}>
                Limpar
            </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
      {isLoading && <Box display="flex" justifyContent="center" my={2}><CircularProgress size={24} /></Box>} {/* Loading menor para atualizações */}

      {resumes.length === 0 && !isLoading && <Typography sx={{textAlign: 'center'}}>Nenhum currículo cadastrado.</Typography>}
      
      {/* Lista principal com largura total */}
      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
        {resumes.map((resume, index) => {
          // Lógica para formatar e exibir a data
          let displayDate = 'N/A';
          let effectiveDateStyle = missingDataStyle;
          if (resume.uploaded_at) {
            try {
              displayDate = new Date(resume.uploaded_at).toLocaleString('pt-BR');
              effectiveDateStyle = presentDataStyle;
            } catch (e) {
              displayDate = 'Data inválida';
            }
          }

          const displayStatus = statusDisplayMap[resume.status] || formatGenericValue(resume.status, 'N/A');
          const displaySource = sourceDisplayMap[resume.source] || formatGenericValue(resume.source, 'N/A');

          return (
            <React.Fragment key={resume.id}>
              <ListItem 
                alignItems="flex-start"
                secondaryAction={
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 1, pl: 1 }}>
                    <Button variant="outlined" size="small" onClick={() => handleEdit(resume.id)} sx={{width: {xs: '100%', sm: 'auto'}}}>
                      Editar
                    </Button>
                    <Button variant="outlined" size="small" color="error" onClick={() => handleDelete(resume.id)} sx={{width: {xs: '100%', sm: 'auto'}}}>
                      Excluir
                    </Button>
                  </Box>
                }
                sx={{pr: {xs: 1, sm: 20} }} // Adiciona padding à direita para não sobrepor botões em telas menores
              >
                <ListItemAvatar>
                  <Avatar> {/* Você pode adicionar lógica para src={resume.fotoUrl} se tiver */}
                    <PersonIcon /> {/* Ícone genérico */}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="h6" component="div" sx={!resume.full_name ? missingDataStyle : presentDataStyle}>
                      {resume.full_name || 'Nome não informado'}
                    </Typography>
                  }
                  secondary={
                    <React.Fragment>
                      <Typography component="span" variant="body2" display="block" sx={!resume.email ? missingDataStyle : presentDataStyle}>
                        <strong>Email:</strong> {resume.email || 'N/A'}
                      </Typography>
                      <Typography component="span" variant="body2" display="block" sx={!resume.phone ? missingDataStyle : presentDataStyle}>
                        <strong>Telefone:</strong> {resume.phone || 'N/A'}
                      </Typography>
                      <Typography component="span" variant="body2" display="block" sx={!resume.status ? missingDataStyle : presentDataStyle}>
                        <strong>Status:</strong> {displayStatus}
                      </Typography>
                      <Typography component="span" variant="body2" display="block" sx={!resume.source ? missingDataStyle : presentDataStyle}>
                        <strong>Origem:</strong> {displaySource}
                      </Typography>
                      {resume.original_file_url && (
                        <Typography component="span" variant="body2" display="block">
                          <a href={resume.original_file_url} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff' }}>
                            Ver Arquivo Original
                          </a>
                        </Typography>
                      )}
                       <Typography component="span" variant="body2" display="block" sx={{ fontStyle: 'italic', mt: 0.5 }}>
                        <em style={presentDataStyle}>Enviado em: </em>
                        <span style={effectiveDateStyle}>
                          {displayDate}
                        </span>
                      </Typography>
                    </React.Fragment>
                  }
                  primaryTypographyProps={{ component: 'div', sx: { mb: 1 } }} // Margem abaixo do nome
                  secondaryTypographyProps={{ component: 'div' }} // Garante que o secondary seja um div para block display
                />
              </ListItem>
              {/* Adiciona Divider entre os itens, exceto para o último */}
              {/* {index < resumes.length - 1 && <Divider variant="inset" component="li" />} */}
            </React.Fragment>
          );
        })}
      </List>
      {/* <Box sx={{display: 'flex', justifyContent: 'center', mt: 3}}>
        <Button variant="contained" onClick={loadResumes} disabled={isLoading}>
          Atualizar Lista
        </Button>
      </Box> */}

      {/* Componente de Paginação */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            page={currentPage}
            count={totalPages}
            color="primary"
            renderItem={(item) => (
              <PaginationItem
                component={Link}
                // Gera o link para a página correta, mantendo a rota base '/list'
                to={`/list${item.page === 1 ? '' : `?page=${item.page}`}`}
                {...item}
              />
            )}
          />
        </Box>
      )}

    </Paper>
  );
};

export default ResumeList;