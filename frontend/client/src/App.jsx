import React, { useState, useEffect, useCallback } from 'react';
import ResumeForm from './components/ResumeForm';
import ResumeList from './components/ResumeList';
import { fetchResumes } from './services/api'; // Usaremos para recarregar a lista
import './App.css'

function App() {
  const [editingResumeId, setEditingResumeId] = useState(null);
  // Estado para forçar a atualização da lista, se necessário.
  // ou melhor, passar a função de recarregar para o form
  const [refreshListKey, setRefreshListKey] = useState(0); // Apenas para o ResumeList

  // Para o ResumeList ser uma dependência do useEffect do ResumeList,
  // vamos apenas passar uma função que o ResumeList possa chamar para recarregar
  // No entanto, o ResumeList já tem seu próprio botão de "Atualizar Lista" e
  // recarrega após a exclusão.
  // O principal é que o ResumeForm avise o App para limpar o formulário de edição
  // e potencialmente avisar o ResumeList.

  const handleFormSubmit = useCallback(() => {
    console.log("Formulário submetido, atualizando lista...");
    setEditingResumeId(null); // Sai do modo de edição
    // Para atualizar a lista, podemos apenas mudar uma 'chave' ou ter o ResumeList
    // expor uma função de recarga, mas para simplificar, o ResumeList já se atualiza
    // após deleção e tem um botão de refresh. O App pode forçar um re-render da lista
    // se passarmos uma prop que muda.
    setRefreshListKey(prevKey => prevKey + 1); // Força o ResumeList a recarregar via prop (ou o próprio list pode buscar)
  }, []);

  const handleEdit = (id) => {
    setEditingResumeId(id);
  };

  const handleCancelEdit = () => {
    setEditingResumeId(null);
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Sistema de Gerenciamento de Curriculos</h1>
      </header>

      <main>
        <ResumeForm 
          key={editingResumeId || 'new'} // Para resetar o formulário ao mudar de edição para novo
          resumeId={editingResumeId}
          onFormSubmit={handleFormSubmit}
          onCancelEdit={handleCancelEdit}
        />
        <ResumeList 
          key={refreshListKey} // Para que o App possa forçar o refresh
          onEdit={handleEdit}
        />
      </main>
    </div>
  );
}

export default App
