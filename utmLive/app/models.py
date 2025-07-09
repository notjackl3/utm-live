from django.db import models
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

