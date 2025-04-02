from rest_framework import serializers
from .models import Folder, File
from django.utils import timezone

class FileSerializer(serializers.ModelSerializer):
    path = serializers.SerializerMethodField()
    
    class Meta:
        model = File
        fields = [
            'id', 'name', 'content', 'folder', 'user', 'language',
            'created_at', 'updated_at', 'last_accessed', 'path', 'is_deleted'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'user', 'path']
    
    def get_path(self, obj):
        return obj.get_full_path()
    
    def create(self, validated_data):
        # Set the user from the request
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        """Ensure content updates are properly handled"""
        # Update the content field
        if 'content' in validated_data:
            instance.content = validated_data.get('content', instance.content)
        
        # Update other fields if needed
        instance.name = validated_data.get('name', instance.name)
        instance.language = validated_data.get('language', instance.language)
        instance.last_accessed = timezone.now()
        
        instance.save()
        return instance


class FolderListSerializer(serializers.ModelSerializer):
    path = serializers.SerializerMethodField()
    
    class Meta:
        model = Folder
        fields = ['id', 'name', 'parent_folder', 'user', 'created_at', 'updated_at', 'path', 'is_deleted']
        read_only_fields = ['id', 'created_at', 'updated_at', 'user', 'path']
    
    def get_path(self, obj):
        return obj.get_full_path()
    
    def create(self, validated_data):
        # Set the user from the request
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class FolderDetailSerializer(serializers.ModelSerializer):
    files = FileSerializer(many=True, read_only=True)
    children = serializers.SerializerMethodField()
    path = serializers.SerializerMethodField()
    
    class Meta:
        model = Folder
        fields = [
            'id', 'name', 'parent_folder', 'user', 'created_at', 
            'updated_at', 'files', 'children', 'path', 'is_deleted'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'user', 'files', 'children', 'path']
    
    def get_children(self, obj):
        # Only get direct children, not recursive
        return FolderListSerializer(
            obj.children.filter(is_deleted=False), 
            many=True, 
            context=self.context
        ).data
    
    def get_path(self, obj):
        return obj.get_full_path()