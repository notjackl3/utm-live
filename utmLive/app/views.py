from django.shortcuts import render
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response

from django.views.generic.edit import CreateView
from .models import Address

def home(request):
    return render(request, "templates-app/index.html")

class AddressView(CreateView):
    model = Address
    fields = ["address"]
    template_name = "templates-app/index.html" 
    success_url = "/"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["mapbox_access_token"] = "pk.eyJ1Ijoibm90amFja2wzIiwiYSI6ImNtY3NxOWlkaDE1YXQyanEwYWI0MjZicWYifQ.TmrkcNK6jBFrQ37uJucAAg"
        context["addresses"] = Address.objects.all()
        print(Address.objects.all().values())
        return context

class MainView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"message": f"Welcome, {request.user.email}!"})