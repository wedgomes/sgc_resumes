import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/', // URL base da sua API Django
  headers: {
    'Content-Type': 'application/json', // Padrão para a maioria das requisições
  },
});

// ATUALIZADO: fetchResumes agora aceita um número de página
export const fetchResumes = (page = 1) => { // Default para a página 1
  return apiClient.get('resumes/', {
    params: {
      page: page, // Envia ?page=X na URL
      // Se sua API usar um nome diferente para o parâmetro de página, ajuste aqui.
      // Se sua API tiver um tamanho de página fixo e você precisar enviá-lo, adicione:
      // page_size: ITEMS_PER_PAGE, (onde ITEMS_PER_PAGE é o número de itens por página)
    }
  });
};

export const createResume = (resumeData) => {
  // Para upload de arquivos, precisamos usar FormData.
  // O header Content-Type: multipart/form-data é definido automaticamente pelo axios ao usar FormData.
  return apiClient.post('resumes/', resumeData, {
    // Não é estritamente necessário definir o header aqui se resumeData for FormData,
    // mas se você quiser ser explícito:
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getResumeDetails = (id) => {
  // CORRIGIDO: Usando backticks (template literals) para interpolação de string
  return apiClient.get(`resumes/${id}/`);
};

export const updateResume = (id, resumeData) => {
  let headers = { 'Content-Type': 'application/json' }; // Padrão para dados JSON
  let dataToSend = resumeData;

  if (resumeData instanceof FormData) {
    // Se for FormData, o Axios geralmente lida com o Content-Type.
    // Se você precisar definir explicitamente, use o valor correto.
    // Para FormData, você pode omitir a configuração explícita do header Content-Type aqui,
    // pois o Axios o fará corretamente. Se definir, use:
    // headers = { 'Content-Type': 'multipart/form-data' }; // CORRIGIDO: 'form-data' minúsculo
    // No entanto, é mais seguro deixar o Axios definir para FormData.
    // Se você remover a linha abaixo, Axios usará o Content-Type apropriado para FormData.
    delete headers['Content-Type']; // Deixa o Axios definir para FormData
  }
  
  // CORRIGIDO: Usando backticks (template literals) para interpolação de string
  return apiClient.put(`resumes/${id}/`, dataToSend, { headers });
};


export const deleteResume = (id) => {
  // CORRIGIDO: Usando backticks (template literals) para interpolação de string
  return apiClient.delete(`resumes/${id}/`);
};

export default apiClient;