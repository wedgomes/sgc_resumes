// src/components/ResumeList.jsx
import React, { useState, useEffect } from "react";
import { fetchResumes, deleteResume } from "../services/api";
import { useNavigate } from 'react-router-dom';
import { Button, List, ListItem, ListItemText, Typography, CircularProgress, Alert, Paper, Box } from '@mui/material';

// --- Mapas e Funções Auxiliares ---
// (Defina estes com base nos 'choices' do seu modelo Django)

const statusDisplayMap = {
  pending_review: 'Pendente de Revisão',
  under_review: 'Em Revisão',
  shortlisted: 'Pré-selecionado',
  interview_scheduled: 'Entrevista Agendada',
  rejected: 'Rejeitado',
  hired: 'Contratado',
  // Adicione outros status conforme necessário
};

const sourceDisplayMap = {
  email: 'E-mail',
  physical: 'Físico (Digitalizado)',
  manual: 'Cadastro Manual',
  other: 'Outro',
  // Adicione outras origens conforme necessário
};

// Função para formatar valores genéricos ou como fallback
const formatGenericValue = (value, defaultValue = 'N/A') => {
  if (!value) return defaultValue;
  if (typeof value === 'string') {
    // Ex: 'some_value' -> 'Some Value'
    return value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
  return String(value); // Garante que é uma string para exibição
};

// Estilos para os dados
const presentDataStyle = { color: '#333333' };
const missingDataStyle = { color: 'grey', fontStyle: 'italic' };

// --- Componente Principal ---
const ResumeList = () => {
  const [resumes, setResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Função para carregar os currículos da API
  const loadResumes = async () => {
    setIsLoading(true);
    setError(null);
    // console.log("--- FRONTEND (ResumeList): Iniciando loadResumes ---");
    try {
      const response = await fetchResumes();
      // console.log("--- FRONTEND (ResumeList): Resposta da API (fetchResumes):", response);
      // console.log("--- FRONTEND (ResumeList): Dados da resposta da API (response.data):", response.data);

      if (Array.isArray(response.data)) {
        setResumes(response.data);
        // console.log("--- FRONTEND (ResumeList): Estado 'resumes' atualizado com (array direto):", response.data);
      } else if (response.data && Array.isArray(response.data.results)) {
        // Comum se a API Django REST Framework usar paginação
        // console.log("--- FRONTEND (ResumeList): Detectada resposta paginada. Usando response.data.results.");
        setResumes(response.data.results);
        // console.log("--- FRONTEND (ResumeList): Estado 'resumes' atualizado com (paginado):", response.data.results);
      } else {
        // console.error("--- FRONTEND (ResumeList): response.data não é um array e não tem a propriedade 'results' como array. Verifique a estrutura da resposta da API.", response.data);
        setError("Formato de dados inesperado da API.");
        setResumes([]); // Define como array vazio para evitar erros no .map
      }
    } catch (err) {
      // console.error("--- FRONTEND (ResumeList): Erro ao buscar currículos (dentro do catch):", err);
      if (err.response) {
        // console.error("--- FRONTEND (ResumeList): Detalhes do erro da API:", err.response.data);
        // console.error("--- FRONTEND (ResumeList): Status do erro da API:", err.response.status);
      }
      setError("Falha ao carregar currículos. Verifique o console para mais detalhes.");
      setResumes([]);
    } finally {
      setIsLoading(false);
      // console.log("--- FRONTEND (ResumeList): loadResumes finalizado ---");
    }
  };

  useEffect(() => {
    loadResumes();
  }, []); // Carrega na montagem inicial do componente

  // Log para observar mudanças no estado 'resumes' (opcional, para depuração)
  useEffect(() => {
    // console.log("--- FRONTEND (ResumeList): Estado 'resumes' efetivamente mudou para:", resumes);
  }, [resumes]);

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este currículo?')) {
      try {
        await deleteResume(id);
        loadResumes(); // Recarrega a lista após a exclusão
      } catch (localError) {
        console.error("Erro ao excluir currículo: ", localError);
        alert("Falha ao excluir currículo.");
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/edit/${id}`);
  };

  if (isLoading) return <Box display="flex" justifyContent="center" my={4}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>;

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 2 }}>
      <Typography variant="h4" component="h2" gutterBottom>
        Lista de Currículos
      </Typography>
      {resumes.length === 0 && !isLoading && <Typography>Nenhum currículo cadastrado.</Typography>}
      <List>
        {resumes.map(resume => {
          // Lógica para formatar e exibir a data
          let displayDate = 'N/A';
          let effectiveDateStyle = missingDataStyle;
          if (resume.uploaded_at) {
            try {
              displayDate = new Date(resume.uploaded_at).toLocaleString('pt-BR'); // Formatado para pt-BR
              effectiveDateStyle = presentDataStyle;
            } catch (e) {
              console.warn("Data inválida para o currículo:", resume.id, resume.uploaded_at);
              displayDate = 'Data inválida';
            }
          }

          // Obter o texto de exibição para status e origem
          const displayStatus = statusDisplayMap[resume.status] || formatGenericValue(resume.status, 'N/A');
          const displaySource = sourceDisplayMap[resume.source] || formatGenericValue(resume.source, 'N/A');

          return (
            <ListItem
              key={resume.id}
              divider
              sx={{
                mb: 2, p: 2, backgroundColor: '#f9f9f9', borderRadius: '4px',
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start'
              }}
            >
              <Typography variant="h6" component="h3" sx={!resume.full_name ? missingDataStyle : presentDataStyle}>
                {resume.full_name || 'Nome não informado'}
              </Typography>
              <ListItemText sx={{ width: '100%'}} // Garante que ListItemText ocupe a largura para alinhar o conteúdo
                primary={
                  <>
                    <Typography component="div" display="block" sx={{mb: 0.5}}> {/* Usando div e mb para espaçamento */}
                      <strong style={presentDataStyle}>Email: </strong>
                      <span style={!resume.email ? missingDataStyle : presentDataStyle}>
                        {resume.email || 'N/A'}
                      </span>
                    </Typography>
                    <Typography component="div" display="block" sx={{mb: 0.5}}>
                      <strong style={presentDataStyle}>Telefone: </strong>
                      <span style={!resume.phone ? missingDataStyle : presentDataStyle}>
                        {resume.phone || 'N/A'}
                      </span>
                    </Typography>
                    <Typography component="div" display="block" sx={{mb: 0.5}}>
                      <strong style={presentDataStyle}>Status: </strong>
                      <span style={!resume.status ? missingDataStyle : presentDataStyle}>
                        {displayStatus}
                      </span>
                    </Typography>
                    <Typography component="div" display="block" sx={{mb: 0.5}}>
                      <strong style={presentDataStyle}>Origem: </strong>
                      <span style={!resume.source ? missingDataStyle : presentDataStyle}>
                        {displaySource}
                      </span>
                    </Typography>
                    {resume.original_file_url && (
                      <Typography component="div" display="block" sx={{mb: 0.5, ...presentDataStyle}}>
                        <a href={resume.original_file_url} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff' }}>
                          Ver Arquivo Original
                        </a>
                      </Typography>
                    )}
                    <Typography component="div" display="block" sx={{ fontStyle: 'italic' }}>
                      <em style={presentDataStyle}>Enviado em: </em>
                      <span style={effectiveDateStyle}>
                        {displayDate}
                      </span>
                    </Typography>
                  </>
                }
              />
              <Box sx={{ mt: 2, width: '100%', display: 'flex', justifyContent: 'flex-start' }}> {/* Botões alinhados à esquerda */}
                <Button variant="outlined" onClick={() => handleEdit(resume.id)} sx={{ mr: 1 }}>
                  Editar
                </Button>
                <Button variant="outlined" color="error" onClick={() => handleDelete(resume.id)}>
                  Excluir
                </Button>
              </Box>
            </ListItem>
          );
        })}
      </List>
      <Button variant="contained" onClick={loadResumes} disabled={isLoading} sx={{ mt: 2 }}>
        Atualizar Lista
      </Button>
    </Paper>
  );
};

export default ResumeList;