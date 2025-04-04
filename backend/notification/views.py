from django.shortcuts import render
from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from datetime import timedelta
import logging
from .models import Notification
from .serializers import NotificationSerializer
from task.models import Task
from habit.models import Habit

logger = logging.getLogger(__name__)

class NotificationListView(generics.ListAPIView):
    """API view for listing user notifications"""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return notifications for the authenticated user"""
        return Notification.objects.filter(user=self.request.user)
    
    def list(self, request, *args, **kwargs):
        """Override list method to handle errors gracefully"""
        try:
            return super().list(request, *args, **kwargs)
        except Exception as e:
            # Log the error
            logger.error(f"Error in NotificationListView: {str(e)}")
            # Return a friendly error response
            return Response(
                {"error": "An error occurred while fetching notifications."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
class NotificationMarkReadView(APIView):
    """API view for marking notifications as read"""
    permission_classes = [permissions.IsAuthenticated]
    
    def patch(self, request, pk):
        try:
            notification = Notification.objects.get(pk=pk, user=request.user)
            notification.is_read = True
            notification.save()
            return Response({"status": "notification marked as read"})
        except Notification.DoesNotExist:
            return Response(
                {"error": "Notification not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            # Log the error
            logger.error(f"Error marking notification as read: {str(e)}")
            return Response(
                {"error": "An error occurred while marking notification as read"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class TaskNotificationTask:
    """Check for upcoming task due dates and create notifications"""
    @staticmethod
    def check_upcoming_tasks():
        # Look for tasks due in the next 24 hours
        tomorrow = timezone.now() + timedelta(days=1)
        today = timezone.now()
        
        # Get tasks that are due soon and don't have notifications yet
        upcoming_tasks = Task.objects.filter(
            due_date__gte=today,
            due_date__lte=tomorrow,
            status__in=['todo', 'inprogress']
        )
        
        for task in upcoming_tasks:
            # Check if we already notified about this task being due soon
            notification_exists = Notification.objects.filter(
                task=task,
                notification_type='task',
                created_at__gte=today - timedelta(days=1)
            ).exists()
            
            if not notification_exists:
                # Create a notification for the upcoming task
                Notification.objects.create(
                    user=task.owner,
                    title="Task Due Soon",
                    message=f"Your task '{task.title}' is due soon.",
                    notification_type='task',
                    task=task
                )

class HabitStreakNotificationTask:
    """Check for broken habit streaks and create notifications"""
    @staticmethod
    def check_habit_streaks():
        # Get all active habits
        active_habits = Habit.objects.filter(is_active=True)
        today = timezone.now().date()
        yesterday = today - timedelta(days=1)
        
        for habit in active_habits:
            # Check if habit has a streak that might be broken
            if hasattr(habit, 'current_streak') and hasattr(habit, 'last_check_date'):
                # If the habit has a streak and last_check_date is before yesterday,
                # it means the streak is broken
                if habit.current_streak > 0 and (not habit.last_check_date or habit.last_check_date < yesterday):
                    # Check if we already notified about this broken streak
                    notification_exists = Notification.objects.filter(
                        habit=habit,
                        notification_type='habit',
                        created_at__gte=timezone.now() - timedelta(days=1)
                    ).exists()
                    
                    if not notification_exists:
                        # Create notification about broken streak
                        Notification.objects.create(
                            user=habit.user,
                            title="Habit Streak Broken",
                            message=f"Your {habit.current_streak}-day streak for '{habit.name}' was broken. Keep going!",
                            notification_type='habit',
                            habit=habit
                        )
