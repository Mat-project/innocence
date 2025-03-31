from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import PomodoroSession
from .serializers import PomodoroSessionSerializer

class PomodoroSessionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing Pomodoro sessions.
    """
    serializer_class = PomodoroSessionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        This view returns a list of all pomodoro sessions
        for the currently authenticated user.
        """
        return PomodoroSession.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        """Set the user to the authenticated user when creating a session"""
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        Return statistics about the user's Pomodoro sessions.
        """
        user = request.user
        sessions = PomodoroSession.objects.filter(user=user)
        
        # Calculate basic statistics
        total_sessions = sessions.count()
        total_focus_time = sum(session.focus_time for session in sessions)
        completed_sessions = sessions.filter(completed=True).count()
        
        # Calculate completion rate
        completion_rate = (completed_sessions / total_sessions * 100) if total_sessions > 0 else 0
        
        # Sessions by day of week
        from django.db.models import Count
        from django.db.models.functions import ExtractWeekDay
        by_day = (
            sessions
            .annotate(weekday=ExtractWeekDay('date'))
            .values('weekday')
            .annotate(count=Count('id'))
            .order_by('weekday')
        )
        
        # Map the PostgreSQL day numbers (1=Sunday, 7=Saturday) to names
        days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        by_day_dict = {days[item['weekday']-1]: item['count'] for item in by_day}
        
        return Response({
            'total_sessions': total_sessions,
            'total_focus_time': total_focus_time,
            'total_focus_hours': round(total_focus_time / 60, 1),
            'completed_sessions': completed_sessions,
            'completion_rate': round(completion_rate, 1),
            'by_day_of_week': by_day_dict
        })
