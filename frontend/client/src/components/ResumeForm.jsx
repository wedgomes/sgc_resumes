// src/components/ResumeForm.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Importar useParams e useNavigate
import { createResume, getResumeDetails, updateResume } from '../services/api';
import { TextField, Button, Select, MenuItem, FormControl, InputLabel, CircularProgress, Alert, Paper, Typography, Box } from '@mui/material'; // Componentes MUI

// ... (statusDisplayMap, sourceDisplayMap - se precisar deles nos selects ou como referência)

// A prop resumeId não é mais necessária, usamos useParams
// A prop onFormSubmit e onCancelEdit vêm do ResumeFormWrapper
const ResumeForm = ({ mode, onFormSubmit, onCancelEdit }) => {
  const { resumeId } = useParams(); // Pega o resumeId da URL, se presente
  const navigate = useNavigate(); // Para navegação programática (não usado diretamente aqui, mas no wrapper)

  const isEditing = mode === 'edit'; // Define se está editando com base na prop 'mode'

  const [formData, setFormDataState] = useState({
    full_name: '', email: '', phone: '', linkedin_url: '',
    education_summary: '', experience_summary: '', skills_summary: '',
    source: 'manual', status: 'pending_review', notes: '',
    original_file: null, original_file_url: '',
  });
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');


  useEffect(() => {
    // Se estiver editando E resumeId estiver presente na URL
    if (isEditing && resumeId) {
      const fetchResumeData = async () => {
        setIsLoading(true);
        setSuccessMessage('');
        setError(null);
        try {
          const response = await getResumeDetails(resumeId);
          const apiData = response.data;
          setFormDataState({
            full_name: apiData.full_name || '',
            email: apiData.email || '',
            phone: apiData.phone || '',
            linkedin_url: apiData.linkedin_url || '',
            education_summary: apiData.education_summary || '',
            experience_summary: apiData.experience_summary || '',
            skills_summary: apiData.skills_summary || '',
            notes: apiData.notes || '',
            source: apiData.source || 'manual',
            status: apiData.status || 'pending_review',
            original_file: null,
            original_file_url: apiData.original_file_url || '',
          });
          setFileName(apiData.original_file_url ? apiData.original_file_url.split('/').pop() : (apiData.original_file ? String(apiData.original_file).split('/').pop() : ''));
        } catch (err) {
          console.error("Erro ao buscar dados do currículo:", err);
          setError("Falha ao carregar dados para edição.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchResumeData();
    } else if (!isEditing) { // Se estiver no modo de adição (ou se resumeId não estiver lá no modo de edição por algum motivo)
      // Resetar para novo cadastro
      setFormDataState({
        full_name: '', email: '', phone: '', linkedin_url: '',
        education_summary: '', experience_summary: '', skills_summary: '',
        source: 'manual', status: 'pending_review', notes: '',
        original_file: null, original_file_url: '',
      });
      setFileName('');
      setSuccessMessage('');
      setError(null);
    }
  }, [resumeId, isEditing, mode]); // Adicionado 'mode' às dependências

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormDataState(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormDataState(prev => ({ ...prev, original_file: e.target.files[0] }));
    setFileName(e.target.files[0] ? e.target.files[0].name : '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage('');

    const dataPayload = new FormData(); // Usar FormData global
    for (const key in formData) {
      if (key === 'original_file_url') continue; // Não enviar original_file_url

      if (formData[key] !== null && formData[key] !== '') {
        if (key === 'original_file' && formData.original_file instanceof File) {
          dataPayload.append(key, formData.original_file);
        } else if (key !== 'original_file') {
          dataPayload.append(key, formData[key]);
        }
      }
    }

    try {
      if (isEditing) {
        await updateResume(resumeId, dataPayload);
        setSuccessMessage('Currículo atualizado com sucesso!');
      } else {
        if (!formData.original_file) {
          setError("Por favor, selecione um arquivo para o currículo.");
          setIsLoading(false);
          return;
        }
        await createResume(dataPayload);
        setSuccessMessage('Currículo adicionado com sucesso!');
        // Resetar formulário apenas na criação bem-sucedida
        setFormDataState({
          full_name: '', email: '', phone: '', linkedin_url: '',
          education_summary: '', experience_summary: '', skills_summary: '',
          source: 'manual', status: 'pending_review', notes: '',
          original_file: null, original_file_url: '',
        });
        setFileName('');
      }
      // A navegação será feita pelo onFormSubmit no wrapper após um pequeno delay
      setTimeout(() => {
        onFormSubmit();
      }, 1500); // Delay para o usuário ver a mensagem de sucesso

    } catch (err) {
      console.error("Erro ao enviar currículo: ", err.response ? err.response.data : err.message);
      const errorData = err.response?.data;
      if (typeof errorData === 'object' && errorData !== null) {
        // Formatar erros do DRF
        let backendErrors = [];
        for (const field in errorData) {
          backendErrors.push(`${field}: ${errorData[field].join ? errorData[field].join(', ') : errorData[field]}`);
        }
        setError(`Falha ao enviar: ${backendErrors.join('; ')}`);
      } else {
        setError(`Falha ao enviar currículo: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Renderização com componentes MUI
  return (
    <Paper elevation={2} sx={{ p: 3, mt: 2 }}>
      <Typography variant="h4" component="h2" gutterBottom>
        {isEditing ? 'Editar Currículo' : 'Adicionar Novo Currículo'}
      </Typography>
      {isLoading && <Box display="flex" justifyContent="center" my={2}><CircularProgress /></Box>}
      {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
      {successMessage && <Alert severity="success" sx={{ my: 2 }}>{successMessage}</Alert>}
      
      <form onSubmit={handleSubmit}>
        <TextField label="Nome Completo" name="full_name" value={formData.full_name} onChange={handleChange} fullWidth margin="normal" />
        <TextField label="Email" type="email" name="email" value={formData.email} onChange={handleChange} fullWidth margin="normal" />
        <TextField label="Telefone" name="phone" value={formData.phone} onChange={handleChange} fullWidth margin="normal" />
        <TextField label="LinkedIn URL" type="url" name="linkedin_url" value={formData.linkedin_url} onChange={handleChange} fullWidth margin="normal" />
        
        <TextField label="Resumo da Educação" name="education_summary" value={formData.education_summary} onChange={handleChange} fullWidth margin="normal" multiline rows={3} />
        <TextField label="Resumo da Experiência" name="experience_summary" value={formData.experience_summary} onChange={handleChange} fullWidth margin="normal" multiline rows={4} />
        <TextField label="Resumo das Habilidades" name="skills_summary" value={formData.skills_summary} onChange={handleChange} fullWidth margin="normal" multiline rows={3} />

        <FormControl fullWidth margin="normal">
          <InputLabel id="source-label">Origem</InputLabel>
          <Select labelId="source-label" name="source" value={formData.source} label="Origem" onChange={handleChange}>
            <MenuItem value="manual">Cadastro Manual</MenuItem>
            <MenuItem value="email">E-mail</MenuItem>
            <MenuItem value="physical">Físico (Digitalizado)</MenuItem>
            <MenuItem value="other">Outro</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth margin="normal">
          <InputLabel id="status-label">Status</InputLabel>
          <Select labelId="status-label" name="status" value={formData.status} label="Status" onChange={handleChange}>
            <MenuItem value="pending_review">Pendente de Revisão</MenuItem>
            <MenuItem value="under_review">Em Revisão</MenuItem>
            <MenuItem value="shortlisted">Pré-selecionado</MenuItem>
            <MenuItem value="interview_scheduled">Entrevista Agendada</MenuItem>
            <MenuItem value="rejected">Rejeitado</MenuItem>
            <MenuItem value="hired">Contratado</MenuItem>
          </Select>
        </FormControl>

        <TextField label="Anotações" name="notes" value={formData.notes} onChange={handleChange} fullWidth margin="normal" multiline rows={3} />
        
        <Box mt={2} mb={1}>
          <Button variant="contained" component="label" fullWidth>
            {fileName ? `Arquivo: ${fileName}` : "Selecionar Arquivo do Currículo (PDF, DOCX)"}
            <input type="file" hidden onChange={handleFileChange} accept=".pdf,.doc,.docx" />
          </Button>
          {isEditing && !fileName && formData.original_file_url && (
            <Typography variant="caption" display="block" mt={1}>
              Arquivo atual: <a href={formData.original_file_url} target="_blank" rel="noopener noreferrer">{formData.original_file_url.split('/').pop()}</a> (selecione um novo para substituir)
            </Typography>
          )}
        </Box>

        <Box mt={3} display="flex" justifyContent="flex-end">
          {isEditing && (
            <Button variant="outlined" onClick={onCancelEdit} disabled={isLoading} sx={{ mr: 2 }}>
              Cancelar
            </Button>
          )}
          <Button type="submit" variant="contained" color="primary" disabled={isLoading}>
            {isLoading ? (isEditing ? 'Salvando...' : 'Enviando...') : (isEditing ? 'Salvar Alterações' : 'Adicionar Currículo')}
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default ResumeForm;