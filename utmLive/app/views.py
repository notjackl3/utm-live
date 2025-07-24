from django.shortcuts import render
from .serializers import PreferenceSerializer
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.mixins import LoginRequiredMixin
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response

from django.views.generic.edit import CreateView

from .models import Address

def home(request):
    return render(request, "templates-app/index.html")

class AddressView(LoginRequiredMixin, CreateView):
    model = Address
    fields = ["address"]
    template_name = "templates-app/index.html" 
    success_url = "/"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["mapbox_access_token"] = "pk.eyJ1Ijoibm90amFja2wzIiwiYSI6ImNtY3NxOWlkaDE1YXQyanEwYWI0MjZicWYifQ.TmrkcNK6jBFrQ37uJucAAg"
        context["addresses"] = Address.objects.all()
        return context

class Preference(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user 
        serializer = PreferenceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
