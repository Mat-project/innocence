from django.urls import path
from . import views

urlpatterns = [
    path('test/', views.test_view, name='test_view'),
    path('convert/', views.convert_file_view, name='convert_file'),
]