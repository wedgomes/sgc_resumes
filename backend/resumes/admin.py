from django.contrib import admin
from .models import Resume


@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'email', 'phone', 'source', 'status', 'uploaded_at', 'original_file')
    list_filter = ('status', 'source', 'uploaded_at')
    search_fields = ('full_name', 'email', 'phone', 'skills_summary', 'experience_summary', 'full_text_content')
    readonly_fields = ('uploaded_at', 'updated_at', 'full_text_content') # full_text_content será preenchido por lógica

    fieldsets = (
        (None, {
            'fields': ('full_name', 'email', 'phone', 'linkedin_url')
        }),
        ('Conteúdo do Curriculo', {
            'classes': ('collapse',), # Para iniciar colapsado
            'fields': ('education_summary', 'experience_summary', 'skills_summary', 'full_text_content')
        }),
        ('Arquivo e Status', {
            'fields': ('original_file', 'source', 'status', 'notes')
        }),
        ('Datas Importantes', {
            'fields': ('uploaded_at', 'updated_at')
        }),
    )
