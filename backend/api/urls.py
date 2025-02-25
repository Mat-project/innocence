# Python
from django.urls import path
from .views import LoginView, RegisterView, LogoutView, ProfileView, ForgotPasswordView

urlpatterns = [
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/profile/', ProfileView.as_view(), name='profile'),
    path('auth/forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
]