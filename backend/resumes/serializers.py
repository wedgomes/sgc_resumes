from rest_framework import serializers
from .models import Resume

class ResumeSerializer(serializers.ModelSerializer):
    original_file_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Resume
        fields =[
            'id',
            'full_name',
            'email',
            'phone',
            'linkedin_url',
            'education_summary',
            'experience_summary',
            'skills_summary',
            'full_text_content', # Permitir leitura, mas o preenchimento será via lógica de parsing
            'original_file', # Para upload
            'original_file_url', # Para exibir o link do arquivo
            'source',
            'status',
            'notes',
            'uploaded_at',
            'updated_at',
        ]
        read_only_fields = ('id', 'uploaded_at', 'updatedat', 'full_text_content', 'original_file_url')

    def get_original_file_url(self, obj):
        request = self.context.get('request')
        if obj.original_file and request:
            return request.build_absolute_uri(obj.original_file.url)
        return None