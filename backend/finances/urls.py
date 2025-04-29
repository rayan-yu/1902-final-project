from django.urls import path
from .views import (
    CreateLinkToken,
    ExchangePublicToken,
    AccountsList,
    TransactionsList,
    UnlinkAccount,
    UnlinkAllAccounts
)

urlpatterns = [
    # Plaid integration endpoints
    path('link-token/', CreateLinkToken.as_view(), name='create_link_token'),
    path('exchange-token/', ExchangePublicToken.as_view(), name='exchange_token'),
    
    # Data retrieval endpoints
    path('accounts/', AccountsList.as_view(), name='accounts_list'),
    path('transactions/', TransactionsList.as_view(), name='transactions_list'),
    
    # Account management endpoints
    path('accounts/<int:account_id>/unlink/', UnlinkAccount.as_view(), name='unlink_account'),
    path('accounts/unlink-all/', UnlinkAllAccounts.as_view(), name='unlink_all_accounts'),
] 