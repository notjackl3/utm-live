from django.db import models
from django.conf import settings
import geocoder

MAPBOX_ACCESS_TOKEN = "pk.eyJ1Ijoibm90amFja2wzIiwiYSI6ImNtY3NxOWlkaDE1YXQyanEwYWI0MjZicWYifQ.TmrkcNK6jBFrQ37uJucAAg"

class Address(models.Model):
    address = models.TextField()
    lat = models.FloatField(blank=True, null=True)
    long = models.FloatField(blank=True, null=True)

    # the save method will save lat, long to any location when we create/update the address
    def save(self, *args, **kwargs):   
        g = geocoder.mapbox(self.address, key=MAPBOX_ACCESS_TOKEN)
        g = g.latlng # (lat, long)
        self.lat, self.long = g[0], g[1]
        return super(Address, self).save(*args, *kwargs)
    

class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


class Location(models.Model):
    code = models.CharField(primary_key=True, max_length=100)
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=100)
    tags = models.ManyToManyField(Tag, related_name='locations')

    def __str__(self):
        return f"{self.name} ({self.code})"
    

class Preference(models.Model):
    # use settings.AUTH_USER_MODEL because it sets to whatever the new user model is
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="preferences")
    code = models.ForeignKey(Location, on_delete=models.CASCADE, related_name="preferred_by")

    class Meta:
        unique_together = ('user', 'code') 
