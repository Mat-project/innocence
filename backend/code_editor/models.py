from django.db import models
from django.conf import settings
from django.utils import timezone
import uuid

class Folder(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    parent_folder = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='folders')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ['name', 'parent_folder', 'user']
        ordering = ['name']
    
    def _str_(self):
        return self.name
    
    def get_full_path(self):
        """Return the full path of the folder"""
        if self.parent_folder:
            return f"{self.parent_folder.get_full_path()}/{self.name}"
        return self.name
    
    def get_all_children(self, include_files=False):
        """Return all child folders recursively"""
        children = list(self.children.filter(is_deleted=False))
        for child in list(children):
            children.extend(child.get_all_children(include_files=False))
        
        if include_files:
            for folder in [self] + children:
                children.extend(list(folder.files.filter(is_deleted=False)))
        
        return children


class File(models.Model):
    LANGUAGE_CHOICES = [
        ('python', 'Python'),
        ('javascript', 'JavaScript'),
        ('html', 'HTML'),
        ('css', 'CSS'),
        ('java', 'Java'),
        ('cpp', 'C++'),
        ('csharp', 'C#'),
        ('php', 'PHP'),
        ('ruby', 'Ruby'),
        ('go', 'Go'),
        ('rust', 'Rust'),
        ('typescript', 'TypeScript'),
        ('swift', 'Swift'),
        ('kotlin', 'Kotlin'),
        ('plain_text', 'Plain Text'),
        ('other', 'Other'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    content = models.TextField(blank=True)
    folder = models.ForeignKey(Folder, on_delete=models.CASCADE, related_name='files', null=True, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='files')
    language = models.CharField(max_length=20, choices=LANGUAGE_CHOICES, default='python')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    last_accessed = models.DateTimeField(null=True, blank=True)
    is_deleted = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ['name', 'folder', 'user']
        ordering = ['name']
    
    def _str_(self):
        return self.name
    
    def get_full_path(self):
        """Return the full path of the file"""
        if self.folder:
            return f"{self.folder.get_full_path()}/{self.name}"
        return self.name
    
    def save(self, *args, **kwargs):
        """Update last_accessed when the file is saved"""
        self.last_accessed = timezone.now()
        super().save(*args, **kwargs)