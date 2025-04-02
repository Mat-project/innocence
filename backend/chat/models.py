import uuid
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class ChatRoom(models.Model):
    name = models.CharField(max_length=255, blank=True)
    is_group = models.BooleanField(default=False)
    users = models.ManyToManyField(User, related_name="chatrooms")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        if self.is_group and self.name:
            return f"Group: {self.name}"
        return f"Chat: {', '.join([user.username for user in self.users.all()[:3]])}"

    class Meta:
        ordering = ['-updated_at']

class Message(models.Model):
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sent_messages")
    content = models.TextField()
    file = models.FileField(upload_to='chat_files/', null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.sender.username}: {self.content[:20]}"

    class Meta:
        ordering = ["timestamp"]

class ReadReceipt(models.Model):
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name="read_receipts")
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    read_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('message', 'user')
