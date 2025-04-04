from rest_framework import serializers
from .models import Skill

class SkillSerializer(serializers.ModelSerializer):
    """Serializer for the Skill model with enhanced validation"""
    
    class Meta:
        model = Skill
        fields = ['id', 'name', 'category', 'level']
        read_only_fields = ['id']
        
    def validate_name(self, value):
        """Ensure name is not empty and properly formatted"""
        if not value or not value.strip():
            raise serializers.ValidationError("Skill name cannot be empty")
        return value.strip()
        
    def validate_category(self, value):
        """Validate category field"""
        valid_categories = ['technical', 'soft']
        if value not in valid_categories:
            raise serializers.ValidationError(f"Category must be one of: {', '.join(valid_categories)}")
        return value
        
    def validate_level(self, value):
        """Validate level field"""
        valid_levels = ['Beginner', 'Intermediate', 'Expert']
        if value not in valid_levels:
            raise serializers.ValidationError(f"Level must be one of: {', '.join(valid_levels)}")
        return value
        
    def to_representation(self, instance):
        """Customize the response output"""
        representation = super().to_representation(instance)
        representation['id'] = str(instance.id)  # Ensure ID is a string
        return representation