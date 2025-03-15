# backend/code_editor/views.py
from rest_framework import viewsets, permissions
from .models import CodeFile
from .serializers import CodeFileSerializer

class CodeFileViewSet(viewsets.ModelViewSet):
    serializer_class = CodeFileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Return only files that belong to the current user
        return CodeFile.objects.filter(owner=self.request.user)