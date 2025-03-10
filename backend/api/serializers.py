from rest_framework import serializers
from .models import Profile

class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(required=False)
  
    class Meta:
        model = Profile
        fields = [
            "username", "email", "bio", "profile_image", "cover_image", 
            "phone", "linkedin", "github", "country",
            "task_completion_rate", "avg_work_hours", "best_work_time"
        ]
        extra_kwargs = {
            "bio": {"required": False},
            "phone": {"required": False},
            "profile_image": {"required": False},
            "cover_image": {"required": False},
            "linkedin": {"required": False},
            "github": {"required": False},
            "country": {"required": False},
        }
  
    def update(self, instance, validated_data):
        instance.bio = validated_data.get('bio', instance.bio)
        instance.email = validated_data.get('email', instance.email)
        instance.phone = validated_data.get('phone', instance.phone)
        instance.country = validated_data.get('country', instance.country)
        instance.linkedin = validated_data.get('linkedin', instance.linkedin)
        instance.github = validated_data.get('github', instance.github)
        if validated_data.get('profile_image') is not None:
            instance.profile_image = validated_data.get('profile_image')
        if validated_data.get('cover_image') is not None:
            instance.cover_image = validated_data.get('cover_image')
        instance.save()
        return instance