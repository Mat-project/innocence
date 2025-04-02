from django.core.management.base import BaseCommand
from api.models import Profile
import uuid
import json
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Repairs and validates profile JSON data fields'

    def handle(self, *args, **kwargs):
        self.stdout.write("Checking profile data...")
        profiles = Profile.objects.all()
        
        count = 0
        for profile in profiles:
            fixed = False
            
            # Ensure skills is a proper list
            if profile.skills is None:
                profile.skills = []
                fixed = True
            elif not isinstance(profile.skills, list):
                try:
                    if isinstance(profile.skills, str):
                        profile.skills = json.loads(profile.skills)
                    else:
                        profile.skills = []
                    fixed = True
                except:
                    profile.skills = []
                    fixed = True
            
            # Ensure experience is a proper list  
            if profile.experience is None:
                profile.experience = []
                fixed = True
            elif not isinstance(profile.experience, list):
                try:
                    if isinstance(profile.experience, str):
                        profile.experience = json.loads(profile.experience)
                    else:
                        profile.experience = []
                    fixed = True
                except:
                    profile.experience = []
                    fixed = True
                    
            # Ensure education is a proper list
            if profile.education is None:
                profile.education = []
                fixed = True
            elif not isinstance(profile.education, list):
                try:
                    if isinstance(profile.education, str):
                        profile.education = json.loads(profile.education)
                    else:
                        profile.education = []
                    fixed = True
                except:
                    profile.education = []
                    fixed = True
                    
            # Ensure portfolio is a proper list
            if profile.portfolio is None:
                profile.portfolio = []
                fixed = True
            elif not isinstance(profile.portfolio, list):
                try:
                    if isinstance(profile.portfolio, str):
                        profile.portfolio = json.loads(profile.portfolio)
                    else:
                        profile.portfolio = []
                    fixed = True
                except:
                    profile.portfolio = []
                    fixed = True
            
            # Fix IDs in all items
            for field_items in [profile.skills, profile.experience, profile.education, profile.portfolio]:
                if isinstance(field_items, list):
                    for item in field_items:
                        if isinstance(item, dict) and 'id' not in item:
                            item['id'] = str(uuid.uuid4())
                            fixed = True
            
            # Save if any changes were made
            if fixed:
                count += 1
                profile.save()
                self.stdout.write(f"Fixed data for profile: {profile.user.username}")
        
        self.stdout.write(self.style.SUCCESS(f"Checked {profiles.count()} profiles, fixed {count} profiles"))
