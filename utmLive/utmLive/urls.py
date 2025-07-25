from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("", include("authentication.urls")),
    path("main/", include("app.urls")),
    path("admin/", admin.site.urls),
    path("api-auth/", include('rest_framework.urls')),
]
