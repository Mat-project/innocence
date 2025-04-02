from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import datetime
from .models import Habit, HabitMonth
from .serializers import HabitSerializer, HabitMonthSerializer

class HabitViewSet(viewsets.ModelViewSet):
    serializer_class = HabitSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Only return habits belonging to the current user"""
        return Habit.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        """Create a new habit with empty month data"""
        habit = serializer.save(user=self.request.user)
        
        # Initialize months data for the current year
        today = datetime.now()
        current_year = today.year
        
        for month_index in range(12):
            # Calculate days in month
            if month_index in [3, 5, 8, 10]:  # Apr, Jun, Sep, Nov
                days_in_month = 30
            elif month_index == 1:  # Feb
                if (current_year % 4 == 0 and current_year % 100 != 0) or current_year % 400 == 0:
                    days_in_month = 29  # Leap year
                else:
                    days_in_month = 28
            else:
                days_in_month = 31
                
            # Create month data
            month_name = datetime(current_year, month_index + 1, 1).strftime('%b')
            
            HabitMonth.objects.create(
                habit=habit,
                year=current_year,
                month=month_index,
                name=month_name,
                days=[False] * days_in_month,
                active=0,
                max_streak=0
            )
        
        return habit
    
    @action(detail=True, methods=['post'])
    def toggle_day(self, request, pk=None):
        """Toggle a day's completion status and recalculate stats"""
        habit = self.get_object()
        data = request.data
        
        try:
            month_index = data.get('monthIndex')
            day_index = data.get('dayIndex')
            year = data.get('year', datetime.now().year)
            
            # Get or create the month data
            month_data, created = HabitMonth.objects.get_or_create(
                habit=habit,
                year=year,
                month=month_index,
                defaults={
                    'name': datetime(year, month_index + 1, 1).strftime('%b'),
                    'days': [False] * 31,  # Will adjust based on actual month
                    'active': 0,
                    'max_streak': 0
                }
            )
            
            # Get days array and ensure it's the right length for the month
            days = month_data.days
            
            # Calculate correct length for this month
            if month_index in [3, 5, 8, 10]:  # Apr, Jun, Sep, Nov
                days_in_month = 30
            elif month_index == 1:  # Feb
                if (year % 4 == 0 and year % 100 != 0) or year % 400 == 0:
                    days_in_month = 29  # Leap year
                else:
                    days_in_month = 28
            else:
                days_in_month = 31
                
            # Ensure days array is the right length
            if len(days) < days_in_month:
                days.extend([False] * (days_in_month - len(days)))
            elif len(days) > days_in_month:
                days = days[:days_in_month]
            
            # Toggle the day
            days[day_index] = not days[day_index]
            month_data.days = days
            
            # Update month statistics
            month_data.active = sum(1 for day in days if day)
            
            # Calculate month max streak
            current_streak = 0
            max_streak = 0
            for day in days:
                if day:
                    current_streak += 1
                    max_streak = max(max_streak, current_streak)
                else:
                    current_streak = 0
            
            month_data.max_streak = max_streak
            month_data.save()
            
            # Update habit's overall stats
            self.recalculate_habit_stats(habit)
            
            # Return updated habit data
            return Response(HabitSerializer(habit).data)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    def recalculate_habit_stats(self, habit):
        """Recalculate a habit's statistics from its month data"""
        # Get all months for this habit
        months = HabitMonth.objects.filter(habit=habit)
        
        # Calculate metrics
        all_days = []
        for month in months:
            all_days.extend(month.days)
            
        total_active = sum(1 for day in all_days if day)
        
        # Max streak
        max_streak = 0
        current_streak = 0
        for day in all_days:
            if day:
                current_streak += 1
                max_streak = max(max_streak, current_streak)
            else:
                current_streak = 0
        
        # Current streak (from end of array)
        current_streak = 0
        for day in reversed(all_days):
            if day:
                current_streak += 1
            else:
                break
        
        # Calculate streak ratio and consistency
        total_days = len(all_days)
        streak_ratio = total_active / total_days if total_days > 0 else 0
        
        # Count total streaks
        total_streaks = 0
        in_streak = False
        for day in all_days:
            if day and not in_streak:
                in_streak = True
                total_streaks += 1
            elif not day:
                in_streak = False
        
        # Calculate consistency
        streak_consistency = 0
        if total_days > 0 and total_active > 0:
            if total_streaks == 1:
                streak_consistency = (total_active / total_days) * 100
            else:
                streak_consistency = (max_streak / total_days) * 100
        
        # Update habit
        habit.total_active = total_active
        habit.current_streak = current_streak
        habit.max_streak = max_streak
        habit.streak_ratio = streak_ratio
        habit.streak_consistency = round(streak_consistency)
        habit.last_update = timezone.now()
        habit.save()
