from django.urls import path
from .views import ReportPreviewView, ReportGenerateView

urlpatterns = [
    path('preview/', ReportPreviewView.as_view(), name='report-preview'),
    path('generate/', ReportGenerateView.as_view(), name='report-generate'),
]
