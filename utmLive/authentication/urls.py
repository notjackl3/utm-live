from django.contrib import admin
from django.contrib.auth import views as auth_views
from django.urls import path, include
from django.shortcuts import redirect
from . import views

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

def root_redirect(request):
    if request.user.is_authenticated:
        return redirect('/main')  
    return redirect('/login')

urlpatterns = [
    path("", root_redirect, name="root-redirect"),
    path("login/", views.login_page, name="login-screen"),
    path("login-user/", views.login_view, name="login-user"),
    path("logout/", auth_views.LogoutView.as_view(next_page="/"), name="logout_screen"),
    path("signup/", views.signup_page, name="signup-screen"),
    path("api/token/", views.CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/user/", views.UserAPI.as_view(), name="user-api")
]