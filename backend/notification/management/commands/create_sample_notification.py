from django.core.management.base import BaseCommand
from notification.models import Notification
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Creates a sample notification for testing purposes'

    def handle(self, *args, **kwargs):
        # Get all users who might need sample notifications
        users = User.objects.all()
        
        if not users.exists():
            self.stdout.write(self.style.ERROR('No users found. Please create at least one user first.'))
            return
        
        count = 0
        for user in users:
            # Create a system notification for the user
            notification = Notification.objects.create(
                user=user,
                title="Welcome to TaskVerse",
                message="This is a sample notification to demonstrate the notification system. You can mark it as read by clicking on it.",
                notification_type="system",
                is_read=False
            )
            count += 1
            
        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {count} sample notifications')
        )