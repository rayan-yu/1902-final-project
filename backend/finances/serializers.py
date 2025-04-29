from rest_framework import serializers
from .models import PlaidItem, Account, Transaction

class PlaidItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlaidItem
        fields = ['id', 'institution_name']
        read_only_fields = ['id', 'institution_name']

class AccountSerializer(serializers.ModelSerializer):
    institution_name = serializers.CharField(source='plaid_item.institution_name', read_only=True)
    
    class Meta:
        model = Account
        fields = ['id', 'name', 'type', 'subtype', 'current_balance', 'institution_name']
        read_only_fields = ['id', 'name', 'type', 'subtype', 'current_balance', 'institution_name']

class TransactionSerializer(serializers.ModelSerializer):
    account_name = serializers.CharField(source='account.name', read_only=True)
    institution_name = serializers.CharField(source='account.plaid_item.institution_name', read_only=True)
    
    class Meta:
        model = Transaction
        fields = ['id', 'transaction_id', 'date', 'name', 'amount', 'category', 'pending', 'account_name', 'institution_name']
        read_only_fields = ['id', 'transaction_id', 'date', 'name', 'amount', 'category', 'pending', 'account_name', 'institution_name'] 