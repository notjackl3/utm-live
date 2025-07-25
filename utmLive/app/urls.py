from django.urls import path, include
from django.contrib.auth import views as auth_views
from . import views

urlpatterns = [
    path("", views.AddressView.as_view(), name="main"),
    path("preferences/", views.PreferenceView.as_view(), name="preferences"),
]
