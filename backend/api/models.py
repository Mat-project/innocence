from django.conf import settings
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    full_name = models.CharField(max_length=255, blank=True, null=True)
    username = models.CharField(max_length=255, blank=True, null=True, unique=True)  # Keeping username field
    bio = models.TextField(blank=True, null=True)
    tagline = models.CharField(max_length=255, blank=True, null=True)
    profile_image = models.ImageField(upload_to="profile_images/", blank=True, null=True)
    cover_image = models.ImageField(upload_to="cover_images/", blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=50, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    linkedin = models.URLField(blank=True, null=True)
    github = models.URLField(blank=True, null=True)
    task_completion_rate = models.IntegerField(default=0)
    total_tasks = models.IntegerField(default=0)
    projects_count = models.IntegerField(default=0)
    pomodoro_time = models.IntegerField(default=0)  # in minutes
    habit_streak = models.IntegerField(default=0)
    def __str__(self):
        return self.full_name or self.user.email

class Skill(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='skill_items')
    name = models.CharField(max_length=100)
    category = models.CharField(
        max_length=20,
        choices=[('technical', 'Technical'), ('soft', 'Soft')],
        default='technical'
    )
    level = models.CharField(
        max_length=50,
        choices=[("Beginner", "Beginner"), ("Intermediate", "Intermediate"), ("Expert", "Expert")],
        default="Beginner"
    )
    def __str__(self):
        return f"{self.name} ({self.profile.user.username})"

class Experience(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='experience_items')
    company = models.CharField(max_length=100)
    title = models.CharField(max_length=100)  # replaced "position"
    location = models.CharField(max_length=100, blank=True, null=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    current = models.BooleanField(default=False)
    description = models.TextField(blank=True, null=True)
    def __str__(self):
        return f"{self.title} at {self.company}"

class Education(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='education_items')
    institution = models.CharField(max_length=100)  # renamed from school
    degree = models.CharField(max_length=100)
    field = models.CharField(max_length=100, blank=True, null=True)
    start_date = models.DateField()  # changed from integer year to DateField
    end_date = models.DateField(null=True, blank=True)  # changed from integer year to DateField
    description = models.TextField(blank=True, null=True)
    def __str__(self):
        return f"{self.degree} from {self.institution}"

class Portfolio(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='portfolio_items')
    title = models.CharField(max_length=100)
    description = models.TextField()
    project_link = models.URLField(blank=True, null=True)
    image = models.ImageField(upload_to='portfolio_images/', blank=True, null=True)
    technologies = models.JSONField(blank=True, null=True)  # new field for technologies list
    def __str__(self):
        return self.title
