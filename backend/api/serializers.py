from rest_framework import serializers
from .models import Profile, Skill, Experience, Education, Portfolio
from django.contrib.auth import get_user_model

User = get_user_model()

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = '__all__'

class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = ['id', 'company', 'title', 'location', 'start_date', 'end_date', 'current', 'description']

class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = ['id', 'institution', 'degree', 'field', 'start_date', 'end_date', 'description']

class PortfolioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Portfolio
        fields = '__all__'  # includes technologies now

class ProfileSerializer(serializers.ModelSerializer):
    skills = SkillSerializer(many=True, read_only=True, source="skill_items")
    experience = ExperienceSerializer(many=True, read_only=True, source="experience_items")
    education = EducationSerializer(many=True, read_only=True, source="education_items")
    portfolio = PortfolioSerializer(many=True, source="portfolio_items", required=False)

    class Meta:
        model = Profile
        fields = '__all__'

    def update(self, instance, validated_data):
        # Prevent username updates
        if 'username' in validated_data:
            validated_data.pop('username')
        
        # Extract nested data - using portfolio_items key
        portfolio_data = validated_data.pop('portfolio_items', None)
        
        # Update the base profile instance
        instance = super().update(instance, validated_data)
        
        # Process portfolio items if provided
        if portfolio_data is not None:
            try:
                # Define allowed fields
                allowed_fields = {'id', 'title', 'description', 'project_link', 'technologies', 'image'}
                
                # Get existing IDs for reference
                existing_ids = [str(p.id) for p in instance.portfolio_items.all()]
                
                for item in portfolio_data:
                    # Clean the item data
                    cleaned_item = {k: v for k, v in item.items() if k in allowed_fields}
                    
                    # Check if this is an update or create
                    item_id = cleaned_item.get('id')
                    
                    if item_id and str(item_id) in existing_ids:
                        # Update existing item
                        portfolio_obj = instance.portfolio_items.get(id=item_id)
                        for key, value in cleaned_item.items():
                            if key != 'id':  # Skip updating the ID itself
                                setattr(portfolio_obj, key, value)
                        portfolio_obj.save()
                    else:
                        # Create new item
                        item_copy = cleaned_item.copy()
                        if 'id' in item_copy:  # Don't pass ID for new objects
                            del item_copy['id']
                        instance.portfolio_items.create(**item_copy)
                        
            except Exception as e:
                # If anything goes wrong, log the error
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Error processing portfolio data: {e}")
                # Return the error to the client
                raise serializers.ValidationError({'portfolio': str(e)})
                
        return instance
