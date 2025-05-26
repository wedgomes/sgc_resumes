import React, {useState, useEffect} from "react";
import { createResume, getResumeDetails, updateResume } from "../services/api";
import { formToJSON } from "axios";

const ResumeForm = ({ resumeId, onFormSubmit, onCancelEdit }) => {
    const [FormData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        linkedin_url: '',
        education_summary: '',
        experience_summary: '',
        skills_summary: '',
        source: 'manual', // Valor padrão
        status: 'pending_review', // Valor padrão
        notes: '',
        original_file: null,
    });
    const [fileName, setFileName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const isEditing = !!resumeId;

    useEffect(() => {
        if(isEditing){
            const fetchResumeData = async () => {
                setIsLoading(true);
                try{
                    const response = await getResumeDetails(resumeId);
                    const { original_file, ...restData } = response.data;
                    // Não preenchemos 'original_file' pois é um input de arquivo
                    // e não podemos definr seu valr programaticamente por segurança.
                    // O usuário precisará selecionar o arquivo novamentye se quiser alterá-lo
                    setFormData({ ...restData, original_file: null });
                    setFileName(original_file ? original_file.split('/').pop() : ''); // Apenas para mostrar o nome
                }catch (err) {
                    console.error("Erro ao buscar dados do currículo:", err);
                    setError("Falha ao carregar dados para edição");
                }finally {
                    setIsLoading(false);
                }
            };
            fetchResumeData();
        }else {
            // Reset formulário para novo cadastro
            setFormData({
                full_name: '', email: '', phone: '', linkedin_url: '', education_summary: '', experience_summary: '',
                skills_summary: '', source: 'manual', status: 'pending_review', notes: '', original_file: null,
            });
            setFileName('');
        }
    }, [resumeId, isEditing]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value}));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, original_file: e.target.files[0] }));
        setFileName(e.target.files[0] ? e.target.files[0].name: '');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const data = new FormData();
        // Adiciona apenas os campos que têm valor ou são o arquivo
        for (const key in FormData){
            if(FormData[key] !== null && FormData[key] !== ''){
                data.append(key, FormData[key]);
            }
        }
        // Se não houver um novo arquivo selecionado na edição e não for obrigatório, não envie 'original_file'
        // Ou, se for uma criação e não houver arquivo (caso seja opcional)
        // A API Django (FileField) pode lidar com 'original_file' sendo null ou não presente se blank=True, null=True

        try {
            if(isEditing){
                // Se não houver novo arquivo, não envie 'original_file' para não sobrescrever com null
                // A menos que a lógica da API exija explicitamente.
                // O DRF permite atualizações parciais (PATCH) ou PUT onde campos não enviados não são alterados.
                // Se original_file for null no estado, e não for selecionado um novo,
                // não o adicionamos ao FormData para PUT, para não apagar o arquivo existente
                // a menos que seja intencional (ex: ter um botão "remover arquivo")
                if(!FormData.original_file){
                    data.delete('original_file'); // Não envia o camp se não houver novo arquivo
                }
                await updateResume(resumeId, data);

            }else{
                if(!FormData.original_file){
                    alert("Por favor, selecione um arquivo para o currículo.");
                    setIsLoading(false);
                    return;
                }
                await createResume(data);
            }
            onFormSubmit(); // Chama a função para atualizar a lista, etc.
                            // Reseta o formulário após o envio (especialmente para criação)
                
            if(!isEditing){
                setFormData({
                    full_name:'', email:'', phone:'', linkedin_url:'', education_summary:'', experience_summary:'',
                    skills_summary:'', source:'manual', status:'pending_review', notes:'', original_file: null
                });
                setFileName('');
            }
        } catch (error) {
            console.error("Erro ao enviar curriculo: ", err.response ? err.response.data : error.message);
            setError('Falha ao enviar curriculo: ${err.response && err.response.data ? JSON.stringify(err.response.data) : err.message}');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && isEditing) return <p>Carregando dados do curriculo...</p>;

    return(
        <form onSubmit={handleSubmit} style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ccc' }}>
            <h3>{isEditing ? 'Editar Curriculo' : 'Adicionar Novo Curriculo'}</h3>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div>
                <label>Nome Completo: </label>
                <input type="text" name="full_name" value={FormData.full_name} onChange={handleChange}/>
            </div>
            <div>
                <label>E-mail: </label>
                <input type="email" name="email" value={FormData.email} onChange={handleChange}/>
            </div>
            <div>
                <label>Telefone: </label>
                <input type="text" name="phone" value={FormData.phone} onChange={handleChange}/>
            </div>
            <div>
                <label>Linkedin URL</label>
                <input type="url" name="linkedin_url" value={FormData.linkedin_url} onChange={handleChange}/>
            </div>
            <div>
                <label>Resumo da Educação: </label>
                <textarea name="education_summary" value={FormData.education_summary} onChange={handleChange}></textarea>
            </div>
            <div>
                <label>Resumo da Experiência: </label>
                <textarea name="experience_summary" value={FormData.experience_summary} onChange={handleChange}></textarea>
            </div>
            <div>
                <label>Resumo das Habilidades: </label>
                <textarea name="skills_summary" value={FormData.skills_summary} onChange={handleChange}></textarea>
            </div>
            <div>
                <label>Origem: </label>
                <select name="source" value={FormData.source} onChange={handleChange}>
                    <option value="manual">Cadastro Manual</option>
                    <option value="email">E-mail</option>
                    <option value="physical">Físico (Digitalizado)</option>
                    <option value="other">Outro</option>
                </select>
            </div>
            <div>
                <label>Status: </label>
                <select name="status" value={FormData.status} onChange={handleChange}>
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
                <textarea name="notes" value={FormData.notes} onChange={handleChange}></textarea>
            </div>
            <div>
                <label>Arquivo do Curriculo (PDF, DOCX): </label>
                <input type="file" name="original_file" onChange={handleChange} accept=".pdf, .doc, .docx" />
                {fileName && <p>Arquivo selecionado: {fileName}</p>}
                {isEditing && !fileName && FormData.original_file_url && <p>Arquivo atual: <a href={FormData.original_file_url} target="_blank" rel="noopener noreferrer">Ver arquivo</a> (selecione um novo para substituir)</p>}
            </div>
            <button type="submit" disabled={isLoading}>
                {isLoading ? (isEditing ? 'Salvando...' : 'Enviando...') : (isEditing ? 'Salvar Alterações' : 'Adicionar Curriculo')}
            </button>
            {isEditing && <button type="button" onClick={onCancelEdit} disabled={isLoading} style={{marginLeft: '10px'}}>Cancelar Edição</button>}
        </form>
    );
};

export default ResumeForm;