from django.urls import path
from .views import (
    CreateLinkToken,
    ExchangePublicToken,
    AccountsList,
    TransactionsList
)

urlpatterns = [
    # Plaid integration endpoints
    path('link-token/', CreateLinkToken.as_view(), name='create_link_token'),
    path('exchange-token/', ExchangePublicToken.as_view(), name='exchange_token'),
    
    # Data retrieval endpoints
    path('accounts/', AccountsList.as_view(), name='accounts_list'),
    path('transactions/', TransactionsList.as_view(), name='transactions_list'),
] 