# backend/code_editor/serializers.py
from rest_framework import serializers
from .models import CodeFile

class CodeFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CodeFile
        fields = ['id', 'name', 'content', 'language', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
    
    def create(self, validated_data):
        # Associate the current user with the code file
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)