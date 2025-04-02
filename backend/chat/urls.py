from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ChatRoomViewSet, MessageViewSet, UserSearchViewSet

router = DefaultRouter()
router.register('rooms', ChatRoomViewSet, basename='room')
router.register('messages', MessageViewSet, basename='message')
router.register('users', UserSearchViewSet, basename='users')

urlpatterns = [
    path('', include(router.urls)),
]