from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Profile
from .serializers import PortfolioSerializer
import logging

logger = logging.getLogger(__name__)

class PortfolioPageView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            profile = Profile.objects.get(user=request.user)
            portfolio = profile.portfolio or []
            serializer = PortfolioSerializer(portfolio, many=True)
            formatted_data = {
                "portfolio_count": len(portfolio),
                "projects": serializer.data,
                "message": "Welcome to your New Portfolio Page Format"
            }
            return Response(formatted_data)
        except Exception as e:
            logger.exception("Error fetching portfolio page")
            return Response({"error": str(e)}, status=500)
