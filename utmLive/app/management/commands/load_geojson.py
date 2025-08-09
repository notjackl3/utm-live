import json
from django.core.management.base import BaseCommand
from app.models import Location, Tag


class Command(BaseCommand):
    help = "Load GeoJSON data and update Location records"

    def add_arguments(self, parser):
        parser.add_argument('file_path', type=str, help='Path to the GeoJSON file')

    def handle(self, *args, **kwargs):
        file_path = kwargs['file_path']

        with open(file_path) as f:
            geojson = json.load(f)

        for feature in geojson['features']:
            props = feature['properties']
            coords = feature['geometry']['coordinates']

            code = props['code']
            address = props.get('address', '')
            latitude = coords[1]
            longitude = coords[0]

            try:
                location = Location.objects.get(code=code)
                location.address = address
                location.latitude = latitude
                location.longitude = longitude
                location.save()
                self.stdout.write(self.style.SUCCESS(f"Updated {location}"))
            except Location.DoesNotExist:
                self.stdout.write(self.style.WARNING(f"Location with code {code} not found."))
