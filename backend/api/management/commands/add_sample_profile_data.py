from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from api.models import Profile
import uuid

User = get_user_model()

class Command(BaseCommand):
    help = 'Add sample data to Profile model JSONFields'

    def handle(self, *args, **kwargs):
        # Get all profiles or create one if none exists
        profiles = Profile.objects.all()
        if not profiles:
            # Create a test user if none exists
            user, created = User.objects.get_or_create(
                username='testuser',
                defaults={'email': 'test@example.com'}
            )
            if created:
                user.set_password('password')
                user.save()
                self.stdout.write(self.style.SUCCESS(f'Created test user: {user.username}'))
            
            profile = Profile.objects.create(user=user)
        else:
            profile = profiles.first()
        
        # Add sample skills
        profile.skills = [
            {
                "id": str(uuid.uuid4()),
                "name": "Python",
                "category": "technical",
                "proficiency": 9
            },
            {
                "id": str(uuid.uuid4()),
                "name": "React",
                "category": "technical",
                "proficiency": 8
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Leadership",
                "category": "soft",
                "proficiency": 7
            }
        ]
        
        # Add sample experience
        profile.experience = [
            {
                "id": str(uuid.uuid4()),
                "title": "Senior Developer",
                "company": "Tech Corp",
                "location": "San Francisco, CA",
                "start_date": "2020-01-01",
                "current": True,
                "description": "Leading development of core products."
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Junior Developer",
                "company": "Startup Inc",
                "location": "Austin, TX",
                "start_date": "2018-03-01",
                "end_date": "2019-12-31",
                "description": "Worked on frontend applications using React."
            }
        ]
        
        # Add sample education
        profile.education = [
            {
                "id": str(uuid.uuid4()),
                "institution": "Stanford University",
                "degree": "Master of Computer Science",
                "field": "Artificial Intelligence",
                "start_date": "2016-09-01",
                "end_date": "2018-06-30",
                "description": "Focused on machine learning algorithms."
            },
            {
                "id": str(uuid.uuid4()),
                "institution": "MIT",
                "degree": "Bachelor of Science",
                "field": "Computer Science",
                "start_date": "2012-09-01",
                "end_date": "2016-05-30"
            }
        ]
        
        # Add sample portfolio
        profile.portfolio = [
            {
                "id": str(uuid.uuid4()),
                "title": "E-commerce Platform",
                "description": "A full-stack e-commerce platform built with Django and React.",
                "url": "https://github.com/example/ecommerce",
                "technologies": ["Django", "React", "PostgreSQL"]
            },
            {
                "id": str(uuid.uuid4()),
                "title": "AI Image Generator",
                "description": "An AI-powered image generation tool using GANs.",
                "url": "https://example.com/ai-generator",
                "technologies": ["Python", "TensorFlow", "Flask"]
            }
        ]
        
        # Save the profile with the sample data
        profile.save()
        
        self.stdout.write(self.style.SUCCESS(f'Successfully added sample data to profile for {profile.user.username}'))
