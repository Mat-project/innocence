from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from .models import Profile

class TestView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        return Response({
            "status": "ok",
            "message": "API endpoint is working!"
        })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_test(request):
    """Test endpoint to check profile data access"""
    try:
        profile = Profile.objects.get(user=request.user)
        return Response({
            "user_id": request.user.id,
            "username": request.user.username,
            "profile_data": {
                "skills_count": len(profile.skills or []),
                "experience_count": len(profile.experience or []),
                "education_count": len(profile.education or []),
                "portfolio_count": len(profile.portfolio or []),
            }
        })
    except Exception as e:
        return Response({"error": str(e)})
