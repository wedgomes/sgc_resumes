from django.shortcuts import render

from rest_framework import viewsets, status, parsers, filters # Adicionar filters
from rest_framework.response import Response
from .models import Resume
from .serializers import ResumeSerializer
# Placeholder para a lógica de parsing que será adicionada depois
# from . services import parse_resume_file # Importaremos isso no futuro

class ResumeViewSet(viewsets.ModelViewSet):
    queryset = Resume.objects.all().order_by('-uploaded_at') # Adicionado order_by aqui como exemplo
    serializer_class = ResumeSerializer
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser] # Para lidar com upload de arquivos e JSON

     # Configuração do Filtro
    filter_backends = [filters.SearchFilter, filters.OrderingFilter] # Adiciona SearchFilter

    # Campos nos quais a busca será realizada
    # Ajuste esta lista conforme os campos que você quer que sejam pesquisáveis
    search_fields = [
        'full_name', 
        'email', 
        'phone',
        'status',       # Se status for um CharField com as chaves (ex: 'pending_review')
        'source',       # Se source for um CharField com as chaves
        'skills_summary', 
        'experience_summary', 
        'education_summary',
        'full_text_content' # Se você extrai todo o texto do currículo
    ]
    ordering_fields = ['full_name', 'uploaded_at', 'status'] # Campos que podem ser ordenados (opcional)


    def perform_create(self, serializer):
        # Salva o objeto Resume com o arquivo
        resume_instance = serializer.save()

        # --- PONTO DE PARTIDA PARA LÓGICA DE UPLOAD DE ARQUIVOS E PARSING ---
        # Após o arquivo ser salvo, você pode iniciar o processo de parsing.
        # Esta é uma implementação MUITO BÁSICA. Idealmente, isso seria assíncrono (Celery).

        if resume_instance.original_file:
            file_path = resume_instance.original_file.path
            # Placeholder: Chamar uma função para processar o arquivo
            # extracted_data = parse_resume_file(file_path) # Esta função ainda não existe
            #
            # if extracted_data:
            #     resume_instance.full_name = extracted_data.get('name', resume_instance.full_name)
            #     resume_instance.email = extracted_data.get('email', resume_instance.email)
            #     resume_instance.phone = extracted_data.get('phone', resume_instance.phone)
            #     resume_instance.full_text_content = extracted_data.get('full_text', resume_instance.full_text_content)
            #     # ... preencher outros campos ...
            #     resume_instance.save() # Salvar as atualizações
            print(f"Arquivo salvo em: {file_path}. Lógica de parsing a ser implementada aqui.")

