import React, {useState, useEffect} from "react";
import { fetchResumes, deleteResume } from "../services/api";

const ResumeList = ({ onEdit }) => { // Adicionada prop onEdit
    const [resumes, setResumes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadResumes = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetchResumes();
            setResumes(response.data);
        } catch (err) {
            console.error("Erro ao buscar curriculos: ", err);
            setError("Falha ao carregar curriculos");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadResumes();
    }, []); // Carrega na montagem inicial

    const handleDelete = async (id) => {
        if(window.confirm('Tem certeza que deseja excluir este curriculo?')){
            try {
                await deleteResume(id);
                loadResumes(); // Recarrega a lista após a exclusão
            } catch (error) {
                console.error("Error ao excluir curriculo: ", err);
                alert("Falha ao excluir curriculo.");
            }
        }
    };

    if (isLoading) return <p>Carregando curriculos...</p>;
    if (error) return <p style={{ color: 'red'}}>{error}</p>;

    return (
        <div>
            <h2>Lista de Curriculos</h2>
            {resumes.length === 0 && !isLoading && <p>Nenhum curriculo cadastrado</p>}
            <ul style={{ listStyleType: 'none', padding: '0'}}>
                {resumes.map(resume =>(
                    <li key={resume.id} style={{ border: '1px solid #eee', padding: '15px', marginBottom: '10px' }}>
                        <h3>{resume.full_name || 'Nome não informado'}</h3>
                        <p><strong>Email: </strong> {resume.email || 'N/A'} </p>
                        <p><strong>Telefone: </strong> {resume.phone || 'N/A'} </p>
                        <p><strong>Status: </strong> {resume.status || 'N/A'} </p>
                        <p><strong>Origem: </strong> {resume.source || 'N/A'} </p>
                        {resume.original_file_url && (
                            <p>
                                <a href={resume.original_file_url} target="_blank" rel="noopner noreferrer">
                                    Ver Arquivo Original
                                </a>
                            </p>
                        )}
                        <p><em>Enviado em: {new Date(resume.uploaed_at).toLocaleString()}</em></p>
                        <button onClick={() => onEdit(resume.id)} style={{marginRight: '10px'}}>Editar</button>
                        <button onClick={() => handleDelete(resume.id)}>Excluir</button>
                    </li>
                ))}
            </ul>
            <button onClick={loadResumes} disabled={isLoading}>Atualizar Lista</button>
        </div>
    );
};

export default ResumeList;