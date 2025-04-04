from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    task_id = serializers.SerializerMethodField()
    habit_id = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id', 'title', 'message', 'notification_type', 
            'task_id', 'habit_id', 'is_read', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_task_id(self, obj):
        """Safely get task ID even if task is None"""
        return obj.task.id if obj.task else None
        
    def get_habit_id(self, obj):
        """Safely get habit ID even if habit is None"""
        return obj.habit.id if obj.habit else None