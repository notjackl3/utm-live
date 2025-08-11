from rest_framework import serializers
from .models import Location, Tag, Preference, Suggestion

class PreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Preference
        fields = ["user", "code"]
        read_only_fields = ["user"]

class SuggestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Suggestion
        fields = ["user", "name", "latitude", "longitude"]
        read_only_fields = ["user"]
