from rest_framework import serializers
from .models import Location, Tag, Preference

class PreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Preference
        fields = ["user", "code"]
        read_only_fields = ["user"]
