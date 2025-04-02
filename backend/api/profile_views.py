from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
import uuid
from .models import Profile
from .serializers import (SkillSerializer, ExperienceSerializer,
                          EducationSerializer, PortfolioSerializer)

class SkillsAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        profile = Profile.objects.get(user=request.user)
        skills = profile.skills or []
        serializer = SkillSerializer(skills, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        serializer = SkillSerializer(data=request.data)
        if serializer.is_valid():
            profile = Profile.objects.get(user=request.user)
            skill_data = serializer.validated_data
            skill_data['id'] = str(uuid.uuid4())
            
            skills = profile.skills or []
            skills.append(skill_data)
            profile.skills = skills
            profile.save()
            
            return Response(skill_data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SkillDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get_skill(self, user, pk):
        profile = Profile.objects.get(user=user)
        skills = profile.skills or []
        
        for i, skill in enumerate(skills):
            if skill.get('id') == pk:
                return profile, skills, i
                
        return profile, skills, None
    
    def get(self, request, pk):
        _, skills, idx = self.get_skill(request.user, pk)
        if idx is None:
            return Response({"detail": "Skill not found"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = SkillSerializer(skills[idx])
        return Response(serializer.data)
        
    def put(self, request, pk):
        profile, skills, idx = self.get_skill(request.user, pk)
        if idx is None:
            return Response({"detail": "Skill not found"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = SkillSerializer(data=request.data)
        if serializer.is_valid():
            skills[idx] = {**serializer.validated_data, 'id': pk}
            profile.skills = skills
            profile.save()
            return Response(skills[idx])
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        profile, skills, idx = self.get_skill(request.user, pk)
        if idx is None:
            return Response({"detail": "Skill not found"}, status=status.HTTP_404_NOT_FOUND)
        
        skills.pop(idx)
        profile.skills = skills
        profile.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

# Similar implementation for Experience, Education and Portfolio
class ExperienceAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        profile = Profile.objects.get(user=request.user)
        experience = profile.experience or []
        serializer = ExperienceSerializer(experience, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        serializer = ExperienceSerializer(data=request.data)
        if serializer.is_valid():
            profile = Profile.objects.get(user=request.user)
            exp_data = serializer.validated_data
            exp_data['id'] = str(uuid.uuid4())
            
            experience = profile.experience or []
            experience.append(exp_data)
            profile.experience = experience
            profile.save()
            
            return Response(exp_data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Add similar classes for EducationAPIView, PortfolioAPIView, etc.
