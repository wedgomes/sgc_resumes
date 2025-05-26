import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/', // URL base da sua API Django
    headers: {
        'Content-Type': 'application/json' // Padrão para a maioria das requisições
    },
});

export const fetchResumes = () => {
    return apiClient.get('resumes/');
};

export const createResume = (resumeData) => {
    // Para upload de arquivos, precisamos usar FormData e multipart/form-data
    //O header será definido automaticamente pelo axios ao usar FormData
    return apiClient.post('resumes/', resumeData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const getResumeDetails = (id) => {
    return apiClient.get('resumes/${id}/');
};

export const updateResume = (id, resumeData) => {
    // Se estiver atualizando um arquivo, use FormData também
    // Se for apenas JSON, ajuste o Content-Type
    let headers = {'Content-Type': 'application/json'};
    let data = resumeData;

    if(resumeData instanceof FormData){
        headers = {'Content-Type': 'multipart/Form-data'};
    }

    return apiClient.put('resumes/${id}/', data, {headers});
};

export const deleteResume = (id) => {
    return apiClient.delete('resumes/${id}/');
}