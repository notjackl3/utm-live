import os
import sys
import django
import json

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'utmLive.settings')
django.setup()

from app.models import Locations, Tag

with open('utmLive/app/static/static-app/utm-live.geojson', 'r') as f:
    data = json.load(f)
    for item in data["features"]:
        properties = item["properties"]
        raw_tags = properties.get("tags", "")
        tags_list = [tag.strip() for tag in raw_tags.split(",") if tag.strip()]

        tags = [Tag.objects.get_or_create(name=tag)[0] for tag in tags_list]
        
        location = Locations.objects.create(name=properties["name"],
                                 code=properties["code"],
                                 type=properties["type"])

        location.tags.set(tags)