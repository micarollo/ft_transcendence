# Generated by Django 5.1 on 2024-10-23 12:17

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Profile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('avatar', models.ImageField(blank=True, upload_to='avatars/')),
                ('avatar_url', models.URLField(blank=True)),
                ('campus_name', models.CharField(blank=True, max_length=100)),
                ('display_name', models.CharField(blank=True, max_length=100)),
                ('kind', models.CharField(blank=True, max_length=42)),
                ('language', models.CharField(blank=True, max_length=42)),
                ('language_id', models.CharField(blank=True, max_length=10)),
                ('time_zone', models.CharField(blank=True, max_length=84)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
