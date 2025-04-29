from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class PlaidItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    item_id = models.CharField(max_length=255)
    access_token = models.CharField(max_length=255)
    institution_name = models.CharField(max_length=255, blank=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.institution_name}"

class Account(models.Model):
    plaid_item = models.ForeignKey(PlaidItem, on_delete=models.CASCADE, related_name='accounts')
    account_id = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=50)
    subtype = models.CharField(max_length=50, null=True, blank=True)
    current_balance = models.DecimalField(max_digits=12, decimal_places=2, null=True)
    
    def __str__(self):
        return f"{self.name} ({self.type})"

class Transaction(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='transactions')
    transaction_id = models.CharField(max_length=255)
    date = models.DateField()
    name = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    category = models.CharField(max_length=100, null=True, blank=True)
    pending = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.name} - ${self.amount} on {self.date}"
    
    class Meta:
        ordering = ['-date']
