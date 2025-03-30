from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class PomodoroSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pomodoro_sessions')
    duration = models.IntegerField(help_text="Duration in seconds")
    mode = models.CharField(max_length=20, choices=[
        ('pomodoro', 'Pomodoro'),
        ('shortBreak', 'Short Break'),
        ('longBreak', 'Long Break'),
    ], default='pomodoro')
    completed = models.BooleanField(default=True)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-started_at']

    def __str__(self):
        return f"{self.user.username} - {self.mode} ({self.duration}s)"
