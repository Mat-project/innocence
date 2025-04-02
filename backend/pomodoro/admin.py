from django.contrib import admin
from .models import PomodoroSession

@admin.register(PomodoroSession)
class PomodoroSessionAdmin(admin.ModelAdmin):
    list_display = ('user', 'focus_time', 'break_time', 'cycles', 'date', 'completed')
    list_filter = ('user', 'date', 'completed')
    search_fields = ('user__username',)
    date_hierarchy = 'date'
