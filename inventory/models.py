from django.db import models
from django.conf import settings

class Medicine(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    name = models.CharField(max_length=200)
    type = models.CharField(max_length=100, blank=True)
    composition = models.TextField(blank=True)
    mfg_date = models.DateField(null=True, blank=True)
    exp_date = models.DateField()
    mrp = models.FloatField()
    buy_price = models.FloatField()
    sell_price = models.FloatField()
    stock = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

      
   

    def __str__(self):
        return self.name
