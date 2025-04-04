from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Include API routes - remove duplicates and direct_urls
    path('api/', include('api.urls')),

    
    # Other API endpoints with more specific paths to avoid conflicts
    path('api/tasks/', include('task.urls')),
    path('api/notifications/', include('notification.urls')),
    path('api/file/', include('file.urls')),  # Use specific prefix
    path('api/chat/', include('chat.urls')),  # Include file app URLs under the "api/" prefix
    path('api/habit/', include('habit.urls')),
    path('api/pomodoro/', include('pomodoro.urls')),
    path('api/code-editor/', include('code_editor.urls')),
    path('api/notes/', include('notes.urls')),
    path('api/dashboard/', include('dashboard.urls')),

]

# Add media URL configuration
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
