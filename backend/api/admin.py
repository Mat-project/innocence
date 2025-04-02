from django import forms
from django.contrib import admin
from django.core.serializers.json import DjangoJSONEncoder
import json
from .models import Profile, Skill, Experience, Education, Portfolio

class SkillInline(admin.TabularInline):
    model = Skill
    extra = 1

class ExperienceInline(admin.TabularInline):
    model = Experience
    extra = 1

class EducationInline(admin.TabularInline):
    model = Education
    extra = 1

class PortfolioInline(admin.TabularInline):
    model = Portfolio
    extra = 1

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'full_name', 'username', 'location']
    search_fields = ['user__email', 'full_name', 'username']
    fieldsets = (
        ('User Information', {
            'fields': ('user', 'full_name', 'username', 'bio', 'tagline')
        }),
        ('Media', {
            'fields': ('profile_image', 'cover_image')
        }),
        ('Contact', {
            'fields': ('location', 'phone', 'country', 'linkedin', 'github')
        }),
        ('Metrics', {
            'fields': ('task_completion_rate', 'total_tasks', 'projects_count', 'pomodoro_time', 'habit_streak')
        }),
    )
    inlines = [SkillInline, ExperienceInline, EducationInline, PortfolioInline]
