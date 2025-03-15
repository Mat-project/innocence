# backend/code_editor/models.py
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class CodeFile(models.Model):
    LANGUAGE_CHOICES = [
        ('javascript', 'JavaScript'),
        ('typescript', 'TypeScript'),
        ('html', 'HTML'),
        ('css', 'CSS'),
        ('python', 'Python'),
        ('java', 'Java'),
        ('csharp', 'C#'),
    ]
    
    name = models.CharField(max_length=255)
    content = models.TextField(blank=True)
    language = models.CharField(max_length=50, choices=LANGUAGE_CHOICES, default='javascript')
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='code_files')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        return self.name