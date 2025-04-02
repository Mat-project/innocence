from django.shortcuts import render
from rest_framework import viewsets, permissions, status, views
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.db.models import Q

from .models import Folder, File
from .serializers import FolderListSerializer, FolderDetailSerializer, FileSerializer

import subprocess
import tempfile
import os
import json
import sys

class FolderViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing folders
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return folders belonging to the current user that aren't deleted"""
        return Folder.objects.filter(user=self.request.user, is_deleted=False)
    
    def get_serializer_class(self):
        """Use different serializers for list and detail views"""
        if self.action == 'retrieve':
            return FolderDetailSerializer
        return FolderListSerializer
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['get'])
    def contents(self, request, pk=None):
        """Return all contents (files and folders) inside a folder"""
        folder = self.get_object()
        
        # Get all child folders
        child_folders = folder.children.filter(is_deleted=False)
        child_folders_data = FolderListSerializer(child_folders, many=True, context={'request': request}).data
        
        # Get all files in the folder
        files = folder.files.filter(is_deleted=False)
        files_data = FileSerializer(files, many=True, context={'request': request}).data
        
        return Response({
            'folders': child_folders_data,
            'files': files_data
        })
    
    @action(detail=False, methods=['get'])
    def tree(self, request):
        """Return folder tree structure for the user"""
        # Get root folders (those without a parent)
        root_folders = self.get_queryset().filter(parent_folder=None)
        
        def build_tree(folder):
            """Recursively build folder tree"""
            result = {
                'id': str(folder.id),
                'name': folder.name,
                'type': 'folder',
                'children': []
            }
            
            # Add child folders
            for child in folder.children.filter(is_deleted=False):
                result['children'].append(build_tree(child))
            
            # Add files
            for file in folder.files.filter(is_deleted=False):
                result['children'].append({
                    'id': str(file.id),
                    'name': file.name,
                    'type': 'file',
                    'language': file.language
                })
            
            return result
        
        tree = []
        for folder in root_folders:
            tree.append(build_tree(folder))
        
        return Response(tree)
    
    @action(detail=True, methods=['delete'])
    def soft_delete(self, request, pk=None):
        """Soft delete a folder and all its contents"""
        folder = self.get_object()
        
        # Mark folder as deleted
        folder.is_deleted = True
        folder.save()
        
        # Mark all child folders and files as deleted
        for child in folder.get_all_children(include_files=True):
            child.is_deleted = True
            child.save()
        
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=False, methods=['get'])
    def deleted(self, request):
        """Return all soft-deleted folders"""
        deleted_folders = Folder.objects.filter(user=self.request.user, is_deleted=True)
        serializer = FolderListSerializer(deleted_folders, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        """Restore a soft-deleted folder and all its contents"""
        # Get the folder even if it's deleted
        folder = get_object_or_404(Folder, pk=pk, user=self.request.user, is_deleted=True)
        
        # Restore the folder
        folder.is_deleted = False
        folder.save()
        
        # Restore parent folders if needed
        current = folder.parent_folder
        while current and current.is_deleted:
            current.is_deleted = False
            current.save()
            current = current.parent_folder
        
        # Restore all child contents
        for child in folder.get_all_children(include_files=True):
            child.is_deleted = False
            child.save()
        
        serializer = FolderDetailSerializer(folder, context={'request': request})
        return Response(serializer.data)


class FileViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing files
    """
    serializer_class = FileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return files belonging to the current user that aren't deleted"""
        return File.objects.filter(user=self.request.user, is_deleted=False)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    def retrieve(self, request, *args, **kwargs):
        """When retrieving a file, update last_accessed"""
        instance = self.get_object()
        instance.last_accessed = timezone.now()
        instance.save(update_fields=['last_accessed'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def update(self, request, *args, **kwargs):
        """Override update to handle content changes"""
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        
        # Update the file content
        instance = serializer.save()
        
        # Log the content update for debugging
        content_length = len(request.data.get('content', ''))
        print(f"File {instance.id} updated. Content length: {content_length}")
        
        return Response(serializer.data)
    
    @action(detail=True, methods=['delete'])
    def soft_delete(self, request, pk=None):
        """Soft delete a file"""
        file = self.get_object()
        file.is_deleted = True
        file.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=False, methods=['get'])
    def deleted(self, request):
        """Return all soft-deleted files"""
        deleted_files = File.objects.filter(user=self.request.user, is_deleted=True)
        serializer = FileSerializer(deleted_files, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        """Restore a soft-deleted file"""
        # Get the file even if it's deleted
        file = get_object_or_404(File, pk=pk, user=self.request.user, is_deleted=True)
        
        # Restore the file
        file.is_deleted = False
        file.save()
        
        # Restore parent folder if needed
        if file.folder and file.folder.is_deleted:
            folder = file.folder
            folder.is_deleted = False
            folder.save()
            
            # Restore parent folders if needed
            current = folder.parent_folder
            while current and current.is_deleted:
                current.is_deleted = False
                current.save()
                current = current.parent_folder
        
        serializer = FileSerializer(file, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Return recently accessed files"""
        recent_files = self.get_queryset().order_by('-last_accessed')[:10]
        serializer = FileSerializer(recent_files, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Search files by name or content"""
        query = request.query_params.get('q', '')
        if not query:
            return Response([])
        
        files = self.get_queryset().filter(
            Q(name_icontains=query) | Q(content_icontains=query)
        )
        serializer = FileSerializer(files, many=True, context={'request': request})
        return Response(serializer.data)


class RunPythonCodeView(views.APIView):
    """
    API view to execute Python code and return results
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, format=None):
        code = request.data.get('code', '')
        inputs = request.data.get('inputs', [])
        
        if not code:
            return Response({'error': 'No code provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        print(f"Running code with {len(inputs)} inputs: {inputs}")
        
        # Create a temporary file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as temp_file:
            temp_filename = temp_file.name
            temp_file.write(code)
        
        try:
            # Prepare input string (join all inputs with newlines)
            input_string = '\n'.join(inputs) + '\n' if inputs else ''
            
            # Run the process with inputs
            process = subprocess.Popen(
                [sys.executable, temp_filename],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            # Send inputs and get output
            stdout, stderr = process.communicate(input=input_string, timeout=10)
            
            # Check if there might be an input prompt in the output
            # This is a simple heuristic - if stdout ends with a non-newline character
            # and doesn't have an error, it might be waiting for input
            needs_input = False
            if process.returncode == 0 and stdout and not stdout.endswith('\n') and 'input(' in code:
                needs_input = True
            
            return Response({
                'stdout': stdout,
                'stderr': stderr,
                'exit_code': process.returncode,
                'needs_input': needs_input
            })
            
        except subprocess.TimeoutExpired:
            return Response({
                'stdout': '',
                'stderr': 'Execution timed out after 10 seconds',
                'exit_code': 124
            })
        except Exception as e:
            return Response({
                'stdout': '',
                'stderr': f'Error executing code: {str(e)}',
                'exit_code': 1
            })
        finally:
            # Clean up temp file
            if os.path.exists(temp_filename):
                os.unlink(temp_filename)