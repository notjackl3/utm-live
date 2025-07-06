import json
from django.contrib import messages
from django.http import JsonResponse
from django.shortcuts import redirect, render
from rest_framework import generics, permissions, status
from django.contrib.auth import authenticate, login
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import UserSerializer, CustomTokenObtainPairSerializer
from rest_framework import serializers
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model


def login_page(request):
    return render(request, "templates-authentication/login.html")


def signup_page(request):
    return render(request, "templates-authentication/signup.html")


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

def login_view(request):
    if request.method == "POST":
        body_unicode = request.body.decode('utf-8')
        body_data = json.loads(body_unicode)
        email = body_data.get("email")
        password = body_data.get("password")
        User = get_user_model()
        u = User.objects.get(email=email)
        
        print(f"User found: {u.email}, password hash: {u.password}")
        print("Password correct?", u.check_password(password))

        user = authenticate(request, email=email, password=password)
        if not user:
            return JsonResponse({"error": "Invalid credentials"}, status=401)
        
        login(request, user)

        refresh = RefreshToken.for_user(user)
        return JsonResponse({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        })


class UserAPI(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            login(request, user) 
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

