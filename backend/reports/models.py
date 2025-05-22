from django.db import models
from django.contrib.auth.models import User

class Report(models.Model):
    """Model to track generated reports"""
    REPORT_TYPES = [
        ('summary', 'Summary Report'),
        ('detailed', 'Detailed Report'),
        ('tasks', 'Task Report'),
        ('pomodoro', 'Pomodoro Report'),
        ('habits', 'Habits Report'),
    ]
    
    FORMATS = [
        ('pdf', 'PDF'),
        ('excel', 'Excel'),
        ('csv', 'CSV'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports')
    report_type = models.CharField(max_length=50, choices=REPORT_TYPES)
    format = models.CharField(max_length=10, choices=FORMATS)
    date_from = models.DateField(null=True, blank=True)
    date_to = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    file_path = models.CharField(max_length=255, null=True, blank=True)
    
    def __str__(self):
        return f"{self.report_type} Report by {self.user.username} ({self.created_at.strftime('%Y-%m-%d')})"
