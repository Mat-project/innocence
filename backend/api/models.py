from django.conf import settings
from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    bio = models.TextField(blank=True)
    profile_image = models.ImageField(upload_to="profile_images/", blank=True, null=True)
    cover_image = models.ImageField(upload_to="cover_images/", blank=True, null=True)
    email = models.EmailField(blank=True)
    linkedin = models.URLField(blank=True)
    github = models.URLField(blank=True)
    country = models.CharField(max_length=100, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    # Productivity metrics
    task_completion_rate = models.PositiveIntegerField(default=0)
    avg_work_hours = models.DecimalField(max_digits=4, decimal_places=1, default=0.0)
    best_work_time = models.CharField(max_length=50, blank=True)

    def __str__(self):
        return self.user.username
