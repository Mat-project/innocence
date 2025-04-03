from rest_framework import serializers
from .models import DashboardStat, RecentActivity, FeatureUsage

class DashboardStatSerializer(serializers.ModelSerializer):
    class Meta:
        model = DashboardStat
        fields = ['id', 'title', 'value', 'icon', 'trend', 'color']

class RecentActivitySerializer(serializers.ModelSerializer):
    time = serializers.ReadOnlyField()
    
    class Meta:
        model = RecentActivity
        fields = ['id', 'title', 'description', 'icon', 'color', 'time', 'timestamp']

class FeatureUsageSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeatureUsage
        fields = ['id', 'feature', 'count', 'last_used']
