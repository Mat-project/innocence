from django.shortcuts import render
from rest_framework import status, viewsets, generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Skill, Profile
from .serializers import SkillSerializer
import logging

logger = logging.getLogger(__name__)

class SkillViewSet(viewsets.ModelViewSet):
    """ModelViewSet for handling Skills with additional logging"""
    serializer_class = SkillSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return skills for the authenticated user"""
        try:
            profile, _ = Profile.objects.get_or_create(user=self.request.user)
            return Skill.objects.filter(profile=profile)
        except Exception as e:
            logger.error(f"Error in SkillViewSet.get_queryset: {str(e)}")
            return Skill.objects.none()
    
    def create(self, request, *args, **kwargs):
        """Enhanced create method with error handling and logging"""
        try:
            logger.info(f"Creating skill with data: {request.data}")
            profile, _ = Profile.objects.get_or_create(user=request.user)
            
            # Create serializer with profile set
            serializer = self.get_serializer(data=request.data)
            
            if not serializer.is_valid():
                logger.error(f"Validation errors: {serializer.errors}")
                return Response(
                    serializer.errors, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            # Save with the user's profile
            serializer.save(profile=profile)
            
            logger.info(f"Skill created successfully: {serializer.data}")
            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            logger.error(f"Error creating skill: {str(e)}")
            return Response(
                {"error": f"Failed to create skill: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

    def update(self, request, *args, **kwargs):
        """Enhanced update method with error handling and logging"""
        try:
            logger.info(f"Updating skill with data: {request.data}")
            instance = self.get_object()
            
            serializer = self.get_serializer(instance, data=request.data, partial=False)
            if not serializer.is_valid():
                logger.error(f"Validation errors: {serializer.errors}")
                return Response(
                    serializer.errors, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            self.perform_update(serializer)
            
            logger.info(f"Skill updated successfully: {serializer.data}")
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error updating skill: {str(e)}")
            return Response(
                {"error": f"Failed to update skill: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
    def destroy(self, request, *args, **kwargs):
        """Enhanced destroy method with error handling"""
        try:
            instance = self.get_object()
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            logger.error(f"Error deleting skill: {str(e)}")
            return Response(
                {"error": f"Failed to delete skill: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )