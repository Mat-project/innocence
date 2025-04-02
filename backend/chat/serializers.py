from django.contrib.auth.models import User
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import ChatRoom, Message, ReadReceipt

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()
    read_by = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'room', 'sender', 'sender_name', 'content', 'file', 'timestamp', 'is_read', 'read_by']
        read_only_fields = ['sender_name', 'read_by', 'is_read']

    def get_sender_name(self, obj):
        return f"{obj.sender.first_name} {obj.sender.last_name}" if obj.sender.first_name else obj.sender.username

    def get_read_by(self, obj):
        return [receipt.user.id for receipt in obj.read_receipts.all()]

class ChatRoomSerializer(serializers.ModelSerializer):
    users = UserSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = ChatRoom
        fields = ['id', 'name', 'is_group', 'users', 'created_at', 'updated_at', 'last_message', 'unread_count']

    def get_last_message(self, obj):
        message = obj.messages.last()
        if message:
            return {
                'id': message.id,
                'content': message.content,
                'timestamp': message.timestamp,
                'sender_name': f"{message.sender.first_name} {message.sender.last_name}" if message.sender.first_name else message.sender.username
            }
        return None

    def get_unread_count(self, obj):
        user = self.context['request'].user
        return obj.messages.filter(is_read=False).exclude(sender=user).count()