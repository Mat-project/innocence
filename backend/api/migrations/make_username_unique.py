from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('api', '0001_initial'),  # Replace with the last migration in your api app
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='username',
            field=models.CharField(blank=True, max_length=255, null=True, unique=True),
        ),
    ]
