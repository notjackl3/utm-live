# Generated by Django 5.2.4 on 2025-07-21 10:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0002_locations_preferences'),
    ]

    operations = [
        migrations.CreateModel(
            name='Tag',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50, unique=True)),
            ],
        ),
        migrations.AddField(
            model_name='locations',
            name='tags',
            field=models.ManyToManyField(related_name='locations', to='app.tag'),
        ),
    ]
