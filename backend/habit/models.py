from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Habit(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='habits')
    name = models.CharField(max_length=255)
    color = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)
    last_update = models.DateTimeField(default=timezone.now)
    total_active = models.IntegerField(default=0)
    current_streak = models.IntegerField(default=0)
    max_streak = models.IntegerField(default=0)
    streak_ratio = models.FloatField(default=0)
    streak_consistency = models.FloatField(default=0)
    
    def __str__(self):
        return f"{self.user.username}'s habit: {self.name}"

class HabitMonth(models.Model):
    habit = models.ForeignKey(Habit, on_delete=models.CASCADE, related_name='months')
    year = models.IntegerField()
    month = models.IntegerField()  # 0-11 for Jan-Dec
    name = models.CharField(max_length=10)  # e.g., "Jan", "Feb"
    days = models.JSONField()      # Array of boolean values
    active = models.IntegerField(default=0)
    max_streak = models.IntegerField(default=0)
    
    class Meta:
        unique_together = ('habit', 'year', 'month')
        ordering = ['year', 'month']
