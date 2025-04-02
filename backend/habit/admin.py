from django.contrib import admin
from .models import Habit, HabitMonth

@admin.register(Habit)
class HabitAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'color', 'created_at', 'total_active', 'current_streak', 'max_streak')
    list_filter = ('user',)

@admin.register(HabitMonth)
class HabitMonthAdmin(admin.ModelAdmin):
    list_display = ('habit', 'year', 'month', 'name', 'active', 'max_streak')
    list_filter = ('year', 'month', 'habit__user')
