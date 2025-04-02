from django.shortcuts import render
from django.contrib.auth import authenticate, get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework import viewsets
from rest_framework.decorators import action
from django.urls import get_resolver
import logging
import uuid
import json
from .serializers import (ProfileSerializer, SkillSerializer,
                         ExperienceSerializer, EducationSerializer,
                         PortfolioSerializer)
from .models import Profile, Skill, Experience, Education, Portfolio
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
import os

logger = logging.getLogger(__name__)
User = get_user_model()

class LoginView(APIView):
    def post(self, request):
        username_or_email = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(request, username=username_or_email, password=password)
        if user is None:
            return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
            }
        })

class RegisterView(APIView):
    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        password_confirm = request.data.get('password_confirm')
        
        # Validate passwords match
        if password != password_confirm:
            return Response({'detail': 'Passwords do not match'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if username is provided
        if not username:
            return Response({'detail': 'Username is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if username already exists in User model
        if User.objects.filter(username=username).exists():
            return Response({'detail': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if username already exists in Profile model (extra safety check)
        if Profile.objects.filter(username=username).exists():
            return Response({'detail': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if email already exists
        if User.objects.filter(email=email).exists():
            return Response({'detail': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create the user
        user = User.objects.create_user(username=username, email=email, password=password)
        
        # Create associated profile with the same username
        profile, created = Profile.objects.get_or_create(
            user=user,
            defaults={'username': username}
        )
        
        refresh = RefreshToken.for_user(user)
        return Response({
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            },
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
            }
        }, status=status.HTTP_201_CREATED)

class LogoutView(APIView):
    def post(self, request):
        # If using token blacklisting, implement it here.
        return Response({'detail': 'Logged out successfully'})

class CheckUsernameView(APIView):
    """
    API endpoint to check if a username is available
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        username = request.query_params.get('username', '')
        
        if not username:
            return Response(
                {'error': 'Username parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Check both User and Profile models
        username_exists = User.objects.filter(username=username).exists() or \
                         Profile.objects.filter(username=username).exists()
                         
        return Response({
            'username': username,
            'available': not username_exists
        })

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        profile, _ = Profile.objects.get_or_create(user=request.user)
        serializer = ProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        profile, _ = Profile.objects.get_or_create(user=request.user)
        mutable_data = request.data.copy()
        
        # Remove username from update data if present to prevent changes
        if 'username' in mutable_data:
            del mutable_data['username']
        
        section_data = {}
        
        # Extract all section data
        for section in ['portfolio_items', 'skills_items', 'education_items', 'experience_items']:
            if section in mutable_data:
                try:
                    section_data[section] = json.loads(mutable_data.pop(section))
                except (json.JSONDecodeError, TypeError) as e:
                    return Response({"error": f"Invalid {section} data format: {str(e)}"}, 
                                  status=status.HTTP_400_BAD_REQUEST)
        
        # Update main profile fields
        serializer = ProfileSerializer(profile, data=mutable_data, partial=True)
        if serializer.is_valid():
            serializer.save()
            
            # Process each section type
            if section_data:
                # Handle portfolio items
                if 'portfolio_items' in section_data:
                    self._process_section_items(
                        profile, 
                        section_data['portfolio_items'], 
                        profile.portfolio_items,
                        ['title', 'description', 'project_link', 'technologies', 'image']
                    )
                
                # Handle skills items
                if 'skills_items' in section_data:
                    self._process_section_items(
                        profile, 
                        section_data['skills_items'], 
                        profile.skill_items,
                        ['name', 'category', 'level']
                    )
                
                # Handle experience items
                if 'experience_items' in section_data:
                    self._process_section_items(
                        profile, 
                        section_data['experience_items'], 
                        profile.experience_items,
                        ['title', 'company', 'location', 'start_date', 'end_date', 'current', 'description']
                    )
                
                # Handle education items
                if 'education_items' in section_data:
                    self._process_section_items(
                        profile, 
                        section_data['education_items'],
                        profile.education_items,
                        ['institution', 'degree', 'field', 'start_date', 'end_date', 'description']
                    )
                
                # Refresh profile after all updates
                profile = Profile.objects.get(id=profile.id)
                    
            # Return the updated profile data
            return Response(ProfileSerializer(profile).data)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def _process_section_items(self, profile, items_data, model_manager, allowed_fields):
        """Helper method to process section items (portfolio, skills, etc.)"""
        existing_ids = {str(item.id) for item in model_manager.all()}
        
        for item_data in items_data:
            # Clean data to only include valid fields
            clean_data = {k: v for k, v in item_data.items() if k in allowed_fields or k == 'id'}
            
            # Handle date fields - ensure None instead of empty strings
            for date_field in ['start_date', 'end_date']:
                if date_field in clean_data and (clean_data[date_field] == "" or clean_data[date_field] is None):
                    clean_data[date_field] = None
            
            if 'id' in clean_data and str(clean_data['id']) in existing_ids:
                # Update existing item
                item_id = clean_data.pop('id')
                model_manager.filter(id=item_id).update(**clean_data)
            else:
                # Create new item
                if 'id' in clean_data:
                    del clean_data['id']  # Remove client-side ID
                model_manager.create(**clean_data)

class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        
        if not email:
            return Response({'detail': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            user = User.objects.get(email=email)
            
            # Generate password reset token
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            
            # Build reset URL (frontend URL)
            frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
            reset_url = f"{frontend_url}/reset-password/{uid}/{token}/"
            
            # Email content
            subject = "Reset your InnovSence password"
            message = f"""
            Hello {user.username},
            
            You requested a password reset for your InnovSence account.
            
            Please click the link below to set a new password:
            {reset_url}
            
            If you did not request this reset, please ignore this email.
            
            Best regards,
            The InnovSence Team
            """
            
            # Send email
            try:
                send_mail(
                    subject=subject,
                    message=message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[email],
                    fail_silently=False,
                )
                logger.info(f"Password reset email sent to {email}")
                return Response({'detail': 'Password reset instructions have been sent'}, status=status.HTTP_200_OK)
                
            except Exception as e:
                logger.error(f"Failed to send password reset email: {str(e)}")
                return Response(
                    {'detail': 'Unable to send email. Please try again later.'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
                
        except User.DoesNotExist:
            # For security reasons, still return success even if user doesn't exist
            logger.info(f"Password reset attempted for non-existent email: {email}")
            return Response({'detail': 'Password reset instructions have been sent'}, status=status.HTTP_200_OK)

class ResetPasswordView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        uid = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('new_password')
        
        if not all([uid, token, new_password]):
            return Response(
                {'detail': 'Invalid data provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
            
            # Check if token is valid
            if not default_token_generator.check_token(user, token):
                return Response(
                    {'detail': 'Invalid or expired token'},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            # Set the new password
            user.set_password(new_password)
            user.save()
            
            return Response({'detail': 'Password reset successful'})
            
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response(
                {'detail': 'Invalid reset link'},
                status=status.HTTP_400_BAD_REQUEST
            )

class ProfileDetailUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get(self, request):
        try:
            profile, created = Profile.objects.get_or_create(user=request.user)
            serializer = ProfileSerializer(profile)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.exception("Error fetching profile")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def patch(self, request):
        try:
            profile, created = Profile.objects.get_or_create(user=request.user)
            serializer = ProfileSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid(raise_exception=True):
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.exception("Error updating profile")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer

class SkillViewSet(viewsets.ModelViewSet):
    serializer_class = SkillSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        profile, _ = Profile.objects.get_or_create(user=self.request.user)
        return Skill.objects.filter(profile=profile)
    
    def perform_create(self, serializer):
        # Explicitly associate the skill with the current user's profile
        profile, _ = Profile.objects.get_or_create(user=self.request.user)
        serializer.save(profile=profile)
        
    def perform_update(self, serializer):
        # Ensure the skill remains associated with the current user's profile
        serializer.save(profile=self.request.user.profile)

class ExperienceViewSet(viewsets.ModelViewSet):
    serializer_class = ExperienceSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        profile, _ = Profile.objects.get_or_create(user=self.request.user)
        return Experience.objects.filter(profile=profile)
    
    def perform_create(self, serializer):
        # This line ensures the education entry is linked to the current user's profile
        profile, _ = Profile.objects.get_or_create(user=self.request.user)
        serializer.save(profile=profile)

class EducationViewSet(viewsets.ModelViewSet):
    serializer_class = EducationSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        profile, _ = Profile.objects.get_or_create(user=self.request.user)
        return Education.objects.filter(profile=profile)
        
    def perform_create(self, serializer):
        # This line ensures the education entry is linked to the current user's profile
        profile, _ = Profile.objects.get_or_create(user=self.request.user)
        serializer.save(profile=profile)

class PortfolioViewSet(viewsets.ModelViewSet):
    serializer_class = PortfolioSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        profile, _ = Profile.objects.get_or_create(user=self.request.user)
        return Portfolio.objects.filter(profile=profile)
        
    def perform_create(self, serializer):
        # Ensure the portfolio entry is linked to the current user's profile
        profile, _ = Profile.objects.get_or_create(user=self.request.user)
        serializer.save(profile=profile)

class APIDebugView(APIView):
    permission_classes = [AllowAny]  # Allow access without authentication
    
    def get(self, request):
        # Get all registered URLs
        resolver = get_resolver()
        url_patterns = []
        profile_urls = []
        
        def collect_urls(patterns, prefix=''):
            for pattern in patterns:
                if hasattr(pattern, 'pattern'):
                    url = prefix + str(pattern.pattern)
                    pattern_name = pattern.name if hasattr(pattern, 'name') else None
                    view_name = ""
                    if hasattr(pattern, 'callback'):
                        if hasattr(pattern.callback, '__name__'):
                            view_name = pattern.callback.__name__
                        else:
                            view_name = str(pattern.callback)
                        
                        url_data = {
                            'url': url,
                            'name': pattern_name,
                            'view': view_name,
                        }
                        url_patterns.append(url_data)
                        
                        # Collect profile-related URLs
                        if 'profile' in url:
                            profile_urls.append(url_data)
                            
                    if hasattr(pattern, 'url_patterns'):
                        collect_urls(pattern.url_patterns, url)
        
        collect_urls(resolver.url_patterns)
        
        # Get request info
        request_info = {
            'path': request.path,
            'method': request.method,
            'host': request.get_host(),
            'is_secure': request.is_secure(),
            'user': str(request.user),
            'auth': str(request.auth) if hasattr(request, 'auth') else None,
            'headers': dict(request.headers),
        }
        
        # Check if profile endpoints are registered
        profile_endpoints = {
            'skills': '/api/profile/skills/',
            'experience': '/api/profile/experience/',
            'education': '/api/profile/education/',
            'portfolio': '/api/profile/portfolio/',
        }
        
        endpoint_status = {}
        for name, path in profile_endpoints.items():
            endpoint_status[name] = any(path in pattern.get('url', '') for pattern in url_patterns)
        
        # Add authentication status
        auth_info = {
            'is_authenticated': request.user.is_authenticated,
            'user': str(request.user),
            'auth_header_present': 'Authorization' in request.headers,
        }
        
        # Return all debugging information
        debug_info = {
            'urls': url_patterns,
            'profile_urls': profile_urls,
            'request_info': request_info,
            'auth_info': auth_info,
            'profile_endpoints': profile_endpoints,
            'endpoint_status': endpoint_status,
            'total_url_count': len(url_patterns),
            'available_endpoints': ['GET /api/test/', 'GET /api/debug/', 'GET /api/auth/profile/', 'GET /api/profile/skills/']
        }
        
        return Response(debug_info)
