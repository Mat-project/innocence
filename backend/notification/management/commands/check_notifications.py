from django.core.management.base import BaseCommand
from notification.views import TaskNotificationTask, HabitStreakNotificationTask
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Checks for upcoming tasks and broken habit streaks and creates notifications'

    def handle(self, *args, **kwargs):
        try:
            self.stdout.write(self.style.SUCCESS('Checking for task notifications...'))
            TaskNotificationTask.check_upcoming_tasks()
            
            self.stdout.write(self.style.SUCCESS('Checking for habit streak notifications...'))
            HabitStreakNotificationTask.check_habit_streaks()
            
            self.stdout.write(self.style.SUCCESS('Notification checks completed successfully!'))
        except Exception as e:
            logger.error(f"Error checking notifications: {str(e)}")
            self.stdout.write(self.style.ERROR(f'Error during notification checks: {str(e)}'))