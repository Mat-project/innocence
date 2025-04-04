from django.db import models
from django.conf import settings
from task.models import Task
from habit.models import Habit

class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('task', 'Task Notification'),
        ('habit', 'Habit Notification'),
        ('system', 'System Notification'),
    )
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications"
    )
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=10, choices=NOTIFICATION_TYPES, default='system')
    
    # References to related models
    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="notifications"
    )
    habit = models.ForeignKey(
        Habit,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="notifications"
    )
    
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
        
    class Meta:
        ordering = ['-created_at']
