from django.shortcuts import render
from django.conf import settings
from .serializers import PreferenceSerializer
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.mixins import LoginRequiredMixin # remove authentication needed for just the map
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.views.generic import TemplateView
from .models import Preference
import geopandas
import json
from django.contrib.staticfiles.storage import staticfiles_storage
import geocoder

def gdf_to_json(gdf):
    features = []
    for row in gdf.itertuples():
        feature = {
            "id": row.id,
            "name": row.name,
            "type": row.type,
            "tags": row.tags,
            "code": row.code,
        }
        features.append(feature)
    return features

def home(request):
    return render(request, "templates-app/index.html")

class MapView(TemplateView):
    template_name = "templates-app/index.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["mapbox_access_token"] = settings.MAPBOX_TOKEN
        context["openweather_token"] = settings.OPENWEATHER_TOKEN
        if self.request.user.is_authenticated:
            locations = Preference.objects.filter(user=self.request.user)
            context["location_preferences"] = list(locations.values())
        return context

class ListingView(TemplateView):
    template_name = "templates-app/listing.html"

    def get_context_data(self, **kwargs):
        path = staticfiles_storage.path("static-app/utm-buildings.geojson")
        gdf = geopandas.read_file(path)
        locations = gdf_to_json(gdf)
        
        context = super().get_context_data(**kwargs)
        context["locations"] = locations
        if self.request.user.is_authenticated:
            locations = Preference.objects.filter(user=self.request.user)
            context["location_preferences"] = list(locations.values())
        return context

class PreferenceView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user 
        serializer = PreferenceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        user = request.user
        data = json.loads(request.body)
        try:
            preference = Preference.objects.get(user=user, code_id=data.get("code"))
        except Preference.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        preference.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
class SuggestionView(APIView):
    permission_classes = [IsAuthenticated]

    # WAITING TO BE IMPLEMENTED
    def post(self, request):
        user = request.user 
        print(request.data)
        print(user)
        # serializer = PreferenceSerializer(data=request.data)
        # print(serializer)
        
        # g = geocoder.mapbox(latlng, method='reverse')
        # print(g.json)
        
        