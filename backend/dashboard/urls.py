from django.urls import path
from .views import (
    DashboardStatsView,
    RecentActivitiesView,
    TaskAnalyticsView,
    PomodoroStatsView,
    HabitStatsView,
    UsageStatsView,
    InsightsView,
    track_feature_usage,
)

urlpatterns = [
    path('stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('activities/recent/', RecentActivitiesView.as_view(), name='recent-activities'),
    path('tasks/analytics/', TaskAnalyticsView.as_view(), name='task-analytics'),
    path('pomodoro/stats/', PomodoroStatsView.as_view(), name='pomodoro-stats'),
    path('habits/stats/', HabitStatsView.as_view(), name='habit-stats'),
    path('usage/stats/', UsageStatsView.as_view(), name='usage-stats'),
    path('insights/', InsightsView.as_view(), name='insights'),
    path('track-usage/', track_feature_usage, name='track-usage'),
]
