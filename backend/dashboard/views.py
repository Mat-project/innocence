from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.utils import timezone
from datetime import timedelta, datetime
from django.db.models import Count, Sum, Avg

from .models import DashboardStat, RecentActivity, FeatureUsage
from .serializers import DashboardStatSerializer, RecentActivitySerializer
from task.models import Task
from pomodoro.models import PomodoroSession
from habit.models import Habit
from notification.models import Notification

class DashboardStatsView(APIView):
    """API view for dashboard statistics"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Return dashboard statistics cards data"""
        try:
            user = request.user
            
            # Calculate real statistics
            today = timezone.now().date()
            
            # 1. Tasks due today
            try:
                tasks_due_today = Task.objects.filter(
                    owner=user,
                    due_date__date=today,
                    status__in=['todo', 'inprogress']
                ).count()
            except Exception as e:
                print(f"Error counting tasks due today: {e}")
                tasks_due_today = 0
            
            # 2. Projects in progress
            try:
                projects_in_progress = Task.objects.filter(
                    owner=user,
                    status='inprogress',
                    category='project'
                ).count()
            except Exception as e:
                print(f"Error counting projects: {e}")
                projects_in_progress = 0
            
            # 3. Completed tasks (in the last 7 days)
            try:
                completed_tasks = Task.objects.filter(
                    owner=user,
                    status='completed',
                    updated_at__gte=timezone.now() - timedelta(days=7)
                ).count()
            except Exception as e:
                print(f"Error counting completed tasks: {e}")
                completed_tasks = 0
            
            # 4. Upcoming deadlines (next 7 days)
            try:
                upcoming_deadlines = Task.objects.filter(
                    owner=user,
                    due_date__date__gt=today,
                    due_date__date__lte=today + timedelta(days=7),
                    status__in=['todo', 'inprogress']
                ).count()
            except Exception as e:
                print(f"Error counting upcoming deadlines: {e}")
                upcoming_deadlines = 0
            
            # Calculate trends (percent change from previous period)
            tasks_trend = 0
            try:
                previous_period = today - timedelta(days=30)
                tasks_due_previous = Task.objects.filter(
                    owner=user,
                    due_date__date=previous_period,
                    status__in=['todo', 'inprogress']
                ).count()
                
                if tasks_due_previous > 0:
                    tasks_trend = int(((tasks_due_today - tasks_due_previous) / tasks_due_previous) * 100)
            except Exception as e:
                print(f"Error calculating trends: {e}")
            
            # Construct stats array
            stats = [
                {
                    "title": "Tasks Due Today",
                    "value": str(tasks_due_today),
                    "icon": "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
                    "trend": tasks_trend,
                    "color": "blue"
                },
                {
                    "title": "Projects in Progress",
                    "value": str(projects_in_progress),
                    "icon": "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z",
                    "trend": 0,
                    "color": "purple"
                },
                {
                    "title": "Completed Tasks",
                    "value": str(completed_tasks),
                    "icon": "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
                    "trend": 5,
                    "color": "green"
                },
                {
                    "title": "Upcoming Deadlines",
                    "value": str(upcoming_deadlines),
                    "icon": "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
                    "trend": -2,
                    "color": "orange"
                }
            ]
            
            return Response(stats)
        except Exception as e:
            print(f"Error in DashboardStatsView: {str(e)}")
            return Response(
                {"error": "Failed to fetch dashboard stats"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class RecentActivitiesView(APIView):
    """API view for recent activities"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Return recent activities for the dashboard"""
        user = request.user
        
        # Check for recent real activities
        activities = []
        
        # 1. Recently completed tasks
        completed_tasks = Task.objects.filter(
            owner=user,
            status='completed'
        ).order_by('-updated_at')[:3]
        
        for task in completed_tasks:
            activities.append({
                "title": "Task Completed",
                "description": task.title,
                "time": self._format_timestamp(task.updated_at),
                "icon": "M5 13l4 4L19 7",
                "color": "green"
            })
        
        # 2. Recently created tasks
        created_tasks = Task.objects.filter(
            owner=user
        ).order_by('-created_at')[:2]
        
        for task in created_tasks:
            activities.append({
                "title": "Task Created",
                "description": task.title,
                "time": self._format_timestamp(task.created_at),
                "icon": "M12 4v16m8-8H4",
                "color": "blue"
            })
            
        # 3. Recent Pomodoro sessions
        pomodoro_sessions = PomodoroSession.objects.filter(
            user=user
        ).order_by('-start_time')[:2]
        
        for session in pomodoro_sessions:
            activities.append({
                "title": "Pomodoro Completed",
                "description": f"{session.focus_time} minutes focus time",
                "time": self._format_timestamp(session.end_time),
                "icon": "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
                "color": "red"
            })
            
        # 4. Recent notifications
        notifications = Notification.objects.filter(
            user=user,
            is_read=False
        ).order_by('-created_at')[:3]
        
        for notification in notifications:
            activities.append({
                "title": notification.title,
                "description": notification.message,
                "time": self._format_timestamp(notification.created_at),
                "icon": "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
                "color": "purple"
            })
            
        # Sort activities by time and take the most recent 5
        activities.sort(key=lambda x: self._parse_time(x["time"]), reverse=True)
        activities = activities[:5]
        
        return Response(activities)
        
    def _format_timestamp(self, timestamp):
        """Format timestamp to human-readable format (e.g., '2h ago')"""
        now = timezone.now()
        diff = now - timestamp
        
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
            return timestamp.strftime("%b %d, %Y")
            
    def _parse_time(self, time_string):
        """Helper function to parse time strings for sorting"""
        if time_string == 'just now':
            return timezone.now()
        elif 'm ago' in time_string:
            minutes = int(time_string.split('m')[0])
            return timezone.now() - timedelta(minutes=minutes)
        elif 'h ago' in time_string:
            hours = int(time_string.split('h')[0])
            return timezone.now() - timedelta(hours=hours)
        elif 'd ago' in time_string:
            days = int(time_string.split('d')[0])
            return timezone.now() - timedelta(days=days)
        else:
            try:
                return datetime.strptime(time_string, "%b %d, %Y")
            except ValueError:
                return timezone.now() - timedelta(days=30)

class TaskAnalyticsView(APIView):
    """API view for task analytics"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Return task completion analytics data"""
        user = request.user
        time_range = request.query_params.get('timeRange', '7')
        
        try:
            days = int(time_range)
        except ValueError:
            days = 7
            
        # Generate date labels for the last N days
        dates = []
        date_labels = []
        data = []
        
        for i in range(days-1, -1, -1):
            date = timezone.now().date() - timedelta(days=i)
            dates.append(date)
            date_labels.append(date.strftime("%a"))
            
        # Get task data for each day
        for date in dates:
            completed = Task.objects.filter(
                owner=user,
                status='completed',
                updated_at__date=date
            ).count()
            
            pending = Task.objects.filter(
                owner=user,
                status='inprogress',
                created_at__date__lte=date,
                due_date__date__gte=date
            ).count()
            
            overdue = Task.objects.filter(
                owner=user,
                status__in=['todo', 'inprogress'],
                due_date__date__lt=date
            ).count()
            
            data.append({
                "day": date.strftime("%a"),
                "completed": completed,
                "pending": pending,
                "overdue": overdue
            })
            
        return Response(data)

class PomodoroStatsView(APIView):
    """API view for pomodoro statistics"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Return pomodoro focus time tracking data"""
        user = request.user
        time_range = request.query_params.get('timeRange', '7')
        
        try:
            days = int(time_range)
        except ValueError:
            days = 7
            
        # Generate date labels for the last N days
        dates = []
        date_labels = []
        data = []
        
        for i in range(days-1, -1, -1):
            date = timezone.now().date() - timedelta(days=i)
            dates.append(date)
            date_labels.append(date.strftime("%a"))
            
        # Get pomodoro data for each day
        for date in dates:
            # Get all sessions for this day
            sessions = PomodoroSession.objects.filter(
                user=user,
                date=date
            )
            
            # Calculate total focus time
            focus_time = sessions.aggregate(total=Sum('focus_time'))['total'] or 0
            
            # Count completed sessions
            sessions_completed = sessions.filter(completed=True).count()
            
            data.append({
                "day": date.strftime("%a"),
                "focusTime": focus_time,
                "sessionsCompleted": sessions_completed
            })
            
        return Response(data)

class HabitStatsView(APIView):
    """API view for habit statistics"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Return habit completion rate data"""
        user = request.user
        
        # Get all habits for the user
        habits = Habit.objects.filter(user=user)
        
        data = []
        for habit in habits:
            data.append({
                "name": habit.name,
                "completionRate": int(habit.streak_consistency),
                "streak": habit.current_streak,
                "totalCheckins": habit.total_active
            })
            
        return Response(data)

class UsageStatsView(APIView):
    """API view for feature usage statistics"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Return feature usage distribution data"""
        try:
            user = request.user
            
            # Get feature usage count from the FeatureUsage model
            features = FeatureUsage.objects.filter(user=user)
            
            # If no usage data exists, create default entries
            if not features.exists():
                default_features = [
                    'Tasks', 'Pomodoro', 'Habits', 'File Converter', 
                    'Notepad', 'Code Editor'
                ]
                
                for feature in default_features:
                    FeatureUsage.objects.create(
                        user=user,
                        feature=feature,
                        count=0
                    )
                    
                features = FeatureUsage.objects.filter(user=user)
                
            # Calculate percentages
            total_usage = sum(feature.count for feature in features)
            
            data = []
            if total_usage > 0:
                for feature in features:
                    usage_percent = int((feature.count / total_usage) * 100)
                    data.append({
                        "subject": feature.feature,
                        "usage": usage_percent
                    })
            else:
                # If no usage data, return equal distribution
                feature_count = features.count()
                if feature_count > 0:
                    equal_percent = int(100 / feature_count)
                    for feature in features:
                        data.append({
                            "subject": feature.feature,
                            "usage": equal_percent
                        })
                else:
                    # Fallback for no features case
                    data = [
                        {"subject": "Tasks", "usage": 20},
                        {"subject": "Pomodoro", "usage": 20},
                        {"subject": "Habits", "usage": 20},
                        {"subject": "File Converter", "usage": 20},
                        {"subject": "Notepad", "usage": 10},
                        {"subject": "Code Editor", "usage": 10}
                    ]
                    
            return Response(data)
        except Exception as e:
            print(f"Error in UsageStatsView: {str(e)}")
            return Response(
                {"error": "Failed to fetch usage stats"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class InsightsView(APIView):
    """API view for personalized insights"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Return personalized insights based on user activity"""
        user = request.user
        
        insights = []
        
        # 1. Most productive day
        most_productive_day = self._get_most_productive_day(user)
        if most_productive_day:
            insights.append({
                "icon": "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                "title": "Your most productive day",
                "description": f"is {most_productive_day['day']}, with an average of {most_productive_day['count']} completed tasks."
            })
            
        # 2. Focus time analysis
        focus_peak = self._get_focus_peak(user)
        if focus_peak:
            insights.append({
                "icon": "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                "title": "Your focus peaks",
                "description": f"between {focus_peak['start']} and {focus_peak['end']}. Try scheduling your most important tasks during this time."
            })
            
        # 3. Habit consistency
        best_habit = self._get_best_habit(user)
        if best_habit:
            insights.append({
                "icon": "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                "title": "Habit consistency:",
                "description": f"You're most consistent with your \"{best_habit['name']}\" habit at {best_habit['rate']}% completion rate."
            })
            
        # If no insights are available, provide default ones
        if not insights:
            insights = [
                {
                    "icon": "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                    "title": "Getting started",
                    "description": "Start tracking your tasks and habits to see personalized insights here."
                },
                {
                    "icon": "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                    "title": "Try the Pomodoro timer",
                    "description": "The Pomodoro technique can help boost your productivity and focus."
                }
            ]
            
        return Response(insights)
        
    def _get_most_productive_day(self, user):
        """Calculate the user's most productive day based on task completion"""
        from django.db.models.functions import Extract
        
        productive_days = Task.objects.filter(
            owner=user,
            status='completed'
        ).annotate(
            weekday=Extract('updated_at', 'week_day')
        ).values('weekday').annotate(
            count=Count('id')
        ).order_by('-count')
        
        if productive_days:
            day_names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
            most_productive = productive_days[0]
            
            # Django's week_day goes from 1 (Sunday) to 7 (Saturday), adjust for day_names list
            weekday_idx = most_productive['weekday'] % 7 - 1
            
            return {
                'day': day_names[weekday_idx],
                'count': most_productive['count']
            }
        return None
        
    def _get_focus_peak(self, user):
        """Analyze pomodoro sessions to find the user's peak focus time"""
        sessions = PomodoroSession.objects.filter(
            user=user,
            completed=True
        )
        
        if not sessions:
            return {
                'start': '9:00 AM',
                'end': '11:00 AM'
            }
            
        # For a real implementation, you'd analyze the start times
        # Here we'll return a default for simplicity
        return {
            'start': '9:00 AM',
            'end': '11:00 AM'
        }
        
    def _get_best_habit(self, user):
        """Find the user's most consistent habit"""
        habits = Habit.objects.filter(user=user).order_by('-streak_consistency')
        
        if habits:
            best_habit = habits[0]
            return {
                'name': best_habit.name,
                'rate': int(best_habit.streak_consistency)
            }
        return None

# Track feature usage
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def track_feature_usage(request):
    """Track when a user uses a feature"""
    try:
        feature = request.data.get('feature')
        
        if not feature:
            return Response({'error': 'Feature name is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        usage, created = FeatureUsage.objects.get_or_create(
            user=request.user,
            feature=feature,
            defaults={'count': 1}
        )
        
        if not created:
            usage.count += 1
            usage.save()
            
        return Response({'status': 'success'})
    except Exception as e:
        print(f"Error in track_feature_usage: {str(e)}")
        return Response(
            {"error": f"Failed to track feature usage: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
