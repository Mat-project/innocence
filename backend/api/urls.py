from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    LoginView,
    RegisterView,
    LogoutView,
    ProfileView,
    ForgotPasswordView,
    ResetPasswordView,
    ProfileDetailUpdateView,
    APIDebugView,
    ExperienceViewSet,
    EducationViewSet,
    PortfolioViewSet,
    ProfileViewSet,
    CheckUsernameView
)
from .skill_views import SkillViewSet
from .test_view import TestView, profile_test
from .views_portfolio_page import PortfolioPageView

router = DefaultRouter()
router.register(r'profile', ProfileViewSet)
router.register(r'skills', SkillViewSet, basename='skill')
router.register(r'experience', ExperienceViewSet, basename='experience')
router.register(r'education', EducationViewSet, basename='education')
router.register(r'portfolio', PortfolioViewSet, basename='portfolio')

urlpatterns = [
    # Test endpoint
    path('test/', TestView.as_view(), name='api-test'),
    path('profile/test/', profile_test, name='profile-test'),
    
    # Authentication endpoints
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/profile/', ProfileView.as_view(), name='profile'),
    path('auth/forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('auth/reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    path("auth/profile-detail-update/", ProfileDetailUpdateView.as_view(), name="profile-detail-update"),
    path('auth/check-username/', CheckUsernameView.as_view(), name='check-username'),
    
    # Include router URLs
    path('', include(router.urls)),
    
    # Debug endpoint
    path('debug/', APIDebugView.as_view(), name='api-debug'),

    # Portfolio page endpoint
    path('portfolio-page/', PortfolioPageView.as_view(), name='portfolio_page'),
]