from rest_framework import serializers
from .models import PomodoroSession

class PomodoroSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PomodoroSession
        fields = ['id', 'duration', 'mode', 'started_at', 'completed_at', 'completed']
        read_only_fields = ['id', 'started_at']