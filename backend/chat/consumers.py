import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import ChatRoom, Message, ReadReceipt

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.room_id}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type', 'message')
        
        if message_type == 'message':
            message = await self.save_message(
                room_id=self.room_id,
                user_id=self.user.id,
                message=data['message'],
                file_url=data.get('file_url', None)
            )
            
            # Send message to room group with room id included
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'chat_id': self.room_id,  # add room id here
                    'id': message['id'],
                    'message': message['content'],
                    'file_url': message['file'],
                    'sender_id': message['sender_id'],
                    'sender_name': message['sender_name'],
                    'timestamp': str(message['timestamp'])
                }
            )
        elif message_type == 'typing':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_typing',
                    'user_id': self.user.id,
                    'username': self.user.username,
                    'is_typing': data['is_typing']
                }
            )
        elif message_type == 'read':
            await self.mark_messages_read(
                room_id=self.room_id,
                user_id=self.user.id,
                message_ids=data.get('message_ids', [])
            )
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'read_receipt',
                    'user_id': self.user.id,
                    'message_ids': data.get('message_ids', [])
                }
            )

    async def chat_message(self, event):
        # Include chat_id in the message payload
        await self.send(text_data=json.dumps({
            'type': 'message',
            'chat_id': event.get('chat_id'),  # now available for frontend check
            'id': event.get('id'),
            'message': event.get('message'),
            'file_url': event.get('file_url'),
            'sender_id': event.get('sender_id'),
            'sender_name': event.get('sender_name'),
            'timestamp': event.get('timestamp')
        }))

    async def user_typing(self, event):
        await self.send(text_data=json.dumps({
            'type': 'typing',
            'user_id': event.get('user_id'),
            'username': event.get('username'),
            'is_typing': event.get('is_typing')
        }))

    async def read_receipt(self, event):
        await self.send(text_data=json.dumps({
            'type': 'read',
            'user_id': event.get('user_id'),
            'message_ids': event.get('message_ids')
        }))

    @database_sync_to_async
    def save_message(self, room_id, user_id, message, file_url=None):
        room = ChatRoom.objects.get(id=room_id)
        user = User.objects.get(id=user_id)
        msg = Message.objects.create(
            room=room,
            sender=user,
            content=message,
            file=file_url
        )
        room.updated_at = msg.timestamp
        room.save()
        
        return {
            'id': msg.id,
            'content': msg.content,
            'file': msg.file.url if msg.file else None,
            'sender_id': user.id,
            'sender_name': f"{user.first_name} {user.last_name}" if user.first_name else user.username,
            'timestamp': msg.timestamp
        }

    @database_sync_to_async
    def mark_messages_read(self, room_id, user_id, message_ids=None):
        user = User.objects.get(id=user_id)
        room = ChatRoom.objects.get(id=room_id)
        messages_to_mark = Message.objects.filter(room=room).exclude(sender=user)
        if message_ids:
            messages_to_mark = messages_to_mark.filter(id__in=message_ids)
        for msg in messages_to_mark:
            ReadReceipt.objects.get_or_create(message=msg, user=user)
            msg.is_read = True
            msg.save()