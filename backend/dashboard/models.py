from django.db import models
from django.contrib.auth.models import User

class DashboardStat(models.Model):
    """Track statistics for the dashboard display"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='dashboard_stats')
    title = models.CharField(max_length=100)
    value = models.CharField(max_length=100)
    icon = models.TextField()
    trend = models.IntegerField(default=0)
    color = models.CharField(max_length=50, default='blue')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['title']

class RecentActivity(models.Model):
    """Track recent activities for the user"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recent_activities')
    title = models.CharField(max_length=100)
    description = models.CharField(max_length=255)
    icon = models.TextField()
    color = models.CharField(max_length=50, default='blue')
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
    
    @property
    def time(self):
        """Return a human-readable time string"""
        from django.utils import timezone
        from datetime import timedelta
        
        now = timezone.now()
        diff = now - self.timestamp
        
        if diff < timedelta(minutes=1):
            return 'just now'
        elif diff < timedelta(hours=1):
            minutes = diff.seconds // 60
            return f"{minutes}m ago"
        elif diff < timedelta(days=1):
            hours = diff.seconds // 3600
            return f"{hours}h ago"
        elif diff < timedelta(days=7):
            days = diff.days
            return f"{days}d ago"
        else:
            return self.timestamp.strftime("%b %d, %Y")

class FeatureUsage(models.Model):
    """Track usage of different features by the user"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='feature_usage')
    feature = models.CharField(max_length=100)
    count = models.IntegerField(default=0)
    last_used = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['user', 'feature']
