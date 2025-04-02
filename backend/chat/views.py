from django.shortcuts import render, get_object_or_404
from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import ChatRoom, Message, ReadReceipt
from .serializers import ChatRoomSerializer, MessageSerializer, UserSerializer

User = get_user_model()

class ChatRoomViewSet(viewsets.ModelViewSet):
    serializer_class = ChatRoomSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ChatRoom.objects.filter(users=self.request.user)

    def create(self, request):
        user_ids = request.data.get('users', [])
        is_group = request.data.get('is_group', False)
        name = request.data.get('name', '')
        
        if not user_ids:
            return Response({"error": "Users list cannot be empty"}, status=status.HTTP_400_BAD_REQUEST)
            
        # Always include the current user
        if request.user.id not in user_ids:
            user_ids.append(request.user.id)
            
        # For direct messages, check if a chat already exists
        if not is_group and len(user_ids) == 2:
            other_user_id = next(id for id in user_ids if id != request.user.id)
            existing_chat = ChatRoom.objects.filter(
                is_group=False,
                users=request.user
            ).filter(
                users=other_user_id
            ).first()
            
            if existing_chat:
                serializer = self.get_serializer(existing_chat)
                return Response(serializer.data)
        
        # Create new chat room
        chat_room = ChatRoom.objects.create(name=name, is_group=is_group)
        
        # Add users to the chat room
        users = User.objects.filter(id__in=user_ids)
        chat_room.users.add(*users)
        
        serializer = self.get_serializer(chat_room)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        room = self.get_object()
        message_ids = request.data.get('message_ids', [])
        
        if message_ids:
            messages = Message.objects.filter(id__in=message_ids, room=room)
        else:
            messages = Message.objects.filter(room=room)
        
        for message in messages:
            if message.sender != request.user:
                ReadReceipt.objects.get_or_create(message=message, user=request.user)
                message.is_read = True
                message.save()
        
        return Response({"status": "messages marked as read"})

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        room_id = self.request.query_params.get("room")
        if room_id:
            # Returns all messages for the given room (assuming user is a participant)
            qs = Message.objects.filter(room_id=room_id)
            # Optionally, check that the current user is a member of the room:
            qs = qs.filter(room__users=self.request.user)
            return qs
        return Message.objects.none()
    
    def create(self, request):
        data = request.data.copy()
        data['sender'] = request.user.id
        
        # Validate room membership
        room_id = data.get('room')
        try:
            room = ChatRoom.objects.get(id=room_id, users=request.user)
        except ChatRoom.DoesNotExist:
            return Response(
                {"error": "Room not found or you're not a member"}, 
                status=status.HTTP_403_FORBIDDEN
            )
         
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Update room timestamp
        room.save()  # This triggers auto_now for updated_at
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], url_path='upload')
    def upload_file(self, request):
        # Handle file upload using the MessageSerializer
        data = request.data.copy()
        data['sender'] = request.user.id
        room_id = data.get('room')
        try:
            room = ChatRoom.objects.get(id=room_id, users=request.user)
        except ChatRoom.DoesNotExist:
            return Response({"error": "Room not found or you're not a member"}, 
                            status=status.HTTP_403_FORBIDDEN)
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        room.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

class UserSearchViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        query = self.request.query_params.get('query', '')
        if not query:
            return User.objects.none()
            
        return User.objects.filter(
            Q(username__icontains=query) |
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query) |
            Q(email__icontains=query)
        ).distinct()
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
