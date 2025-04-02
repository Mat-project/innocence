from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PomodoroSessionViewSet

router = DefaultRouter()
router.register(r'sessions', PomodoroSessionViewSet, basename='pomodoro-session')

urlpatterns = [
    path('', include(router.urls)),
]