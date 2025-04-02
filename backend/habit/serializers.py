from rest_framework import serializers
from .models import Habit, HabitMonth

class HabitMonthSerializer(serializers.ModelSerializer):
    class Meta:
        model = HabitMonth
        fields = ['year', 'month', 'name', 'days', 'active', 'max_streak']

class HabitSerializer(serializers.ModelSerializer):
    monthsData = HabitMonthSerializer(source='months', many=True, read_only=True)
    
    class Meta:
        model = Habit
        fields = ['id', 'name', 'color', 'created_at', 'last_update', 
                 'total_active', 'current_streak', 'max_streak', 
                 'streak_ratio', 'streak_consistency', 'monthsData']
        read_only_fields = ['created_at', 'last_update', 'total_active', 
                           'current_streak', 'max_streak', 'streak_ratio', 
                           'streak_consistency']