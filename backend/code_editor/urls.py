# backend/code_editor/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CodeFileViewSet

router = DefaultRouter()
router.register(r'code-files', CodeFileViewSet, basename='code-file')

urlpatterns = [
    path('', include(router.urls)),
]