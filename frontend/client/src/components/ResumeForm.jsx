import React, { useState, useEffect } from "react";
import { createResume, getResumeDetails, updateResume } from "../services/api";
// A importação abaixo não é padrão do axios e não está sendo usada, então foi removida.
// import { formToJSON } from "axios";

const ResumeForm = ({ resumeId, onFormSubmit, onCancelEdit }) => {
  // RENOMEADO: De FormData para formData
  const [formData, setFormDataState] = useState({ // Renomeado setFormData para setFormDataState para evitar confusão se houver outra função formData
    full_name: '',
    email: '',
    phone: '',
    linkedin_url: '',
    education_summary: '',
    experience_summary: '',
    skills_summary: '',
    source: 'manual',
    status: 'pending_review',
    notes: '',
    original_file: null,
  });
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const isEditing = !!resumeId;

  useEffect(() => {
    if (isEditing) {
      const fetchResumeData = async () => {
        setIsLoading(true);
        try {
          const response = await getResumeDetails(resumeId);
          const apiData = response.data; // Dados recebidos da API

          // Mapeia os dados da API para o estado do formulário,
          // garantindo que campos de texto nulos se tornem strings vazias.
          const newFormState = {
            full_name: apiData.full_name || '',
            email: apiData.email || '',
            phone: apiData.phone || '',
            linkedin_url: apiData.linkedin_url || '',
            education_summary: apiData.education_summary || '',
            experience_summary: apiData.experience_summary || '',
            skills_summary: apiData.skills_summary || '',
            notes: apiData.notes || '',
            // Para campos select, você pode querer manter o valor da API ou um padrão se for null
            source: apiData.source || 'manual', // Ou o valor padrão inicial do estado
            status: apiData.status || 'pending_review', // Ou o valor padrão inicial do estado
            // original_file é sempre null no estado para o input de arquivo ao carregar para edição
            original_file: null,
            // original_file_url é usado para exibir o link do arquivo existente
            original_file_url: apiData.original_file_url || '',
          };

          setFormDataState(newFormState);

          setFileName(apiData.original_file_url ? apiData.original_file_url.split('/').pop() : (apiData.original_file ? String(apiData.original_file).split('/').pop() : ''));
        } catch (err) {
          console.error("Erro ao buscar dados do currículo:", err);
          setError("Falha ao carregar dados para edição.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchResumeData();
    } else {
      // Reset para novo cadastro (já está correto, usando strings vazias)
      setFormDataState({
        full_name: '', email: '', phone: '', linkedin_url: '',
        education_summary: '', experience_summary: '', skills_summary: '',
        source: 'manual', status: 'pending_review', notes: '',
        original_file: null, original_file_url: '', // Adicionado original_file_url aqui também
      });
      setFileName('');
    }
  }, [resumeId, isEditing]); // setFormDataState não precisa ser dependência aqui, como já estava

  const handleChange = (e) => {
    const { name, value } = e.target;
    // ATUALIZADO para usar setFormDataState
    setFormDataState(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    // ATUALIZADO para usar setFormDataState
    setFormDataState(prev => ({ ...prev, original_file: e.target.files[0] }));
    setFileName(e.target.files[0] ? e.target.files[0].name : '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // CORRIGIDO: Agora 'new FormData()' refere-se ao construtor global correto.
    const data = new window.FormData(); // Usar window.FormData explicitamente para máxima clareza ou apenas FormData se não houver mais conflitos

    // ATUALIZADO: Itera sobre o estado 'formData' (com 'f' minúsculo)
    for (const key in formData) {
      if (formData[key] !== null && formData[key] !== '') { // Verifica o estado formData
        // Casos especiais: original_file só é anexado se existir.
        // original_file_url não deve ser enviado no FormData.
        if (key === 'original_file' && formData.original_file instanceof File) {
          data.append(key, formData.original_file);
        } else if (key !== 'original_file' && key !== 'original_file_url') {
          data.append(key, formData[key]);
        }
      }
    }

    try {
      if (isEditing) {
        // Se não houver novo arquivo (formData.original_file é null ou undefined),
        // o FormData 'data' simplesmente não terá o campo 'original_file' anexado pelo loop acima,
        // o que é o comportamento desejado para não sobrescrever o arquivo existente no backend com null.
        // O backend (DRF com FileField) geralmente ignora campos de arquivo não presentes em um PUT/PATCH
        // e não apaga o arquivo existente.
        await updateResume(resumeId, data);
      } else {
        if (!formData.original_file) { // Verifica o estado formData
          alert("Por favor, selecione um arquivo para o currículo.");
          setIsLoading(false);
          return;
        }
        await createResume(data);
      }
      onFormSubmit();

      if (!isEditing) {
        // ATUALIZADO para usar setFormDataState
        setFormDataState({
          full_name: '', email: '', phone: '', linkedin_url: '', education_summary: '', experience_summary: '',
          skills_summary: '', source: 'manual', status: 'pending_review', notes: '', original_file: null,
        });
        setFileName('');
      }
    } catch (err) { // CORRIGIDO: usa 'err' consistentemente
      console.error("Erro ao enviar currículo: ", err.response ? err.response.data : err.message);
      setError(`Falha ao enviar currículo: ${err.response && err.response.data ? JSON.stringify(err.response.data) : err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && isEditing) return <p>Carregando dados do currículo...</p>;

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ccc' }}>
      <h3>{isEditing ? 'Editar Currículo' : 'Adicionar Novo Currículo'}</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* ATUALIZADO: Todos os 'value' e 'onChange' agora usam 'formData' (com 'f' minúsculo) */}
      <div>
        <label>Nome Completo: </label>
        <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} />
      </div>
      <div>
        <label>E-mail: </label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} />
      </div>
      <div>
        <label>Telefone: </label>
        <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
      </div>
      <div>
        <label>Linkedin URL</label>
        <input type="url" name="linkedin_url" value={formData.linkedin_url} onChange={handleChange} />
      </div>
      <div>
        <label>Resumo da Educação: </label>
        <textarea name="education_summary" value={formData.education_summary} onChange={handleChange}></textarea>
      </div>
      <div>
        <label>Resumo da Experiência: </label>
        <textarea name="experience_summary" value={formData.experience_summary} onChange={handleChange}></textarea>
      </div>
      <div>
        <label>Resumo das Habilidades: </label>
        <textarea name="skills_summary" value={formData.skills_summary} onChange={handleChange}></textarea>
      </div>
      <div>
        <label>Origem: </label>
        <select name="source" value={formData.source} onChange={handleChange}>
          <option value="manual">Cadastro Manual</option>
          <option value="email">E-mail</option>
          <option value="physical">Físico (Digitalizado)</option>
          <option value="other">Outro</option>
        </select>
      </div>
      <div>
        <label>Status: </label>
        <select name="status" value={formData.status} onChange={handleChange}>
          <option value="pending_review">Pendente de Revisão</option>
          <option value="under_review">Em Revisão</option>
          <option value="shortlisted">Pré-selecionado</option>
          <option value="interview_scheduled">Entrevista Agendada</option>
          <option value="rejected">Rejeitado</option>
          <option value="hired">Contratado</option>
        </select>
      </div>
      <div>
        <label>Anotações</label>
        <textarea name="notes" value={formData.notes} onChange={handleChange}></textarea>
      </div>
      <div>
        <label>Arquivo do Currículo (PDF, DOCX): </label>
        {/* O name do input de arquivo não precisa ser 'original_file' se o formData.original_file já está sendo usado para popular o FormData final */}
        <input type="file" onChange={handleFileChange} accept=".pdf, .doc, .docx" />
        {fileName && <p>Arquivo selecionado: {fileName}</p>}
        {/* ATUALIZADO para usar formData.original_file_url */}
        {isEditing && !fileName && formData.original_file_url && <p>Arquivo atual: <a href={formData.original_file_url} target="_blank" rel="noopener noreferrer">Ver arquivo</a> (selecione um novo para substituir)</p>}
      </div>
      <button type="submit" disabled={isLoading}>
        {isLoading ? (isEditing ? 'Salvando...' : 'Enviando...') : (isEditing ? 'Salvar Alterações' : 'Adicionar Currículo')}
      </button>
      {isEditing && <button type="button" onClick={onCancelEdit} disabled={isLoading} style={{ marginLeft: '10px' }}>Cancelar Edição</button>}
    </form>
  );
};

export default ResumeForm;