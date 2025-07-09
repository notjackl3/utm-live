from django.urls import path, include
from django.contrib.auth import views as auth_views
from .views import AddressView

urlpatterns = [
    path("", AddressView.as_view(), name="main"),
]
