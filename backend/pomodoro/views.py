from django.shortcuts import render
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Sum
from datetime import timedelta
from .models import PomodoroSession
from .serializers import PomodoroSessionSerializer

class PomodoroSessionViewSet(viewsets.ModelViewSet):
    serializer_class = PomodoroSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PomodoroSession.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get pomodoro statistics for different time periods"""
        now = timezone.now()
        today = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_start = today - timedelta(days=today.weekday())
        month_start = today.replace(day=1)
        year_start = today.replace(month=1, day=1)
        
        # Get stats for different time periods
        stats = {
            'today': self._get_stats_for_period(today, now),
            'week': self._get_stats_for_period(week_start, now, 7),
            'month': self._get_stats_for_period(month_start, now, 30),
            'year': self._get_stats_for_period(year_start, now, 12, 'month'),
            'all_time': {
                'total_minutes': self._get_total_minutes(),
                'session_count': self.get_queryset().filter(completed=True).count()
            }
        }
        return Response(stats)
    
    def _get_stats_for_period(self, start_date, end_date, num_periods=1, period_type='day'):
        """Get statistics with daily/monthly data for charting"""
        queryset = self.get_queryset().filter(
            started_at__gte=start_date,
            started_at__lte=end_date,
            completed=True
        )
        
        total_minutes = queryset.aggregate(
            total=Sum('duration')
        )['total'] or 0
        total_minutes = total_minutes // 60  # Convert seconds to minutes
        
        # Generate data points for chart
        data_points = []
        if period_type == 'day':
            for i in range(num_periods):
                period_start = start_date + timedelta(days=i)
                period_end = period_start.replace(hour=23, minute=59, second=59)
                
                if period_end > end_date:
                    period_end = end_date
                
                period_total = queryset.filter(
                    started_at__gte=period_start,
                    started_at__lte=period_end
                ).aggregate(total=Sum('duration'))['total'] or 0
                
                data_points.append({
                    'label': period_start.strftime('%d %b'),
                    'minutes': period_total // 60
                })
        else:  # month
            for i in range(num_periods):
                period_start = (start_date.replace(day=1) + 
                               timedelta(days=32 * i)).replace(day=1)
                
                # Last day of month calculation
                if period_start.month == 12:
                    next_month = period_start.replace(year=period_start.year + 1, month=1)
                else:
                    next_month = period_start.replace(month=period_start.month + 1)
                period_end = next_month - timedelta(days=1)
                period_end = period_end.replace(hour=23, minute=59, second=59)
                
                if period_end > end_date:
                    period_end = end_date
                
                period_total = queryset.filter(
                    started_at__gte=period_start,
                    started_at__lte=period_end
                ).aggregate(total=Sum('duration'))['total'] or 0
                
                data_points.append({
                    'label': period_start.strftime('%b %Y'),
                    'minutes': period_total // 60
                })
        
        return {
            'total_minutes': total_minutes,
            'session_count': queryset.count(),
            'data_points': data_points
        }
    
    def _get_total_minutes(self):
        """Get total minutes across all completed pomodoro sessions"""
        total_seconds = self.get_queryset().filter(
            completed=True
        ).aggregate(total=Sum('duration'))['total'] or 0
        return total_seconds // 60
