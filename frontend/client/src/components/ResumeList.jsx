// src/components/ResumeList.jsx
import React, { useState, useEffect } from "react";
import { fetchResumes, deleteResume } from "../services/api";
import { useNavigate } from 'react-router-dom';
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
  Divider // Importar Divider
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person'; // Ícone para o Avatar

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

// --- Componente Principal ---
const ResumeList = () => {
  const [resumes, setResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const loadResumes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchResumes();
      if (Array.isArray(response.data)) {
        setResumes(response.data);
      } else if (response.data && Array.isArray(response.data.results)) {
        setResumes(response.data.results);
      } else {
        console.error("Formato de dados inesperado da API.", response.data);
        setError("Formato de dados inesperado da API.");
        setResumes([]);
      }
    } catch (err) {
      console.error("Erro ao buscar currículos: ", err);
      setError("Falha ao carregar currículos. Verifique o console para mais detalhes.");
      setResumes([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadResumes();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este currículo?')) {
      try {
        await deleteResume(id);
        loadResumes();
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
    <Paper elevation={2} sx={{ p: { xs: 1, sm: 2, md: 3 }, mt: 2, width: '100%' }} > {/* Ajuste de padding responsivo */}
      <Typography variant="h4" component="h2" gutterBottom sx={{ textAlign: 'center', mb:3 }}>
        Lista de Currículos
      </Typography>
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
    </Paper>
  );
};

export default ResumeList;