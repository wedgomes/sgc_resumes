from rest_framework import serializers
from .models import Resume

class ResumeSerializer(serializers.ModelSerializer):
    original_file_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Resume
        fields = [
            'id',
            'full_name',
            'email',
            'phone',
            'linkedin_url',
            'education_summary',
            'experience_summary',
            'skills_summary',
            'full_text_content',
            'original_file',       # Campo para upload/atualização
            'original_file_url',   # Campo apenas para leitura da URL
            'source',
            'status',
            'notes',
            'uploaded_at',
            'updated_at',
        ]
        read_only_fields = ('id', 'uploaded_at', 'updated_at', 'full_text_content', 'original_file_url')

        # ADICIONE ESTA SEÇÃO:
        extra_kwargs = {
            'original_file': {'required': False, 'allow_null': True, 'allow_empty_file': True}
        }

    def get_original_file_url(self, obj):
        request = self.context.get('request')
        if obj.original_file and hasattr(obj.original_file, 'url') and request:
            return request.build_absolute_uri(obj.original_file.url)
        return None