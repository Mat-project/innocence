from django.db import models
from django.conf import settings
from django.utils import timezone

class PomodoroSession(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="pomodoro_sessions"
    )
    focus_time = models.IntegerField(help_text="Focus time in minutes")
    break_time = models.IntegerField(help_text="Break time in minutes")
    long_break_time = models.IntegerField(help_text="Long break time in minutes")
    cycles = models.IntegerField(help_text="Number of cycles before long break")
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    date = models.DateField()
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-start_time']
        verbose_name = "Pomodoro Session"
        verbose_name_plural = "Pomodoro Sessions"
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'start_time'],
                name='unique_user_session'
            )
        ]

    def __str__(self):
        return f"{self.user.username}'s session on {self.date}"
    
    def save(self, *args, **kwargs):
        # Auto-populate date field if not provided
        if not self.date:
            self.date = self.start_time.date()
        super().save(*args, **kwargs)
