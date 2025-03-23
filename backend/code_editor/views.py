# backend/code_editor/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import CodeFile
from .serializers import CodeFileSerializer
import sys
import io
import traceback
from django.http import StreamingHttpResponse
import subprocess
from threading import Thread
import tempfile
import os

class CodeFileViewSet(viewsets.ModelViewSet):
    serializer_class = CodeFileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Return only files that belong to the current user
        return CodeFile.objects.filter(owner=self.request.user)
    
    @action(detail=False, methods=['post'])
    def execute(self, request):
        """Execute code and return the output"""
        code = request.data.get('code', '')
        language = request.data.get('language', 'python')
        input_data = request.data.get('input', '')
        
        if language != 'python':
            return Response(
                {"error": f"Language '{language}' execution is not supported on the server."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Create a temporary file for the code
            with tempfile.NamedTemporaryFile(suffix='.py', delete=False, mode='w') as temp_file:
                temp_file.write(code)
                temp_file_path = temp_file.name
            
            # Run the code in a subprocess with a timeout
            process = subprocess.Popen(
                ['python', temp_file_path],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                bufsize=1
            )
            
            # Provide input if any
            stdout, stderr = process.communicate(input=input_data, timeout=10)
            
            # Clean up the temporary file
            os.unlink(temp_file_path)
            
            if stderr:
                return Response({"output": stderr, "error": True})
            else:
                return Response({"output": stdout, "error": False})
                
        except subprocess.TimeoutExpired:
            process.kill()
            return Response(
                {"error": "Execution timed out (limit: 10 seconds)"},
                status=status.HTTP_408_REQUEST_TIMEOUT
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )