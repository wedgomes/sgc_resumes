from django.db import models
from django.utils import timezone
import uuid # Para nomes de arquivo únicos

# Função para gerar nomes de arquivo únicos para os curriculos
def resume_upload_path(instance, filename):
    # O arquivo será salvo em MEDIA_ROOT/resumes/<uuid>.<extensao_original>
    ext = filename.split('.')[-1]
    unique_filename = f"{uuid.uuid4()}.{ext}"
    return f"resumes/{unique_filename}"

class Resume(models.Model):
    # Informações básicas do candidato (inicialmente podem estar vazias e preenchidas após parsing)
    full_name = models.CharField(max_length=255, blank=True, null=True)
    email = models.EmailField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=255, blank=True, null=True)
    linkedin_url = models.URLField(max_length=500, blank=True, null=True)

    # Campos para armazenar o texto extraído (ou resumos)
    # Usando TextField pois podem ser longos
    education_summary = models.TextField(blank=True, null=True)
    experience_summary = models.TextField(blank=True, null=True)
    skills_summary = models.TextField(blank=True, null=True)

    # Arquivo original do curriculo
    original_file = models.FileField(upload_to=resume_upload_path)
    # Texto completo extraído do arquivo (após OCR/parsing)
    full_text_content = models.TextField(blank=True, null=True, help_text="Conteúdo completo extraído do arquivo original.")


    # Metadados
    SOURCE_CHOICES = [
        ('email', 'E-mail'),
        ('physical', 'Físico (Digitalizado)'),
        ('manual', 'Cadastro Manual'),
        ('other', 'Outro'),
    ]
    source = models.CharField(max_length=10, choices=SOURCE_CHOICES, default='manual')

    STATUS_CHOICES = [
        ('pending_review', 'Pendente de Revisão'),
        ('under_review', 'Em Revisão'),
        ('shortlisted', 'Pré-selecionado'),
        ('interview_scheduled', 'Entevista Agendada'),
        ('rejected', 'Rejeitado'),
        ('hired', 'Contratado'),
    ]
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='pending_review')
    notes = models.TextField(blank=True, null=True, help_text="Anotações internas sobre o candidato.")


    uploaded_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.full_name or 'Curriculo Pendente'} - {self.email or self.original_file.name}"
    
    class Meta:
        ordering = ['-uploaded_at']
        verbose_name = "Curriculo"
        verbose_name_plural = "Curriculos"
