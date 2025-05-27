// src/components/ResumeList.jsx
import React, { useState, useEffect } from "react";
import { fetchResumes, deleteResume } from "../services/api";
import { useNavigate } from 'react-router-dom'; // Importar useNavigate
import { Button, List, ListItem, ListItemText, Typography, CircularProgress, Alert, Paper, Box } from '@mui/material'; // Componentes MUI

// ... (statusDisplayMap, sourceDisplayMap, formatGenericValue, estilos - como antes) ...
const statusDisplayMap = { /* ... */ };
const sourceDisplayMap = { /* ... */ };
const formatGenericValue = (value, defaultValue = 'N/A') => { /* ... */ };
const presentDataStyle = { color: '#333333' };
const missingDataStyle = { color: 'grey', fontStyle: 'italic' };


// Removida a prop onEdit, pois a navegação será feita aqui
const ResumeList = () => {
  const [resumes, setResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Hook para navegação

  // ... (loadResumes e useEffect - como antes) ...
  const loadResumes = async () => { /* ... */ };
  useEffect(() => { loadResumes(); }, []);


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

  // Função para o botão de editar
  const handleEdit = (id) => {
    navigate(`/edit/${id}`); // Navega para a rota de edição
  };

  if (isLoading) return <Box display="flex" justifyContent="center" my={4}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>;

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 2 }}> {/* Usando Paper do MUI para um card container */}
      <Typography variant="h4" component="h2" gutterBottom>
        Lista de Currículos
      </Typography>
      {resumes.length === 0 && !isLoading && <Typography>Nenhum currículo cadastrado.</Typography>}
      <List> {/* Usando List e ListItem do MUI */}
        {resumes.map(resume => {
          // ... (lógica de displayDate, displayStatus, displaySource - como antes) ...
          let displayDate = 'N/A'; /* ... */
          const displayStatus = statusDisplayMap[resume.status] || formatGenericValue(resume.status, 'N/A');
          const displaySource = sourceDisplayMap[resume.source] || formatGenericValue(resume.source, 'N/A');

          return (
            <ListItem
              key={resume.id}
              divider
              sx={{
                mb: 2,
                p: 2,
                backgroundColor: '#f9f9f9',
                borderRadius: '4px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start'
              }}
            >
              <Typography variant="h6" component="h3" sx={!resume.full_name ? missingDataStyle : presentDataStyle}>
                {resume.full_name || 'Nome não informado'}
              </Typography>
              <ListItemText
                primary={
                  <>
                    <Typography component="span" display="block">
                      <strong style={presentDataStyle}>Email: </strong>
                      <span style={!resume.email ? missingDataStyle : presentDataStyle}>
                        {resume.email || 'N/A'}
                      </span>
                    </Typography>
                    <Typography component="span" display="block">
                      <strong style={presentDataStyle}>Telefone: </strong>
                      <span style={!resume.phone ? missingDataStyle : presentDataStyle}>
                        {resume.phone || 'N/A'}
                      </span>
                    </Typography>
                    <Typography component="span" display="block">
                      <strong style={presentDataStyle}>Status: </strong>
                      <span style={!resume.status ? missingDataStyle : presentDataStyle}>
                        {displayStatus}
                      </span>
                    </Typography>
                    <Typography component="span" display="block">
                      <strong style={presentDataStyle}>Origem: </strong>
                      <span style={!resume.source ? missingDataStyle : presentDataStyle}>
                        {displaySource}
                      </span>
                    </Typography>
                    {resume.original_file_url && (
                      <Typography component="span" display="block" sx={presentDataStyle}>
                        <a href={resume.original_file_url} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff' }}>
                          Ver Arquivo Original
                        </a>
                      </Typography>
                    )}
                    <Typography component="span" display="block" sx={{ fontStyle: 'italic' }}>
                      <em style={presentDataStyle}>Enviado em: </em>
                      <span style={resume.uploaded_at ? presentDataStyle : missingDataStyle}>
                        {resume.uploaded_at ? new Date(resume.uploaded_at).toLocaleString() : 'N/A'}
                      </span>
                    </Typography>
                  </>
                }
              />
              <Box sx={{ mt: 1 }}>
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