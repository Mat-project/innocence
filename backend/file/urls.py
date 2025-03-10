from django.urls import path
from .views import convert_file_view

urlpatterns = [
    path("convert/", convert_file_view, name="convert_file"),
]