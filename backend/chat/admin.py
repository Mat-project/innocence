from django.contrib import admin
from .models import ChatRoom, Message, ReadReceipt

@admin.register(ChatRoom)
class ChatRoomAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'is_group', 'created_at', 'updated_at')
    filter_horizontal = ('users',)
    list_filter = ('is_group',)
    search_fields = ('name', 'users__username')

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'room', 'sender', 'short_content', 'timestamp', 'is_read')
    list_filter = ('is_read', 'timestamp')
    search_fields = ('content', 'sender__username')
    
    def short_content(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    
    short_content.short_description = 'Content'

@admin.register(ReadReceipt)
class ReadReceiptAdmin(admin.ModelAdmin):
    list_display = ('message', 'user', 'read_at')
    list_filter = ('read_at',)
    search_fields = ('user__username',)
