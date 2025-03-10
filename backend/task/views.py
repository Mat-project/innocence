from django.shortcuts import render
from rest_framework import generics
from .models import Task
from .serializers import TaskSerializer

class TaskListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer

    def get_queryset(self):
        # Return only tasks where the owner is the authenticated user
        return Task.objects.filter(owner=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        # Save the task with the current user as the owner
        serializer.save(owner=self.request.user)

class TaskRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer

    def get_queryset(self):
        # Only allow a user to retrieve/update/delete their own tasks
        return Task.objects.filter(owner=self.request.user)

# Create your views here.
