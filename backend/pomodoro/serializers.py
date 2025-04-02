from rest_framework import serializers
from .models import PomodoroSession

class PomodoroSessionSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = PomodoroSession
        fields = [
            'id', 'username', 'focus_time', 'break_time', 'long_break_time', 
            'cycles', 'start_time', 'end_time', 'date', 'completed', 'created_at'
        ]
        read_only_fields = ['id', 'username', 'created_at']