from django.urls import path, include
from django.contrib.auth import views as auth_views
from . import views

urlpatterns = [
    path("", views.MapView.as_view(), name="main"),
    path("list/", views.ListingView.as_view(), name="listing"),
    path("preferences/", views.PreferenceView.as_view(), name="preferences"),
    path("suggestions/", views.SuggestionView.as_view(), name="suggestions"),
]
